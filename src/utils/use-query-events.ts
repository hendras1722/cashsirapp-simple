import type { UseQueryResult } from "@tanstack/react-query";

interface Callbacks<TData, TError> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
}

export const useQueryEvents = <TData = unknown, TError = unknown>(
  query: UseQueryResult<TData, TError>,
  callbacks: Callbacks<TData, TError>
) => {
  const { isSuccess, isError, data, error } = query;
  const { onSuccess, onError }              = callbacks;

  if (isSuccess && data) {
    onSuccess?.(data);
  }

  if (isError && error) {
    onError?.(error);
  }

  return query;
};
