import type { Metadata } from "next";
import "./globals.css";
import {Urbanist, Oi} from "next/font/google"

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"]
})

const oi = Oi({
  variable: "--font-oi",
  subsets: ["latin"],
  weight: ["400"]
})

export const metadata: Metadata = {
  title: "LOVR",
  description: "Agenda tus actividades, recuérdalas, y lleva un progreso de todas al mismo. El nuevo estándar.",
  icons: {
    icon: "./lovr.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" integrity="sha512-2SwdPD6INVrV/lHTZbO2nodKhrnDdJK9/kg2XD1r9uGqPo1cUbujc+IYdlYdEErWNu69gVcYgdxlmVmzTWnetw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />

      </head>
      <body className={`${urbanist.variable} ${oi.variable}`}>
        {children}
      </body>
    </html>
  );
}
