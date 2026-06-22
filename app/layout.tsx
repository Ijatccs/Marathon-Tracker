import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marathon Scan",
  description: "Marathon QR checkpoint scanning system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-body antialiased">{children}</body>
    </html>
  );
}
