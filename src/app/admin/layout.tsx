import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "../globals.css";

export const metadata: Metadata = { title: "Yönetim · Hackathon Aydın 2027", robots: { index: false, follow: false } };

/** Separate root layout: the admin area is not localized and has no public header. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
