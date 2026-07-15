const fs = require('fs');
const path = require('path');

const srcApp = path.join(__dirname, 'src', 'app');
const localeDir = path.join(srcApp, '[locale]');
const enDir = path.join(srcApp, '(en)');
const viDir = path.join(srcApp, '(vi)');

if (!fs.existsSync(enDir)) fs.mkdirSync(enDir, { recursive: true });
if (!fs.existsSync(viDir)) fs.mkdirSync(viDir, { recursive: true });

const toEn = ['(admin)', '(elearning)', 'login'];
const toVi = ['(landing)', '(public)'];

function moveIfExists(srcName, targetDir) {
  const srcPath = path.join(localeDir, srcName);
  const destPath = path.join(targetDir, srcName);
  
  if (fs.existsSync(srcPath)) {
    try {
      fs.renameSync(srcPath, destPath);
      console.log(`Moved ${srcName} to ${path.basename(targetDir)}`);
    } catch (e) {
      console.error(`Failed to move ${srcName}:`, e);
      // Fallback to copy+delete
      fs.cpSync(srcPath, destPath, { recursive: true });
      fs.rmSync(srcPath, { recursive: true, force: true });
      console.log(`Copied and deleted ${srcName} to ${path.basename(targetDir)}`);
    }
  } else {
    console.log(`Source ${srcName} does not exist in [locale]`);
  }
}

toEn.forEach(name => moveIfExists(name, enDir));
toVi.forEach(name => moveIfExists(name, viDir));

if (fs.existsSync(localeDir)) {
  try {
    fs.rmSync(localeDir, { recursive: true, force: true });
    console.log(`Deleted [locale]`);
  } catch(e) {
    console.error(`Failed to delete [locale]:`, e);
  }
}

// Write the layout files
const enLayoutContent = `import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "../globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Academy English Center | AEC Da Nang",
  description: "Learn English. Build Confidence. Become a Global Citizen. Academy English Center provides high-quality English programs for kids, teens, IELTS learners, working adults, and corporate teams in Da Nang.",
};

import { ThemeProvider } from "@/lib/contexts/ThemeProvider";
import { SessionProviderWrapper } from "@/lib/contexts/SessionProviderWrapper";
import { Toaster } from "@/components/ui/sonner";

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={\`\${montserrat.variable} \${inter.variable}\`} suppressHydrationWarning>
      <body className={montserrat.className} suppressHydrationWarning>
        <SessionProviderWrapper>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}`;

const viLayoutContent = enLayoutContent.replace('lang="en"', 'lang="vi"').replace('function EnLayout', 'function ViLayout');

fs.writeFileSync(path.join(enDir, 'layout.tsx'), enLayoutContent);
fs.writeFileSync(path.join(viDir, 'layout.tsx'), viLayoutContent);
console.log('Created layout files');

// Also remove i18n.ts, proxy.ts, messages
const toDelete = [
  path.join(__dirname, 'src', 'i18n.ts'),
  path.join(__dirname, 'src', 'proxy.ts'),
  path.join(__dirname, 'src', 'messages')
];

toDelete.forEach(p => {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log(`Deleted ${p}`);
  }
});
