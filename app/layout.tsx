import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Keasramaan - HSI Boarding School",
  description: "Dashboard Manajemen Keasramaan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
