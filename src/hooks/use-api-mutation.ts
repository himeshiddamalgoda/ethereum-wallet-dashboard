"use client";

import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig, Method } from "axios";

import { apiService } from "@/services";

type MutationUrl<TVariables> =
  | string
  | ((variables: TVariables) => string);

type UseApiMutationParams<TData, TError, TVariables, TContext> = {
  method: Extract<Lowercase<Method>, "delete" | "patch" | "post" | "put">;
  url: MutationUrl<TVariables>;
  requestConfig?: AxiosRequestConfig<TVariables>;
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn"
  >;
};

export function useApiMutation<
  TData,
  TVariables = void,
  TError = AxiosError,
  TContext = unknown,
>({
  method,
  url,
  requestConfig,
  options,
}: UseApiMutationParams<
  TData,
  TError,
  TVariables,
  TContext
>): UseMutationResult<TData, TError, TVariables, TContext> {
  return useMutation({
    ...options,
    mutationFn: (variables) =>
      apiService.request<TData, TVariables>({
        ...requestConfig,
        data: variables,
        method,
        url: typeof url === "function" ? url(variables) : url,
      }),
  });
}

