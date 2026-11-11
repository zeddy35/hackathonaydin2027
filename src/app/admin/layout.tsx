import type { Metadata } from "next";
import "../fonts.css";
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
