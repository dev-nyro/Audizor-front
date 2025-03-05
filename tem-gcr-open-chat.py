import os
import re
import json
import asyncio
import nest_asyncio
import pandas as pd
import numpy as np
import textwrap
import requests

from flask import jsonify, request
import functions_framework  # Functions Framework para Cloud Functions 2ª gen

from google.cloud import storage
import google.generativeai as genai
import kdbai_client as kdbai
from sentence_transformers import SentenceTransformer

# Permitir que asyncio funcione en este entorno
nest_asyncio.apply()

# -------------------------
# Configuraciones Globales
# -------------------------
# Estas variables se deben definir como variables de entorno en el servicio.
KDBAI_ENDPOINT = os.environ.get("KDBAI_ENDPOINT", "https://cloud.kdb.ai/instance/jqqmmr2fy7")
KDBAI_API_KEY   = os.environ.get("KDBAI_API_KEY", "TU_KDBAI_API_KEY")
GOOGLE_API_KEY  = os.environ.get("GOOGLE_API_KEY", "TU_GOOGLE_API_KEY")
# BUCKET_NAME no se usará en este caso porque descargamos vía enlace
# pero puedes mantenerla para otros fines si lo deseas.

# Conexión a KDB.AI
session = kdbai.Session(endpoint=KDBAI_ENDPOINT, api_key=KDBAI_API_KEY)
db = session.database('default')
print("Connected to KDB.AI. Existing tables:", db.tables)

# Configurar Gemini
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel(model_name="gemini-2.0-flash")
print("Gemini model loaded:", model)

# Modelo de embeddings
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# -------------------------
# Funciones Auxiliares
# -------------------------
def download_file_from_link(link: str) -> str:
    """
    Descarga el contenido de un archivo dado un enlace HTTP.
    Se espera que el contenido sea texto (por ejemplo, JSON).
    """
    response = requests.get(link)
    response.raise_for_status()
    return response.text

async def process_transcript_async(transcript: str, base_id: str) -> list:
    """
    Envía el transcript completo a Gemini para generar chunks,
    procurando no cortar oraciones a la mitad.
    Se utiliza un prompt que delimita los chunks y se asigna un id base.
    """
    CHUNKING_PROMPT = (
        "Divide el siguiente transcript en secciones de entre 250 y 1000 palabras. "
        "Asegúrate de que cada sección contenga oraciones completas y que ninguna oración se corte a la mitad. "
        "Si una oración se extiende más allá del límite, inclúyela completa en el chunk y ajusta el tamaño según sea necesario. "
        "Surround each chunk with <chunk> and </chunk> HTML tags. "
        "Asegúrate de incluir todo el contenido del transcript."
    )
    full_prompt = f"{CHUNKING_PROMPT}\n\n{transcript}"
    
    loop = asyncio.get_running_loop()
    try:
        def _sync_generate_content():
            return model.generate_content(
                [{"text": full_prompt}],
                request_options={"timeout": 1000}
            )
        resp = await asyncio.wait_for(loop.run_in_executor(None, _sync_generate_content), timeout=60)
        text_out = resp.text
    except Exception as e:
        print(f"Error processing transcript: {e}")
        return []
    
    # Extraer chunks delimitados por <chunk> y </chunk>
    chunks = re.findall(r"<chunk>(.*?)</chunk>", text_out, re.DOTALL)
    if not chunks:
        chunks = [c.strip() for c in text_out.split("\n\n") if c.strip()]
    
    results = []
    for idx, chunk_txt in enumerate(chunks):
        results.append({
            "id": f"{base_id}_chunk_{idx}",
            "chunk_text": chunk_txt.strip()
        })
    print(f"Extracted {len(results)} chunks from transcript {base_id}.")
    return results

