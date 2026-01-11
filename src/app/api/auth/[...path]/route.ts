import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const API_BASE_URL = "/"

/*
 *
 * if you not use rewrites in next config
 * you can use this proxy, else you can delete this file
 *
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const pathString = path.join("/")
  const searchParams = request.nextUrl.searchParams
  const queryString = searchParams.toString()

  const url = new URL(`${API_BASE_URL}/${pathString}`)
  if (queryString) {
    url.search = queryString
  }

  const token = request.cookies.get("oauth/token")?.value

  const headers = new Headers()
  if (token) {
    headers.append("Authorization", `Bearer ${token}`)
  }

  try {
    const response = await fetch(url, {
      headers,
      body: request.method !== "GET" ? await request.text() : undefined,
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  }
  catch (_error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, params, "POST")
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, params, "PUT")
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, params, "DELETE")
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, params, "PATCH")
}

async function handleRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string,
) {
  const { path } = await params
  const pathString = path.join("/")
  const searchParams = request.nextUrl.searchParams
  const queryString = searchParams.toString()

  const url = new URL(`${API_BASE_URL}/${pathString}`)
  if (queryString) {
    url.search = queryString
  }

  try {
    const token = request.cookies.get("oauth/token")?.value

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: await request.text(),
    })

    const data = await response.json()

    const responseData = NextResponse.json(data, { status: response.status })

    if (data.data?.token) {
      responseData.cookies.set("oauth/token", data.data?.token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 hari
      })
    }

    return responseData
  }
  catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ error: "Proxy request failed" }, { status: 500 })
  }
}
