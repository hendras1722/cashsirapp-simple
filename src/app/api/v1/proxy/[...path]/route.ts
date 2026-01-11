import { type NextRequest, NextResponse } from "next/server";

/*
 *
 * if you not use rewrites in next config
 * you can use this proxy, else you can delete this file
 *
 */

const API_BASE_URL      = "https://auth.syahendra.com/v1/auth";
const TOKEN_COOKIE_NAME = "oauth/token";

interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * Handle all HTTP methods for the proxy
 */
async function handleRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
): Promise<NextResponse> {
  try {
    const { path }     = await params;
    const pathString   = path.join("/");
    const searchParams = request.nextUrl.searchParams;
    const queryString  = searchParams.toString();

    // Construct target URL
    const url = new URL(`${API_BASE_URL}/${pathString}`);
    if (queryString) {
      url.search = queryString;
    }

    // Get token from cookies
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

    // Prepare headers
    const headers = new Headers();

    // Copy relevant headers from original request
    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    // Add authorization if token exists
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Prepare request body for non-GET requests
    let body: string | undefined;
    if (method !== "GET" && method !== "HEAD") {
      try {
        body = await request.text();
      } catch (error) {
        console.error("Error reading request body:", error);
      }
    }

    // Make the proxied request
    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
    });

    // Parse response
    let data: unknown;
    const responseContentType = response.headers.get("content-type");

    if (responseContentType?.includes("application/json")) {
      try {
        data = await response.json();
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        data = { error: "Invalid JSON response from server" };
      }
    } else {
      data = await response.text();
    }

    // Return response with same status code
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);

    const errorResponse: ErrorResponse = {
      error: "Proxy request failed",
      details: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  return handleRequest(request, params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  return handleRequest(request, params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  return handleRequest(request, params, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  return handleRequest(request, params, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  return handleRequest(request, params, "PATCH");
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  return handleRequest(request, params, "HEAD");
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  return handleRequest(request, params, "OPTIONS");
}
