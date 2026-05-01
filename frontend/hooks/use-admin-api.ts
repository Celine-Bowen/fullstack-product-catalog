"use client";

export function useAdminApi(apiBase: string, authToken?: string) {
  async function request<T>(path: string, options: RequestInit = {}, token = authToken): Promise<T> {
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string; errors?: Record<string, string[]> } | null;
      const firstFieldError = body?.errors ? Object.values(body.errors).flat()[0] : undefined;

      throw new Error(firstFieldError ?? body?.message ?? `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json() as Promise<T>;
  }

  return { request };
}
