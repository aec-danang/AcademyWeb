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
import { getSiteTheme } from "@/lib/siteTheme.server";

export default async function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteTheme = await getSiteTheme();
  return (
    <html lang="en" data-seasonal-theme={siteTheme} data-scroll-behavior="smooth" className={`${montserrat.variable} ${inter.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.classList.toggle('dark',localStorage.getItem('aec-theme')==='dark');document.documentElement.dataset.seasonalEffects=String(localStorage.getItem('aec-seasonal-effects')!=='false')}catch(e){}` }} /></head>
      <body className={montserrat.className} suppressHydrationWarning>
        <SessionProviderWrapper>
          <ThemeProvider initialSeasonalTheme={siteTheme}>
            {children}
            <Toaster />
            <EasterEgg />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
