import { api } from "@/lib/api";
import type { User } from "@/types/user";

export function getMe() {
  return api<User>("/users/me");
}

// avatar: null borra la foto; omitirlo la deja como está.
export function updateMe(payload: { name?: string; avatar?: string | null }) {
  return api<User>("/users/me", { method: "PATCH", body: payload });
}

// El backend verifica currentPassword contra el hash antes de cambiarla,
// así que un 401 aquí significa "esa no es tu contraseña actual".
export function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return api<{ updated: boolean }>("/users/me/password", {
    method: "PATCH",
    body: payload,
  });
}
