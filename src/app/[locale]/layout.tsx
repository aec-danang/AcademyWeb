import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

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

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${montserrat.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className={montserrat.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
        <SessionProviderWrapper>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProviderWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
