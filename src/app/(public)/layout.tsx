import { Inter } from "next/font/google";
import Navbar from "@/lib/layout/Navbar";
import Footer from "@/lib/layout/Footer";
import { prisma } from "@/lib/prisma";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sponsors = await prisma.sponsor.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer sponsors={sponsors} />
    </>
  );
}
