import { prisma } from "../src/lib/prisma";
import { storageService } from "../src/lib/storage/storage.service";
import fs from "fs";
import path from "path";

async function fixAllPostsInstant() {
  console.log("⚡ Starting Fast Global Post Image Migration...");

  const rootUploadsDir = path.resolve(process.cwd(), "..", "uploads");
  const publicUploadsDir = path.join(process.cwd(), "public", "uploads");

  const fileMap = new Map<string, string>(); // lowerFilename -> fullPath

  function scan(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(full);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) {
          fileMap.set(entry.name.toLowerCase(), full);
        }
      }
    }
  }

  scan(publicUploadsDir);
  scan(rootUploadsDir);
  console.log(`📸 Indexed ${fileMap.size} local images.`);

  const posts = await prisma.post.findMany();
  console.log(`📚 Processing ${posts.length} posts...`);

  const urlCloudinaryMap = new Map<string, string>(); // lowerFilename -> secureUrl
  let totalFixed = 0;

  for (const post of posts) {
    let content = post.content || "";
    let featuredImage = post.featuredImage || "";
    let changed = false;

    // Matches any image src/href or URL pointing to wp-content or /uploads/
    const matches = Array.from(new Set([
      ...(content.match(/https?:\/\/[^"'\s<>]+\/wp-content\/uploads\/[^"'\s<>]+/g) || []),
      ...(content.match(/\/uploads\/[^"'\s<>]+/g) || []),
      ...(featuredImage ? [featuredImage] : [])
    ]));

    for (const rawUrl of matches) {
      if (!rawUrl.includes("wp-content") && !rawUrl.includes("/uploads/")) continue;

      const cleanUrl = rawUrl.replace(/["']>.*$/, "").trim();
      const fileName = path.basename(cleanUrl.split("?")[0]);
      const lowerFileName = fileName.toLowerCase();

      let secureUrl = urlCloudinaryMap.get(lowerFileName);

      if (!secureUrl) {
        let foundPath = fileMap.get(lowerFileName);

        // Strip WP dimensions e.g. -724x1024.jpg -> .jpg
        if (!foundPath) {
          const ext = path.extname(lowerFileName);
          const baseNoExt = path.basename(lowerFileName, ext).replace(/-\d+x\d+$/i, "");
          const cleanName = `${baseNoExt}${ext}`;
          foundPath = fileMap.get(cleanName);

          if (!foundPath) {
            for (const [k, v] of fileMap.entries()) {
              if (k.startsWith(baseNoExt)) {
                foundPath = v;
                break;
              }
            }
          }
        }

        if (foundPath) {
          try {
            const buffer = fs.readFileSync(foundPath);
            const media = await storageService.uploadAndSaveMedia(buffer, {
              folder: "academy_media/migrated",
            });
            secureUrl = media.secureUrl;
            urlCloudinaryMap.set(lowerFileName, secureUrl);
            console.log(`  ✅ Uploaded: ${fileName} -> ${secureUrl}`);
          } catch (err: any) {
            console.error(`  ❌ Failed to upload ${foundPath}: ${err.message}`);
          }
        }
      }

      if (secureUrl) {
        if (content.includes(cleanUrl)) {
          content = content.split(cleanUrl).join(secureUrl);
          changed = true;
        }
        if (featuredImage && featuredImage.includes(cleanUrl)) {
          featuredImage = secureUrl;
          changed = true;
        }
      }
    }

    // Strip broken legacy srcset attributes
    if (content.includes("srcset=")) {
      const stripped = content.replace(/srcset=["']([^"']+)["']/g, "");
      if (stripped !== content) {
        content = stripped;
        changed = true;
      }
    }

    if (changed) {
      await prisma.post.update({
        where: { id: post.id },
        data: { content, featuredImage },
      });
      totalFixed++;
      console.log(`🎉 Fixed Post [${totalFixed}]: "${post.title}" (${post.slug})`);
    }
  }

  console.log(`\n🎉 COMPLETED! Fixed ${totalFixed} posts in Database.`);
}

fixAllPostsInstant()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
