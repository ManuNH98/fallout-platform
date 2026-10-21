import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Refugio — Archivo del universo Fallout",
    template: "%s | Refugio",
  },
  description: "Explora los juegos, personajes, lugares e historias del universo Fallout en español.",
  applicationName: "Refugio",
  openGraph: {
    title: "Refugio — Archivo del universo Fallout",
    description: "Una guía en español para recorrer el universo Fallout, juego a juego.",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
