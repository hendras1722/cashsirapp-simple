import type { FetchOptions, FetchResponse } from "ofetch";
import { ofetch } from "ofetch";
import { z } from "zod";
import Cookies from "js-cookie";

type HTTPMethod =
  | "GET"
  | "HEAD"
  | "PATCH"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE";

export interface RequestOptions
  extends Omit<FetchOptions<"json">, "headers" | "method" | "body" | "query"> {
  headers?: HeadersInit;
  method?: Readonly<HTTPMethod | Lowercase<HTTPMethod>>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
}

interface FieldError {
  name: string;
  message: string;
}

interface ErrorResponseData {
  data?: unknown;
  message?: string;
}

interface ErrorResponse {
  response?: {
    _data?: ErrorResponseData;
    status?: number;
    statusText?: string;
  };
  message?: string;
}

interface UseRequestResult<T> {
  raw: FetchResponse<T>;
  data: T;
}

interface FormInstance {
  setErrors: (errors: FieldError[]) => void;
}

const TOKEN_COOKIE_NAME     = "token";
const API_URL               = "/api";
const DEFAULT_TIMEOUT       = 30000;
const DEFAULT_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

// Zod Schema
const fieldErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
});

type FieldErrorSchema = z.infer<typeof fieldErrorSchema>;

// ============================================================================
// Cookie Utilities
// ============================================================================

function getTokenFromCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;

  return Cookies.get(TOKEN_COOKIE_NAME);
}

function setTokenCookie(token: string, maxAge: number = DEFAULT_TOKEN_MAX_AGE): void {
  if (typeof document === "undefined") return;

  Cookies.set(TOKEN_COOKIE_NAME, token, {
    path: "/",
    expires: maxAge / (24 * 60 * 60), // Convert seconds to days
    sameSite: "Lax",
    secure: true, // HTTPS only
  });
}

function removeTokenCookie(): void {
  if (typeof document === "undefined") return;

  Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });
}

// ============================================================================
// Request Function
// ============================================================================

/**
 * Fetch API request with automatic token handling
 * @param path - API path (will be proxied through /api/v1)
 * @param options - Request options
 * @returns Promise with response data
 */
export async function fetchRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<UseRequestResult<T>> {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const fullPath  = `${API_URL}/${cleanPath}`;

  const instance = ofetch.create({
    method: "GET",
    timeout: DEFAULT_TIMEOUT,
    retry: false,
    responseType: "json",

    async onRequest({ options: reqOptions }) {
      const token = getTokenFromCookie();

      if (token) {
        const headers = new Headers(reqOptions.headers);
        headers.set("Authorization", `Bearer ${token}`);
        reqOptions.headers = headers;
      }
    },

    async onResponseError({ response }) {
      if (response.status === 401) {
        removeTokenCookie();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        throw new Error("Unauthorized - please login again");
      }
    },
  });

  const raw = await instance.raw<T>(fullPath, options);

  return {
    raw,
    data: raw._data as T,
  };
}

// ============================================================================
// Error Handling
// ============================================================================

function parseErrorFields(err: ErrorResponse): FieldError[] {
  const responseData = err.response?._data?.data;

  if (!responseData) return [];

  const errors        = Array.isArray(responseData) ? responseData : [responseData];
  const isValidErrors = errors.every(
    (item): item is FieldErrorSchema => fieldErrorSchema.safeParse(item).success
  );

  if (!isValidErrors) return [];

  return errors.map((item) => ({
    name: item.field,
    message: item.message,
  }));
}

/**
 * Parse error from request response
 * Useful for handling form validation errors
 * @param err - Error object
 * @param formRef - Form reference for field errors
 * @returns Field errors array
 */
export function parseRequestError(
  err: unknown,
  formRef?: { value: FormInstance | null }
): FieldError[] {
  const errorResponse = err as ErrorResponse;
  const fieldErrors   = parseErrorFields(errorResponse);

  // Set form errors if form ref is provided
  if (fieldErrors.length > 0 && formRef?.value) {
    formRef.value.setErrors(fieldErrors);
  }

  return fieldErrors;
}

/**
 * Get error message from request error
 * @param err - Error object
 * @returns Error message string
 */
export function getErrorMessage(err: unknown): string {
  // Handle string errors
  if (typeof err === "string") {
    return err;
  }

  const errorResponse = err as ErrorResponse;

  // Handle response errors
  if (errorResponse.response?._data) {
    const message = errorResponse.response._data.message;
    return typeof message === "string"
      ? message
      : (errorResponse.response.statusText ?? "Request failed");
  }

  // Handle generic errors
  const errorMessage = errorResponse.message;
  return typeof errorMessage === "string" ? errorMessage : "Something went wrong";
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Set authentication token in cookie
 * @param token - JWT token
 * @param expiresIn - Token expiration in seconds
 */
export function setAuthToken(token: string, expiresIn?: number): void {
  setTokenCookie(token, expiresIn);
}

/**
 * Clear authentication token from cookie
 */
export function clearAuthToken(): void {
  removeTokenCookie();
}

/**
 * Get current authentication token from cookie
 */
export function getAuthToken(): string | undefined {
  return getTokenFromCookie();
}
