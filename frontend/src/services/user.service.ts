import { api } from "@/lib/api";
import type { User } from "@/types/user";

export function getMe() {
  return api<User>("/users/me");
}

// avatar: null borra la foto; omitirlo la deja como está.
export function updateMe(payload: { name?: string; avatar?: string | null }) {
  return api<User>("/users/me", { method: "PATCH", body: payload });
}
