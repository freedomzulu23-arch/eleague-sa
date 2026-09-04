import type { Metadata, Viewport } from "next";
import "./globals.css";

// Define metadata separately
export const metadata: Metadata = {
  title: "eLeague SA - eFootball Tournament Manager",
  description: "South Africa's eFootball Tournament Platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "eLeague SA",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
  },
};

// Define viewport separately
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white min-h-screen">{children}</body>
    </html>
  );
}