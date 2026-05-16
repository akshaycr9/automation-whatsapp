export type ApiClientOptions = {
  baseUrl?: string;
};

export type ApiResponse<T> = {
  data: T;
};

const defaultBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? defaultBaseUrl;

  async function get<T>(path: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`API request failed with ${response.status}`);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  return { get };
}

export const apiClient = createApiClient();
