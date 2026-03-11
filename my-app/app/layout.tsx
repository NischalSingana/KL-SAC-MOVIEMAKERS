import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "KL-SAC Movie Makers Club",
  description: "Professional management system for the KL University Movie Makers Club",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${lexend.variable} antialiased`}
        style={{
          fontFamily: "var(--font-lexend), system-ui, sans-serif",
          background: "var(--bg-base)",
          color: "var(--text-primary)",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
