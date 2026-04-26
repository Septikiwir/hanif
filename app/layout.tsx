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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://domainkamu.com"),
  title: "Undangan Pernikahan Wahyu & Pasangan",
  description:
    "Dengan penuh kebahagiaan kami mengundang Anda untuk hadir di hari bahagia kami.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Undangan Pernikahan Wahyu & Pasangan",
    description:
      "Dengan penuh kebahagiaan kami mengundang Anda untuk hadir di hari bahagia kami.",
    url: "/",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "/preview-wedding.jpeg",
        alt: "Undangan Pernikahan Wahyu & Pasangan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Undangan Pernikahan Wahyu & Pasangan",
    description:
      "Dengan penuh kebahagiaan kami mengundang Anda untuk hadir di hari bahagia kami.",
    images: ["/preview-wedding.jpeg"],
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
