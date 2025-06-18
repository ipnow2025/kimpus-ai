import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/database"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const dbStatus = await checkDatabaseConnection()

    const healthStatus = {
      status: dbStatus ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      version: "1.0.0",
      message: dbStatus ? "StudyFlow API is running with MySQL" : "Database connection issue",
      database: dbStatus ? "connected" : "disconnected",
      orm: "Direct MySQL",
    }

    return NextResponse.json(healthStatus, {
      status: dbStatus ? 200 : 503,
    })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        environment: process.env.NODE_ENV || "unknown",
        version: "1.0.0",
        orm: "Direct MySQL",
      },
      { status: 503 },
    )
  }
}
