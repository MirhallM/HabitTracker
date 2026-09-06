import { getToken } from "./auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Error con el status incluido, para que las pantallas puedan distinguir
// "credenciales inválidas" (401) de "el correo ya existe" (409).
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  skipAuth?: boolean; // para login y registro, donde aún no hay token
};

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { method = "GET", body, skipAuth = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch solo lanza excepción si la red falla; un 404 o 500 NO la lanzan.
    throw new ApiError("No se pudo conectar con el servidor", 0);
  }

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // NestJS devuelve `message` como string, o como arreglo si falló la validación
    const raw = data?.message;
    const message = Array.isArray(raw) ? raw.join(". ") : raw;
    throw new ApiError(
      message ?? "Ocurrió un error inesperado",
      response.status,
    );
  }

  return data as T;
}
