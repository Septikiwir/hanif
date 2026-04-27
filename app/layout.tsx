import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Cormorant_SC,
  EB_Garamond,
} from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
});

const cormorantSC = Cormorant_SC({
  variable: "--font-cormorant-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});



export const metadata: Metadata = {
  metadataBase: new URL("https://nimantra.vercel.app"),
  title: "The Wedding of Hanif & Fizah",
  description: "Minggu, 17 Mei 2026",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "The Wedding of Hanif & Fizah",
    description: "Minggu, 17 Mei 2026",
    url: "https://nimantra.vercel.app",
    siteName: "Wedding Hanif & Fizah",
    images: [
      {
        url: "/preview (1).jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Wedding of Hanif & Fizah",
    description: "Minggu, 17 Mei 2026",
    images: ["/preview (1).jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${ebGaramond.variable} ${cormorantGaramond.variable} ${cormorantSC.variable}`}
    >
      <head>

      </head>
      <body>{children}</body>
    </html>
  );
}
