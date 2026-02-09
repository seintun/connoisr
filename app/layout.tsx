import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TempoDine",
  description: "Vibrant Modernist Dining",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

import { NetworkStatus } from "@/components/domain/NetworkStatus";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${jakarta.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <NetworkStatus />
        {process.env.VERCEL && <SpeedInsights />}
      </body>
    </html>
  );
}
