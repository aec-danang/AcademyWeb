import { prisma } from "../src/lib/prisma";
import { storageService } from "../src/lib/storage/storage.service";
import fs from "fs";
import path from "path";

async function fixSpecificPost() {
  const slug = "mid-autumn-2024-24189";
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) {
    console.log("Post not found");
    return;
  }

  let content = post.content || "";
  const rootUploadsDir = path.resolve(process.cwd(), "..", "uploads");

  // Regex matching wp-content/uploads URLs
  const wpRegex = /https?:\/\/[^"'\s]+\/wp-content\/uploads\/[^\s"'>]+/g;
  const matches = Array.from(new Set(content.match(wpRegex) || []));

  console.log(`Found ${matches.length} legacy WordPress image URLs in post.`);

  for (const oldUrl of matches) {
    const cleanUrl = oldUrl.replace(/["']>.*$/, "");
    const fileName = path.basename(cleanUrl.split("?")[0]);
    const baseNameWithoutExt = path.basename(fileName, path.extname(fileName));

    // Recursively search for matching file in root AEC/uploads
    let foundFilePath: string | null = null;

    function searchFile(dir: string) {
      if (!fs.existsSync(dir) || foundFilePath) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          searchFile(full);
        } else if (entry.name === fileName || entry.name.startsWith(baseNameWithoutExt)) {
          foundFilePath = full;
          return;
        }
      }
    }

    searchFile(rootUploadsDir);

    if (foundFilePath) {
      console.log(`  Found local file for ${fileName} -> ${foundFilePath}`);
      const buffer = fs.readFileSync(foundFilePath);
      const media = await storageService.uploadAndSaveMedia(buffer, {
        folder: "academy_media/migrated",
      });

      content = content.split(oldUrl).join(media.secureUrl);
      console.log(`  ✅ Replaced ${oldUrl} -> ${media.secureUrl}`);
    } else {
      console.log(`  ⚠️ Could not find local file for: ${fileName}`);
    }
  }

  // Clean up broken srcset attributes
  content = content.replace(/srcset=["']([^"']+)["']/g, "");

  await prisma.post.update({
    where: { slug },
    data: { content },
  });

  console.log(`🎉 Successfully fixed and updated post "${post.title}"!`);
}

fixSpecificPost()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
