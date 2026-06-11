import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = [
  { path: 'schedule', title: 'Opening Schedule' },
  { path: 'study-abroad', title: 'Study Abroad & Summer Camp' },
  { path: 'news', title: 'News & Events' },
  { path: 'blog/[slug]', title: 'Blog Post' },
  { path: 'programs/kids', title: 'English for Kids' },
  { path: 'programs/teens', title: 'English for Teens' },
  { path: 'programs/ielts', title: 'IELTS Preparation' },
  { path: 'programs/testprep', title: 'Test Prep (TOEFL, TOEIC, SAT)' },
  { path: 'programs/communication', title: 'Basic & Communicative English' },
  { path: 'programs/corporate', title: 'Corporate English' },
  { path: 'programs/public-speaking', title: 'Public Speaking & Skills' }
];

const basePath = path.join(process.cwd(), 'src', 'app');

for (const route of routes) {
  const dirPath = path.join(basePath, route.path);
  fs.mkdirSync(dirPath, { recursive: true });
  
  const filePath = path.join(dirPath, 'page.tsx');
  if (!fs.existsSync(filePath)) {
    let content = '';
    if (route.path.includes('[slug]')) {
      content = `import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: \`Blog Post: \${resolvedParams.slug} | Academy\`,
    description: 'Read our latest blog post on Academy English Center.',
  };
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Blog Post: {resolvedParams.slug}</h1>
      <p>This is a dynamically generated blog post page.</p>
    </div>
  );
}
`;
    } else {
      let functionName = route.path.split('/').pop().replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/^[a-z]/, (g) => g[0].toUpperCase()) + 'Page';
      
      content = `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${route.title} | Academy',
  description: 'Learn more about ${route.title} at Academy English Center.',
};

export default function ${functionName}() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">${route.title}</h1>
      <p>Welcome to the ${route.title} page. Content coming soon!</p>
    </div>
  );
}
`;
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Created: ' + filePath);
  }
}
