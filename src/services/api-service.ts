import type { AxiosRequestConfig, AxiosResponse } from "axios";

import { axiosInstance } from "@/lib/axios-instance";

async function request<TResponse, TBody = unknown>(
  config: AxiosRequestConfig<TBody>,
): Promise<TResponse> {
  const response = await axiosInstance.request<
    TResponse,
    AxiosResponse<TResponse>,
    TBody
  >(config);

  return response.data;
}

export const apiService = {
  request,

  get<TResponse>(url: string, config?: AxiosRequestConfig) {
    return request<TResponse>({ ...config, method: "GET", url });
  },

  post<TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig<TBody>,
  ) {
    return request<TResponse, TBody>({ ...config, data, method: "POST", url });
  },

  put<TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig<TBody>,
  ) {
    return request<TResponse, TBody>({ ...config, data, method: "PUT", url });
  },

  patch<TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig<TBody>,
  ) {
    return request<TResponse, TBody>({ ...config, data, method: "PATCH", url });
  },

  delete<TResponse>(url: string, config?: AxiosRequestConfig) {
    return request<TResponse>({ ...config, method: "DELETE", url });
  },
};