def generate_embeddings_and_store(all_chunks: list, table_id: str) -> int:
    """
    Calcula los embeddings de los chunks y los almacena en KDB.AI.
    Se crea una tabla con el nombre igual a table_id (que corresponde al id_transcript).
    Retorna el número de chunks insertados.
    """
    chunk_texts = [entry["chunk_text"] for entry in all_chunks]
    chunk_embeddings = embedding_model.encode(chunk_texts)
    chunk_embeddings = np.array(chunk_embeddings, dtype=np.float32)
    
    data_list = []
    for idx, entry in enumerate(all_chunks):
        data_list.append({
            "id": entry["id"],
            "chunk_text": entry["chunk_text"],
            "vectors": chunk_embeddings[idx].tolist()
        })
    
    data_df = pd.DataFrame(data_list)
    VECTOR_DIM = 384
    schema = [
        {"name": "id", "type": "str"},
        {"name": "chunk_text", "type": "str"},
        {"name": "vectors", "type": "float32s"}
    ]
    indexes = [{
        "name": "flat_index",
        "type": "flat",
        "column": "vectors",
        "params": {"dims": VECTOR_DIM, "metric": "L2"}
    }]
    
    table_name = table_id
    # Comprobar si la tabla ya existe en KDB.AI
    if table_name in db.tables:
        print(f"Tabla '{table_name}' ya existe.")
        return 0  # No se procesa nada
    # Si no existe, se crea la tabla y se insertan los datos.
    try:
        db.table(table_name).drop()  # Por si existe (aunque nuestro if lo previene)
    except kdbai.KDBAIException:
        pass
    
    table = db.create_table(table_name, schema=schema, indexes=indexes)
    table.insert(data_df)
    print(f"Created table '{table_name}' in KDB.AI and inserted {len(data_df)} chunks.")
    return len(data_df)

# -------------------------
# Endpoint Principal (Entry Point)
# -------------------------
@functions_framework.http
def main(request):
    """
    Entry point para Cloud Functions (2ª generación) mediante Functions Framework.
    Se espera recibir un JSON con:
      - id_transcripts: vector de strings (o un string) que se usarán como nombre de tabla.
      - id_links: vector de strings (o un string) con los enlaces de descarga.
    
    Para cada par, se busca si la tabla ya existe en KDB.AI; si no, se descarga el archivo,
    se procesa el transcript, se generan los chunks, se calculan los embeddings y se almacena en KDB.AI.
    Al finalizar, se imprime "Todos los archivos procesados".
    """
    req_json = request.get_json(silent=True)
    if not req_json:
        return jsonify({"status": "error", "message": "No JSON payload received"}), 400
    
    # Extraer parámetros y asegurarse de trabajar con listas.
    id_transcripts = req_json.get("id_transcripts")
    id_links = req_json.get("id_links")
    
    if not id_transcripts or not id_links:
        return jsonify({"status": "error", "message": "Missing id_transcripts or id_links"}), 400
    
    # Si se envía un solo string, convertirlo a lista.
    if isinstance(id_transcripts, str):
        id_transcripts = [id_transcripts]
    if isinstance(id_links, str):
        id_links = [id_links]
    
    # Comprobar que ambos vectores tengan la misma longitud.
    if len(id_transcripts) != len(id_links):
        return jsonify({"status": "error", "message": "id_transcripts and id_links must have the same length"}), 400
    
    processed_count = 0
    total = len(id_transcripts)
    
    # Iterar sobre cada par (id_transcript, id_link)
    for transcript_id, link in zip(id_transcripts, id_links):
        print(f"Procesando transcript {transcript_id} con enlace {link}")
        # Verificar si la tabla ya existe en KDB.AI
        if transcript_id in db.tables:
            print(f"Tabla '{transcript_id}' ya existe. Se omite el procesamiento.")
            continue
        
        try:
            # Descargar el contenido del archivo a partir del enlace
            file_contents = download_file_from_link(link)
            # Se asume que el archivo es un JSON con el campo "segments"
            data = json.loads(file_contents)
            transcript_text = " ".join(segment["text"] for segment in data["segments"])
            print(f"Transcript '{transcript_id}' descargado y concatenado.")
            
            # Procesar transcript para generar chunks
            all_chunks = asyncio.run(process_transcript_async(transcript_text, transcript_id))
            # Calcular embeddings y almacenar en KDB.AI
            num_chunks = generate_embeddings_and_store(all_chunks, transcript_id)
            processed_count += 1
        except Exception as e:
            print(f"Error procesando {transcript_id}: {e}")
    
    print("Todos los archivos procesados.")
    return jsonify({
        "status": "success",
        "message": f"Processed {processed_count} out of {total} transcripts."
    }), 200
