import LandingClient from "./LandingClient";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academy English Center - Learn English in Da Nang",
  description: "High-quality English training for kids, teens, and adults in Da Nang.",
};

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function LandingPage() {
  const programs: any[] = []; // await prisma.siteProgram.findMany({ where: { published: true }, orderBy: { order: 'asc' } });
  
  const features: any[] = []; // await prisma.siteFeature.findMany({ where: { published: true }, orderBy: { order: 'asc' } });

  const settingsArray = await prisma.siteSetting.findMany();
  const settings = settingsArray.reduce((acc: Record<string, string>, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const events = await prisma.post.findMany({
    where: { type: 'event', published: true },
    orderBy: { createdAt: 'desc' },
    take: 6
  });

  const news = await prisma.post.findMany({
    where: { type: 'news', published: true },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  const testimonials = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { order: 'asc' }
  });

  return (
    <LandingClient 
      programs={programs} 
      features={features} 
      settings={settings}
      events={events}
      news={news}
      testimonials={testimonials}
    />
  );
}
