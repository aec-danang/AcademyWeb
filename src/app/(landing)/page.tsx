import LandingClient from "./LandingClient";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academy English Center - Học tiếng Anh tại Đà Nẵng",
  description: "Đào tạo tiếng Anh chất lượng cao cho trẻ em, thanh thiếu niên và người lớn tại Đà Nẵng.",
};

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function LandingPage() {
  let programs: any[] = [];
  let sponsorCount = 0;
  let events: any[] = [];
  let news: any[] = [];
  let dbTestimonials: any[] = [];
  let posts: any[] = [];
  let studentLifeEvents: any[] = [];

  try {
    [
      programs,
      events,
      news,
      dbTestimonials,
      posts,
      studentLifeEvents,
      sponsorCount,
    ] = await Promise.all([
      prisma.siteProgram.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
      }),
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
      prisma.sponsor.count({ where: { published: true } }),
    ]);
  } catch (error) {
    console.warn("Database offline: using default landing page data");
  }

  const testimonials = dbTestimonials.map((t: any) => ({
    id: t.id,
    authorName: t.authorName,
    authorRole: t.authorRole,
    content: t.content,
    avatarUrl: t.avatarUrl,
    score: t.rating ? `${t.rating}/5` : null,
    isHallOfFame: t.isHallOfFame,
    isFeatured: t.isFeatured,
  }));

  return (
    <LandingClient 
      programs={programs} 
      events={events}
      news={news}
      posts={posts}
      testimonials={testimonials}
      studentLifeEvents={studentLifeEvents}
      sponsorCount={sponsorCount}
      yearsOfExperience={new Date().getFullYear() - 2001}
    />
  );
}
