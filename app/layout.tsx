//layout.tsx
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Barlow({ subsets: ["latin"], weight: ["400"], variable: "--font-sans" });
const cond = Barlow_Condensed({ subsets: ["latin"], weight: ["700"], variable: "--font-condensed" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${sans.variable} ${cond.variable} ${mono.variable} antialiased`}>
        <div className="page-wrap relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}