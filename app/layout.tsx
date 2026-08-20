import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pelagos — Satellite & AI Oil Spill Intelligence",
  description:
    "Pelagos detects potential oil spills on the Caspian Sea using satellite SAR imagery, analyzes them with AI, and supports human review, response, and cleanup.",
  keywords: [
    "oil spill detection",
    "Caspian Sea",
    "satellite AI",
    "Sentinel-1",
    "SAR",
    "maritime intelligence",
    "Pelagos",
  ],
  openGraph: {
    title: "Pelagos Dashboard",
    description:
      "Caspian Sea oil spill intelligence — satellite detection, AI analysis, and operator response.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Leaflet CSS via CDN — avoids Turbopack PostCSS processing panic */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
