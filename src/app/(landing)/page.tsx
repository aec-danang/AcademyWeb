import LandingClient from "./LandingClient";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academy English Center - Learn English in Da Nang",
  description: "High-quality English training for kids, teens, and adults in Da Nang.",
};

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function LandingPage() {
  const programs = await prisma.siteProgram.findMany({
    where: { published: true },
    orderBy: { order: 'asc' }
  });

  return <LandingClient programs={programs} />;
}
