import { Inter } from "next/font/google";
import Navbar from "@/lib/layout/Navbar";
import Footer from "@/lib/layout/Footer";
import { prisma } from "@/lib/prisma";

export default async function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let sponsors: any[] = [];
  let programs: any[] = [];

  try {
    sponsors = await prisma.sponsor.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.warn("Database offline: sponsors fallback used");
  }

  try {
    programs = await prisma.siteProgram.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.warn("Database offline: programs fallback used");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer sponsors={sponsors} programs={programs} />
    </div>
  );
}
