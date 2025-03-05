
import { FileType, FolderType, FilesResponse, FoldersResponse, ApiResponse, ProgressCallback, ErrorCallback, UploadResult } from '@/types';
import { uploadAndProcessFile } from '@/lib/upload-handler';

/**
 * Fetch all files belonging to the current user
 */
export async function fetchUserFiles(): Promise<FileType[]> {
  try {
    const response = await fetch('/api/files');
    if (!response.ok) {
      throw new Error(`Error fetching files: Status ${response.status}`);
    }
    const data: FilesResponse = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
}

/**
 * Fetch all folders belonging to the current user
 */
export async function fetchUserFolders(): Promise<FolderType[]> {
  try {
    const response = await fetch('/api/folders');
    if (!response.ok) {
      throw new Error(`Error fetching folders: Status ${response.status}`);
    }
    const data: FoldersResponse = await response.json();
    return data.folders || [];
  } catch (error) {
    console.error("Error fetching folders:", error);
    throw error;
  }
}

/**
 * Create a new folder
 */
export async function createFolder(name: string, parentId?: string): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, parentId }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unknown error");
    }
    
    return { success: true, message: `Folder "${name}" created` };
  } catch (error) {
    console.error("Error creating folder:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create folder" 
    };
  }
}

/**
 * Move multiple files to a different folder
 */
export async function moveFilesToFolder(fileIds: string[], targetFolderId: string): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/move-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileIds,
        targetFolderId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error");
    }
    
    return { success: true, message: "Files moved successfully" };
  } catch (error) {
    console.error("Error moving files:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Could not move files" 
    };
  }
}

/**
 * Delete a single file
 */
export async function deleteFile(fileId: string): Promise<ApiResponse> {
  return deleteFiles([fileId]);
}

/**
 * Delete multiple files
 */
export async function deleteFiles(fileIds: string[]): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/files', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileIds }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error");
    }
    
    return { 
      success: true, 
      message: fileIds.length > 1 ? "Files deleted successfully" : "File deleted successfully" 
    };
  } catch (error) {
    console.error("Error deleting files:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Could not delete files" 
    };
  }
}

/**
 * Upload a file and process it for transcription
 */
export async function uploadFile(
  file: File, 
  folderId: string | null, 
  onProgress?: ProgressCallback, 
  onError?: ErrorCallback
): Promise<UploadResult> {
  try {
    return await uploadAndProcessFile(
      file,
      folderId,
      onProgress,
      onError
    );
  } catch (error) {
    console.error("Error in file upload:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error("Unknown upload error") 
    };
  }
}
