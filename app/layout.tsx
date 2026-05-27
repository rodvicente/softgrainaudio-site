import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Softgrain Audio | Custom music, ready to license",
  description:
    "Original tracks for brands, creators, videos, apps, podcasts and campaigns - produced fast, delivered clean, and ready to use.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
