import { NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || "{}"),
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "")

export async function GET(request: Request) {
  try {
    // Configure CORS for the bucket
    await bucket.setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        origin: ["*"], // In production, you should restrict this to specific domains
        responseHeader: [
          "Content-Type",
          "Content-Length",
          "Content-Encoding",
          "Content-Disposition",
          "Cache-Control",
          "x-goog-meta-*",
          "Access-Control-Allow-Origin"
        ],
      },
    ])

    return NextResponse.json({
      success: true,
      message: "CORS configuration updated successfully",
    })
  } catch (error) {
    console.error("Error configuring CORS:", error)
    return NextResponse.json(
      { 
        error: "Failed to configure CORS",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}