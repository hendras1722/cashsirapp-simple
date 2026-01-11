"use client";

import { useHttp } from "@/hooks/useHttp";
import { useEffect } from "react";

export interface GetmeResponse {
  _id: string;
  email: string;
  active: boolean;
}

interface BaseResponseLogin<T> {
  code: number;
  message: string;
  data: T;
}

export function useGetme() {
  const getme = useHttp<BaseResponseLogin<GetmeResponse>>("/getme", {
    method: "GET",
    key: ["me"],
  });

  useEffect(() => {
    getme.execute();
  }, [getme.execute]);

  return getme;
}
