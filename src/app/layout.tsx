import type { Metadata } from "next";
import { Inter, Merriweather, Lora, Atkinson_Hyperlegible, Literata } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["300", "400", "700", "900"], variable: "--font-merriweather" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson" });
const literata = Literata({ subsets: ["latin"], variable: "--font-literata" });

export const metadata: Metadata = {
  title: "NovelNest - Platform Novel UGC",
  description: "Baca dan tulis novel karya kreator Indonesia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${merriweather.variable} ${lora.variable} ${atkinson.variable} ${literata.variable}`}>
      <body className="bg-[#0A0A0A] text-white min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
