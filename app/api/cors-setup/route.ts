import { NextResponse } from "next/server"
import { configureGCPBucketCORS } from "@/lib/cors-helper"

// This endpoint allows you to manually set up CORS for the Google Cloud Storage bucket
export async function GET(request: Request) {
  try {
    const result = await configureGCPBucketCORS()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "CORS configuration updated successfully for GCP bucket",
      })
    } else {
      return NextResponse.json(
        { 
          error: "Failed to configure CORS",
          details: result.error 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in CORS setup endpoint:", error)
    return NextResponse.json(
      { 
        error: "Failed to configure CORS",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}