// 기본 서비스 클래스 (Clean Architecture 적용)
import { prisma } from "@/lib/prisma"
import { getActiveFilter, markAsDeleted, getCurrentUnixTime } from "@/lib/func"

export abstract class BaseService<T, CreateT, UpdateT> {
  protected abstract tableName: string

  /**
   * 활성 상태 레코드 조회 (Soft Delete 제외)
   */
  protected getActiveRecords(memberIdx: number, additionalWhere: any = {}) {
    return (prisma as any)[this.tableName].findMany({
      where: {
        memberIdx,
        ...getActiveFilter(),
        ...additionalWhere,
      },
      orderBy: {
        regDate: "desc",
      },
    })
  }

  /**
   * ID로 활성 상태 레코드 조회
   */
  protected getActiveRecordById(id: number | string, memberIdx?: number) {
    const where: any = {
      id,
      ...getActiveFilter(),
    }

    if (memberIdx !== undefined) {
      where.memberIdx = memberIdx
    }

    return (prisma as any)[this.tableName].findFirst({
      where,
    })
  }

  /**
   * Soft Delete 처리
   */
  protected softDelete(id: number | string, memberIdx?: number) {
    const where: any = { id }

    if (memberIdx !== undefined) {
      where.memberIdx = memberIdx
    }

    return (prisma as any)[this.tableName].update({
      where,
      data: markAsDeleted(),
    })
  }

  /**
   * 레코드 생성
   */
  protected createRecord(data: CreateT & { memberIdx: number }) {
    return (prisma as any)[this.tableName].create({
      data: {
        ...data,
        regDate: getCurrentUnixTime(),
        mdyDate: getCurrentUnixTime(),
      },
    })
  }

  /**
   * 레코드 업데이트
   */
  protected updateRecord(id: number | string, data: Partial<UpdateT>, memberIdx?: number) {
    const where: any = { id }

    if (memberIdx !== undefined) {
      where.memberIdx = memberIdx
    }

    return (prisma as any)[this.tableName].update({
      where,
      data: {
        ...data,
        mdyDate: getCurrentUnixTime(),
      },
    })
  }

  /**
   * 페이지네이션 조회
   */
  protected getPaginatedRecords(
    memberIdx: number,
    page = 1,
    limit = 20,
    additionalWhere: any = {},
    orderBy: any = { regDate: "desc" },
  ) {
    const offset = (page - 1) * limit

    return Promise.all([
      (prisma as any)[this.tableName].findMany({
        where: {
          memberIdx,
          ...getActiveFilter(),
          ...additionalWhere,
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      (prisma as any)[this.tableName].count({
        where: {
          memberIdx,
          ...getActiveFilter(),
          ...additionalWhere,
        },
      }),
    ])
  }

  /**
   * 검색 조회
   */
  protected searchRecords(memberIdx: number, searchFields: string[], query: string, page = 1, limit = 20) {
    const searchConditions = searchFields.map((field) => ({
      [field]: {
        contains: query,
        mode: "insensitive" as const,
      },
    }))

    return this.getPaginatedRecords(memberIdx, page, limit, {
      OR: searchConditions,
    })
  }
}
