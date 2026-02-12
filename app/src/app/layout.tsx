import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
import { InstallBanner } from "@/components/install-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AdherePod - Voice-Native Medical Adherence",
  description: "A voice-native, plug-and-play medical adherence device and data platform for elderly and low-literacy users.",
  openGraph: {
    title: "AdherePod - Voice-Native Medical Adherence",
    description: "A voice-native, plug-and-play medical adherence device and data platform for elderly and low-literacy users.",
    images: [{ url: "/hero-image.png", width: 1200, height: 630 }],
    siteName: "AdherePod",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/hero-image.png"],
  },
  icons: {
    apple: "/icon-180x180.png",
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
        <SessionProvider>{children}</SessionProvider>
        <InstallBanner />
        <Analytics />
      </body>
    </html>
  );
}
