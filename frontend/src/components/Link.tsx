"use client";

// Next.js 16 no deja pasar next/link directo como prop `component={Link}`
// a un componente cliente de MUI (como Button) desde una página que es
// Server Component — da un error de "Functions cannot be passed directly
// to Client Components". Este wrapper lo evita.
import Link, { type LinkProps } from "next/link";

export default Link;
export type { LinkProps };
