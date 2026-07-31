import { Inter } from "next/font/google";
import Navbar from "@/lib/layout/Navbar";
import Footer from "@/lib/layout/Footer";
import { prisma } from "@/lib/prisma";

export default async function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sponsors = await prisma.sponsor.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  const programs = await prisma.siteProgram.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer sponsors={sponsors} programs={programs} />
    </div>
  );
}
