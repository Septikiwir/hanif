import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Cormorant_SC,
  EB_Garamond,
  Great_Vibes,
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

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Hanif & Opay — Wedding Invitation",
  description: "Wedding invitation for Hanif & Opay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${ebGaramond.variable} ${cormorantGaramond.variable} ${cormorantSC.variable} ${greatVibes.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
