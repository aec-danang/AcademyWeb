import { prisma } from "../src/lib/prisma";
import { storageService } from "../src/lib/storage/storage.service";
import fs from "fs";
import path from "path";

async function fixAllPostsSystemWide() {
  console.log("🚀 Starting System-Wide Image Repair for ALL Posts...");

  const rootUploadsDir = path.resolve(process.cwd(), "..", "uploads");
  const publicUploadsDir = path.join(process.cwd(), "public", "uploads");

  // 1. Build a local filename cache map
  const fileCache = new Map<string, string>(); // lowercaseFilename -> fullPath

  function cacheDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        cacheDirectory(full);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) {
          fileCache.set(entry.name.toLowerCase(), full);
        }
      }
    }
  }

  console.log("📁 Indexing local image archives...");
  cacheDirectory(publicUploadsDir);
  cacheDirectory(rootUploadsDir);
  console.log(`📸 Indexed ${fileCache.size} unique image files in local storage.`);

  const posts = await prisma.post.findMany();
  console.log(`📚 Scanning ${posts.length} posts in database...`);

  let totalPostsFixed = 0;
  let totalImagesUploaded = 0;

  const uploadedMediaMap = new Map<string, string>(); // cleanFilename -> secureUrl

  for (const post of posts) {
    let content = post.content || "";
    let featuredImage = post.featuredImage || "";
    let contentChanged = false;

    // Extract exact image URLs from src="..." or href="..."
    const imgSrcRegex = /(?:src|href)=["'](https?:\/\/[^"'\s]+\/wp-content\/uploads\/[^"'\s]+|\/uploads\/[^"'\s]+)["']/g;
    const allMatches: string[] = [];
    let match;
    while ((match = imgSrcRegex.exec(content)) !== null) {
      allMatches.push(match[1]);
    }
    if (featuredImage && (featuredImage.includes("wp-content") || featuredImage.startsWith("/uploads/"))) {
      allMatches.push(featuredImage);
    }

    const uniqueMatches = Array.from(new Set(allMatches));

    if (uniqueMatches.length > 0) {
      console.log(`\n📝 Processing Post: "${post.title}" (${uniqueMatches.length} legacy images)`);

      for (const oldUrl of uniqueMatches) {
        const rawFileName = path.basename(oldUrl.split("?")[0]);
        const lowerFileName = rawFileName.toLowerCase();

        // 1. Check if already uploaded in this run
        let secureUrl = uploadedMediaMap.get(lowerFileName);

        // 2. If not uploaded yet, find in local file cache
        if (!secureUrl) {
          let foundPath = fileCache.get(lowerFileName);

          // If exact filename not found, try base name match without WordPress dimensions (e.g. -300x200)
          if (!foundPath) {
            const ext = path.extname(lowerFileName);
            const baseWithoutExt = path.basename(lowerFileName, ext).replace(/-\d+x\d+$/i, "");
            for (const [cachedName, cachedPath] of fileCache.entries()) {
              if (cachedName.startsWith(baseWithoutExt)) {
                foundPath = cachedPath;
                break;
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
              uploadedMediaMap.set(lowerFileName, secureUrl);
              totalImagesUploaded++;
              console.log(`  ✅ Uploaded & Mapped: ${rawFileName} -> ${secureUrl}`);
            } catch (err: any) {
              console.error(`  ❌ Failed to upload ${foundPath}: ${err.message}`);
            }
          } else {
            console.log(`  ⚠️ Local file not found for: ${rawFileName}`);
          }
        }

        if (secureUrl) {
          if (content.includes(oldUrl)) {
            content = content.split(oldUrl).join(secureUrl);
            contentChanged = true;
          }
          if (featuredImage && featuredImage.includes(oldUrl)) {
            featuredImage = secureUrl;
            contentChanged = true;
          }
        }
      }

      // Clean up broken srcset attributes that point to legacy domains
      if (content.includes("srcset=")) {
        const srcsetRegex = /srcset=["']([^"']+)["']/g;
        content = content.replace(srcsetRegex, (match, srcsetVal) => {
          if (srcsetVal.includes("res.cloudinary.com")) return match;
          contentChanged = true;
          return "";
        });
      }

      if (contentChanged) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            content,
            featuredImage,
          },
        });
        totalPostsFixed++;
        console.log(`  🎉 Saved repairs for post "${post.title}"`);
      }
    }
  }

  console.log(`\n==========================================`);
  console.log(`✨ ALL POSTS REPAIR COMPLETED!`);
  console.log(`- Total Posts Fixed: ${totalPostsFixed}`);
  console.log(`- Total Images Uploaded to Cloudinary: ${totalImagesUploaded}`);
  console.log(`==========================================\n`);
}

fixAllPostsSystemWide()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
