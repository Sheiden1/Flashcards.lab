import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Ambiance } from "./components/landing/Ambiance";

const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.toggle('light',t==='light');}catch(e){}})();`;

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://flashcardslab.vercel.app",
  ),
  title: {
    default: "Flashcards Lab — cartas de estudo a partir de qualquer conteúdo",
    template: "%s · Flashcards Lab",
  },
  description:
    "Cole um texto ou envie um PDF e a IA gera um deck de flashcards holográficos para estudar. Sem login, nada é salvo.",
  keywords: ["flashcards", "estudo", "IA", "PDF", "Gemini", "revisão"],
  openGraph: {
    title: "Flashcards Lab",
    description: "Transforme qualquer conteúdo em cartas de estudo.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flashcards Lab",
    description: "Transforme qualquer conteúdo em cartas de estudo.",
  },
};

export const viewport = {
  themeColor: "#0A0A0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
      </head>
      <body className="min-h-full">
        <Ambiance />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
