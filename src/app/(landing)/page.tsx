import LandingClient from "./LandingClient";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academy English Center - Học tiếng Anh tại Đà Nẵng",
  description: "Đào tạo tiếng Anh chất lượng cao cho trẻ em, thanh thiếu niên và người lớn tại Đà Nẵng.",
};

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function LandingPage() {
  const [
    programs,
    settingsArray,
    events,
    news,
    dbTestimonials,
    posts,
    studentLifeEvents,
  ] = await Promise.all([
    prisma.siteProgram.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    }),
    prisma.siteSetting.findMany(),
    prisma.post.findMany({
      where: { type: 'event', published: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.post.findMany({
      where: { type: 'news', published: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    }),
    prisma.post.findMany({
      where: { type: 'post', published: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.studentLifeEvent.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  const features: any[] = []; 

  const settings = settingsArray.reduce((acc: Record<string, string>, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const testimonials = dbTestimonials.map((t: any) => ({
    id: t.id,
    authorName: t.authorName,
    authorRole: t.authorRole,
    content: t.content,
    avatarUrl: t.avatarUrl,
    score: t.rating ? `${t.rating}/5` : null,
    isHallOfFame: true,
    isFeatured: true
  }));

  return (
    <LandingClient 
      programs={programs} 
      features={features} 
      settings={settings}
      events={events}
      news={news}
      posts={posts}
      testimonials={testimonials}
      studentLifeEvents={studentLifeEvents}
    />
  );
}
