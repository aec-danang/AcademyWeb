import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

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
  title: "Academy English Center | AEC Da Nang",
  description: "Learn English. Build Confidence. Become a Global Citizen. Academy English Center provides high-quality English programs for kids, teens, IELTS learners, working adults, and corporate teams in Da Nang.",
};

import { ThemeProvider } from "@/lib/contexts/ThemeProvider";
import { SessionProviderWrapper } from "@/lib/contexts/SessionProviderWrapper";
import { Toaster } from "@/components/ui/sonner";
import { EasterEgg } from "@/components/EasterEgg";

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (window.location.pathname.startsWith('/management') && localStorage.getItem('aec-theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={montserrat.className} suppressHydrationWarning>
        <SessionProviderWrapper>
          <ThemeProvider>
            {children}
            <Toaster />
            <EasterEgg />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}