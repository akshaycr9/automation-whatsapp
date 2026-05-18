export type ApiClientOptions = {
  baseUrl?: string;
};

export type ApiRequestOptions = {
  accessToken?: string | null;
  credentials?: RequestCredentials;
};

export type ApiResponse<T> = {
  data: T;
};

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

const defaultBaseUrl = getDefaultBaseUrl();

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = trimTrailingSlash(options.baseUrl ?? defaultBaseUrl);

  async function request<T>(path: string, init: RequestInit = {}, requestOptions: ApiRequestOptions = {}) {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (requestOptions.accessToken) {
      headers.set("Authorization", `Bearer ${requestOptions.accessToken}`);
    }

    let response: Response;

    const fetchInit: RequestInit = {
      ...init,
      headers
    };

    if (requestOptions.credentials) {
      fetchInit.credentials = requestOptions.credentials;
    }

    try {
      response = await fetch(`${baseUrl}${path}`, fetchInit);
    } catch {
      throw new ApiError(0, "NETWORK_ERROR", "Unable to connect. Please check if the API server is running.");
    }

    const payload = await readJson<ApiResponse<T> | ApiErrorPayload>(response);

    if (!response.ok) {
      const error = "error" in payload ? payload.error : undefined;
      throw new ApiError(
        response.status,
        error?.code ?? "UNKNOWN",
        error?.message ?? "Something went wrong. Please try again.",
        error?.details
      );
    }

    return payload as ApiResponse<T>;
  }

  function get<T>(path: string, options: ApiRequestOptions = {}) {
    return request<T>(path, { method: "GET" }, options);
  }

  function post<T>(path: string, body?: unknown, options: ApiRequestOptions = {}) {
    const init: RequestInit = { method: "POST" };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    return request<T>(path, init, options);
  }

  function del<T>(path: string, options: ApiRequestOptions = {}) {
    return request<T>(path, { method: "DELETE" }, options);
  }

  return { delete: del, get, post };
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getDefaultBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

  if (typeof window === "undefined") {
    return configuredBaseUrl;
  }

  const appHostname = window.location.hostname;
  const apiUrl = new URL(configuredBaseUrl);
  const apiUsesLocalhost = apiUrl.hostname === "localhost" || apiUrl.hostname === "127.0.0.1";
  const appUsesLocalhost = appHostname === "localhost" || appHostname === "127.0.0.1";

  if (!apiUsesLocalhost || appUsesLocalhost) {
    return configuredBaseUrl;
  }

  apiUrl.hostname = appHostname;
  return apiUrl.toString();
}

export const apiClient = createApiClient();
