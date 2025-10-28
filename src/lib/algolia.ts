"use client"

import { algoliasearch } from "algoliasearch"

let cachedClient: any = null

// Algolia 클라이언트 초기화
export function getAlgoliaClient() {
  if (cachedClient) {
    return cachedClient
  }

  const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID
  const API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY

  if (!APP_ID || !API_KEY) {
    console.warn("Algolia credentials not found")
    return null
  }

  try {
    cachedClient = algoliasearch(APP_ID, API_KEY)
    return cachedClient
  } catch (error) {
    console.error("Failed to initialize Algolia client:", error)
    return null
  }
}

export interface AlgoliaSearchParams {
  query: string
  hitsPerPage?: number
  page?: number
}

export interface AlgoliaSearchResponse<T> {
  hits: T[]
  nbHits: number
  page: number
  nbPages: number
  hitsPerPage: number
  processingTimeMS: number
  query: string
}

// 검색 함수 - 기존 프로젝트와 동일한 방식
export async function searchAlgoliaIndex<T = any>(
  indexName: string,
  params: AlgoliaSearchParams
): Promise<AlgoliaSearchResponse<T>> {
  const client = getAlgoliaClient()
  
  if (!client) {
    throw new Error("Algolia client not initialized")
  }

  // searchSingleIndex 사용 (기존 프로젝트 방식)
  const searchResult = await client.searchSingleIndex({
    indexName: indexName,
    searchParams: {
      query: params.query,
      hitsPerPage: params.hitsPerPage || 5,
      page: params.page || 0,
    },
  })

  return searchResult as AlgoliaSearchResponse<T>
}
