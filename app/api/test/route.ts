import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    return NextResponse.json({
      status: "success",
      message: "StudyFlow API is working",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      features: ["Assignment Management", "Schedule Management", "Statistics", "AI Assistant", "Course Management"],
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "API test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
