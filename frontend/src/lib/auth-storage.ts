// Manejo del token JWT en el navegador.
// Aislado aquí para que, si algún día se migra a cookies httpOnly,
// solo haya que cambiar este archivo.

const TOKEN_KEY = "habit-tracker-token";

export function getToken(): string | null {
  // localStorage no existe durante el renderizado en servidor (SSR).
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}
