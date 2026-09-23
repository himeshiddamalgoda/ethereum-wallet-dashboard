"use client";

import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig } from "axios";

import { apiService } from "@/services";

type UseApiQueryParams<TData, TError> = {
  queryKey: QueryKey;
  url: string;
  requestConfig?: AxiosRequestConfig;
  options?: Omit<UseQueryOptions<TData, TError>, "queryFn" | "queryKey">;
};

export function useApiQuery<TData, TError = AxiosError>({
  queryKey,
  url,
  requestConfig,
  options,
}: UseApiQueryParams<TData, TError>): UseQueryResult<TData, TError> {
  return useQuery({
    ...options,
    queryKey,
    queryFn: () => apiService.get<TData>(url, requestConfig),
  });
}

