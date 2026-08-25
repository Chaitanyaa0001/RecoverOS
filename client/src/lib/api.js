import axios from "axios";

const FALLBACK_BACKEND_URL =
  "http://localhost:5000";

export function getBackendBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    FALLBACK_BACKEND_URL
  ).replace(/\/$/, "");
}

export const api = axios.create({
  baseURL: getBackendBaseUrl(),

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Backend request failed.";

    return Promise.reject(
      new Error(message)
    );
  }
);

export async function fetchBackendJson(
  path,
  options = {}
) {
  const response = await api.request({
    url: path,

    method:
      options.method || "GET",

    data:
      options.body !== undefined
        ? typeof options.body === "string"
          ? JSON.parse(options.body)
          : options.body
        : undefined,

    params:
      options.params || undefined,

    headers:
      options.headers || {},
  });

  return response.data;
}