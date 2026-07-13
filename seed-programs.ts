import { prisma } from './src/lib/prisma';

const programs = [
  {
    title: 'English for Kids',
    slug: 'kids',
    description: 'Interactive learning for young minds (6-11 years).',
    content: '<p>Welcome to the English for Kids page. Content coming soon!</p>',
    iconType: 'lucide',
    iconValue: 'Baby',
    order: 1,
  },
  {
    title: 'English for Teens',
    slug: 'teens',
    description: 'Building foundation for success (11-15 years).',
    content: '<p>Welcome to the English for Teens page. Content coming soon!</p>',
    iconType: 'lucide',
    iconValue: 'Baby',
    order: 2,
  },
  {
    title: 'IELTS Prep',
    slug: 'ielts',
    description: 'Achieve your target score.',
    content: '<p>Welcome to the IELTS Prep page. Content coming soon!</p>',
    iconType: 'lucide',
    iconValue: 'GraduationCap',
    order: 3,
  },
  {
    title: 'Test Prep',
    slug: 'testprep',
    description: 'TOEFL iBT, TOEIC, SAT, CERF.',
    content: '<p>Welcome to the Test Prep page. Content coming soon!</p>',
    iconType: 'lucide',
    iconValue: 'GraduationCap',
    order: 4,
  },
  {
    title: 'Adults & Comm',
    slug: 'communication',
    description: 'Confidence in daily communication.',
    content: '<p>Welcome to the Adults & Comm page. Content coming soon!</p>',
    iconType: 'lucide',
    iconValue: 'Briefcase',
    order: 5,
  },
  {
    title: 'Corporate English',
    slug: 'corporate',
    description: 'Empower your workforce.',
    content: '<p>Welcome to the Corporate English page. Content coming soon!</p>',
    iconType: 'lucide',
    iconValue: 'Building',
    order: 6,
  },
  {
    title: 'Public Speaking',
    slug: 'public-speaking',
    description: 'Master presentation & debate skills.',
    content: '<p>Welcome to the Public Speaking page. Content coming soon!</p>',
    iconType: 'lucide',
    iconValue: 'Trophy',
    order: 7,
  },
  {
    title: 'Study Abroad & Summer Camp',
    slug: 'study-abroad',
    description: 'Global experiences and consulting.',
    content: '<p>Welcome to the Study Abroad page. Content coming soon!</p>',
    iconType: 'lucide',
    iconValue: 'Briefcase',
    order: 8,
  },
  {
    title: 'ADDC',
    slug: 'addc',
    description: 'Speaking & debating for kids and teenagers.',
    content: '<p>Welcome to the ADDC page. Content coming soon!</p>',
    iconType: 'image',
    iconValue: '/logos/addc/addc-logo.png',
    order: 9,
  }
];

async function main() {
  console.log('Seeding programs...');
  for (const p of programs) {
    await prisma.siteProgram.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log('Programs seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
