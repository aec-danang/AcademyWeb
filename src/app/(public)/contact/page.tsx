import { prisma } from "@/lib/prisma";
import ContactPageClient from "./ContactPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên hệ - Academy English Center",
  description: "Liên hệ với chúng tôi để được tư vấn và hỗ trợ.",
};

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function ContactPage() {
  const programs = await prisma.siteProgram.findMany({
    where: { published: true },
    orderBy: { order: 'asc' }
  });

  return (
    <ContactPageClient programs={programs} />
  );
}
