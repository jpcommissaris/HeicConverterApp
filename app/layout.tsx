import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HEIC to JPEG/PNG Converter",
  description:
    "Convert HEIC/HEIF images to JPEG or PNG format entirely in your browser. Fast, secure, and private - all processing happens locally.",
  keywords: [
    "HEIC converter",
    "HEIF converter",
    "JPEG converter",
    "PNG converter",
    "image converter",
    "browser image converter",
    "local image processing",
    "privacy-focused converter",
  ],
  authors: [{ name: "Image Converter App" }],
  creator: "Image Converter App",
  publisher: "Image Converter App",
  metadataBase: process.env.NEXT_PUBLIC_BASE_URL
    ? new URL(process.env.NEXT_PUBLIC_BASE_URL)
    : undefined,
  openGraph: {
    title: "HEIC to JPEG/PNG Converter",
    description:
      "Convert HEIC/HEIF images to JPEG or PNG format entirely in your browser. Fast, secure, and private - all processing happens locally.",
    type: "website",
    locale: "en_US",
    siteName: "HEIC Converter",
  },
  twitter: {
    card: "summary_large_image",
    title: "HEIC to JPEG/PNG Converter",
    description:
      "Convert HEIC/HEIF images to JPEG or PNG format entirely in your browser. Fast, secure, and private.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
