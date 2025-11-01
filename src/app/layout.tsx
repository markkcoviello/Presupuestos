// --- src/app/layout.tsx ---
import './print-styles.css'; // <-- ¡AÑADE ESTA LÍNEA!


// ... resto de tu layout.tsx ...
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CONSTRU-FE - Sistema de Presupuestos",
  description: "Sistema profesional de presupuestos para CONSTRU-FE",
  keywords: ["CONSTRU-FE", "Presupuestos", "Construcción", "Sistema"],
  authors: [{ name: "CONSTRU-FE" }],
  icons: {
    icon: "/logo-constru-fe.png",
  },
  openGraph: {
    title: "CONSTRU-FE - Sistema de Presupuestos",
    description: "Sistema profesional de presupuestos para construcción",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
