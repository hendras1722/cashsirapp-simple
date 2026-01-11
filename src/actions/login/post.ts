"use client";

import { useHttp } from "@/hooks/useHttp";
import { setAuthToken } from "@/lib/ofetch";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
}

interface BaseResponseLogin<T> {
  code: number;
  message: string;
  data: T;
}

export function useLogin() {
  return useHttp<BaseResponseLogin<LoginResponse>, LoginRequest>("/auth/login", {
    method: "POST",
    onSuccess: (data) => {
      setAuthToken(data.data.token);
      window.location.href = "/admin/dashboard";
    },
    key: ["login"],
  });
}
