import type { Metadata } from "next";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { inter } from "@/theme/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Crea, organiza y da seguimiento a tus hábitos personales.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
