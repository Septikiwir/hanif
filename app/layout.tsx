import type { Metadata } from "next"; 
import {
  Cormorant_Garamond,
  Cormorant_SC,
  EB_Garamond,
  Plus_Jakarta_Sans,
  Jost,
} from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cormorantSC = Cormorant_SC({
  variable: "--font-cormorant-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});



export const metadata: Metadata = {
  metadataBase: new URL("https://nimantra.id"),
  title: {
    default: "Nimantra – Undangan Pernikahan Digital Premium",
    template: "%s | Nimantra"
  },
  description: "Abadikan momen terindah dengan undangan digital elegan. Desain premium, pengerjaan cepat, dan revisi tanpa batas hingga hari H.",
  icons: {
    icon: "/Nimantra S - White.png",
    shortcut: "/Nimantra S - White.png",
    apple: "/Nimantra S - White.png",
  },
  openGraph: {
    title: "Nimantra – Undangan Pernikahan Digital",
    description: "Buat undangan pernikahan digital premium dengan mudah dan cepat.",
    url: "https://nimantra.id",
    siteName: "Nimantra",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nimantra – Undangan Pernikahan Digital",
    description: "Buat undangan pernikahan digital premium dengan mudah dan cepat.",
    images: ["/opengraph-image.jpg"],
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
      className={`${ebGaramond.variable} ${cormorantGaramond.variable} ${cormorantSC.variable} ${plusJakartaSans.variable} ${jost.variable}`}
    >
      <head>

      </head>
      <body>{children}</body>
    </html>
  );
}
