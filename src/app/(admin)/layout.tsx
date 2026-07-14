import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "../globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin Dashboard | Academy English Center",
  description: "Admin dashboard for Academy English Center",
};

import { ThemeProvider } from "@/lib/contexts/ThemeProvider";
import { SessionProviderWrapper } from "@/lib/contexts/SessionProviderWrapper";
import { Toaster } from "@/components/ui/sonner";

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className={montserrat.className} suppressHydrationWarning>
        <SessionProviderWrapper>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
