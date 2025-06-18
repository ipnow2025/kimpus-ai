import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "./database"

// API 에러 타입 정의
export interface ApiError {
  message: string
  code?: string
  statusCode: number
  details?: any
}

// 커스텀 에러 클래스
export class ApiException extends Error {
  public statusCode: number
  public code?: string
  public details?: any

  constructor(message: string, statusCode = 500, code?: string, details?: any) {
    super(message)
    this.name = "ApiException"
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

// API 래퍼 함수 (데이터베이스 연결 없이도 작동)
export function withApiHandler(handler: (req: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // 데이터베이스 연결이 필요한 경우에만 초기화
      if (req.url.includes("/api/") && !req.url.includes("/api/test") && !req.url.includes("/api/health")) {
        try {
          await initializeDatabase()
        } catch (dbError) {
          console.error("Database initialization failed in API handler:", dbError)
          return NextResponse.json(
            {
              error: "Database connection failed",
              message: "Unable to connect to the database. Please try again later.",
              details: process.env.NODE_ENV === "development" ? dbError : undefined,
            },
            { status: 503 },
          )
        }
      }

      // 실제 핸들러 실행
      return await handler(req, context)
    } catch (error) {
      console.error("API Error:", error)

      // ApiException 처리
      if (error instanceof ApiException) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            details: process.env.NODE_ENV === "development" ? error.details : undefined,
          },
          { status: error.statusCode },
        )
      }

      // 일반 에러 처리
      const message = error instanceof Error ? error.message : "Internal server error"
      return NextResponse.json(
        {
          error: message,
          message: "An unexpected error occurred",
          details: process.env.NODE_ENV === "development" ? error : undefined,
        },
        { status: 500 },
      )
    }
  }
}

// 입력 검증 헬퍼
export function validateRequired(data: any, fields: string[]): void {
  const missingFields = fields.filter((field) => {
    const value = data[field]
    return value === undefined || value === null || (typeof value === "string" && value.trim() === "")
  })

  if (missingFields.length > 0) {
    throw new ApiException(`Missing required fields: ${missingFields.join(", ")}`, 400, "VALIDATION_ERROR", {
      missingFields,
    })
  }
}

// 숫자 검증 헬퍼
export function validateNumber(value: any, fieldName: string): number {
  const num = Number(value)
  if (isNaN(num)) {
    throw new ApiException(`${fieldName} must be a valid number`, 400, "VALIDATION_ERROR")
  }
  return num
}

// 날짜 검증 헬퍼
export function validateDate(value: any, fieldName: string): Date {
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    throw new ApiException(`${fieldName} must be a valid date`, 400, "VALIDATION_ERROR")
  }
  return date
}

// 열거형 검증 헬퍼
export function validateEnum<T>(value: any, enumObject: T, fieldName: string): T[keyof T] {
  const validValues = Object.values(enumObject as any)
  if (!validValues.includes(value)) {
    throw new ApiException(`${fieldName} must be one of: ${validValues.join(", ")}`, 400, "VALIDATION_ERROR", {
      validValues,
    })
  }
  return value
}
