import { Inter } from "next/font/google";
import Navbar from "@/lib/layout/Navbar";
import Footer from "@/lib/layout/Footer";
import { prisma } from "@/lib/prisma";
import publicStyles from "@/components/seasonal-theme/PublicHalloween.module.css";
import { PublicHalloweenAccents } from "@/components/seasonal-theme/PublicHalloweenAccents";

export default async function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sponsors, programs] = await Promise.all([
    prisma.sponsor.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    }),
    prisma.siteProgram.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className={`${publicStyles.frame} flex flex-col min-h-screen`}>
      <Navbar />
      <PublicHalloweenAccents />
      <main className="flex-1">{children}</main>
      <Footer sponsors={sponsors} programs={programs} />
    </div>
  );
}
