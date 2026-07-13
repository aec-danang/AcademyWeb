import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  console.log('Seeding landing page data...');

  // 1. SiteSetting stats
  await prisma.siteSetting.upsert({
    where: { key: 'stats_native_teachers' },
    update: { value: '44' },
    create: { key: 'stats_native_teachers', value: '44' }
  });
  await prisma.siteSetting.upsert({
    where: { key: 'stats_happy_students' },
    update: { value: '15,000+' },
    create: { key: 'stats_happy_students', value: '15,000+' }
  });
  await prisma.siteSetting.upsert({
    where: { key: 'stats_years_experience' },
    update: { value: '15' },
    create: { key: 'stats_years_experience', value: '15' }
  });

  // 2. SiteFeature
  // Clean up existing to avoid duplicates if run multiple times
  await prisma.siteFeature.deleteMany();
  
  const features = [
    { title: 'Expert Native Teachers', description: 'Learn from highly qualified native speakers with years of teaching experience.', iconValue: 'graduation-cap', order: 1 },
    { title: 'Interactive Curriculum', description: 'Engaging materials and practical lessons designed for real-world fluency.', iconValue: 'book-open', order: 2 },
    { title: 'Modern Facilities', description: 'State-of-the-art classrooms equipped with the latest educational technology.', iconValue: 'building', order: 3 },
    { title: 'Flexible Scheduling', description: 'A variety of class times to perfectly fit your busy lifestyle.', iconValue: 'clock', order: 4 }
  ];

  for (const f of features) {
    await prisma.siteFeature.create({ data: f });
  }

  // 3. Post for Events and News
  const posts = [
    { slug: 'summer-english-camp-2026', title: 'Summer English Camp 2026', content: 'Join our amazing summer camp designed to boost confidence and fluency in a fun, immersive environment!', type: 'event', excerpt: 'Boost confidence in a fun environment.', published: true },
    { slug: 'new-ielts-program', title: 'New Intensive IELTS Program', content: 'We are launching a new intensive IELTS program tailored to help you achieve your target score faster.', type: 'news', excerpt: 'Achieve your target score faster.', published: true }
  ];

  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: p,
      create: p
    });
  }

  // 4. Testimonial for Hall of Fame
  const testimonials = [
    { authorName: 'Alice Nguyen', content: 'AEC completely transformed my English skills. The teachers were incredibly supportive, and the intensive practice helped me achieve my target score much faster than I thought possible!', score: 'IELTS 8.5', isHallOfFame: true, isFeatured: true, rating: 5 },
    { authorName: 'Bob Tran', content: 'The best English center in town. The curriculum is challenging yet accessible, and the mock tests prepared me perfectly for the real exam. Highly recommended to anyone serious about their goals.', score: 'IELTS 8.0', isHallOfFame: true, isFeatured: true, rating: 5 }
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
