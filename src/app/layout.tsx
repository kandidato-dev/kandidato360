import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kandidato360 - Compare Philippine Senatorial Candidates",
  description: "Compare and analyze Philippine senatorial candidates for the 2025 elections. View their backgrounds, stances, laws, and policy focuses.",
  keywords: 'Philippine elections 2025, senatorial candidates, election comparison, Philippines politics',
  authors: [{ name: 'Kandidato360' }],
  openGraph: {
    title: 'Kandidato360 - Philippine Election 2025',
    description: 'Compare Philippine senatorial candidates for the 2025 elections',
    type: 'website',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ''} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SpeedInsights />
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
        />
      </body>
    </html>
  );
}
