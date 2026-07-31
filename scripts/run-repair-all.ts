import { prisma } from "../src/lib/prisma";
import { storageService } from "../src/lib/storage/storage.service";
import fs from "fs";
import path from "path";

async function executeRobustGlobalPostRepair() {
  console.log("🚀 Starting Comprehensive Global Image Migration & Repair...");

  const rootUploadsDir = path.resolve(process.cwd(), "..", "uploads");
  const publicUploadsDir = path.join(process.cwd(), "public", "uploads");

  const fileMap = new Map<string, string>(); // lowerFilename -> absolutePath

  function scan(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
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

  console.log("📁 Indexing local files...");
  scan(publicUploadsDir);
  scan(rootUploadsDir);
  console.log(`📸 Total local images indexed: ${fileMap.size}`);

  const posts = await prisma.post.findMany();
  console.log(`📚 Total posts to process: ${posts.length}`);

  let updatedPostsCount = 0;
  const uploadedUrlCache = new Map<string, string>(); // lowerFilename -> cloudinarySecureUrl

  for (const post of posts) {
    let content = post.content || "";
    let featuredImage = post.featuredImage || "";
    let contentChanged = false;

    // Extract all image URLs (wp-content or local uploads)
    const matches1 = content.match(/https?:\/\/[^"'\s<>]+\/wp-content\/uploads\/[^"'\s<>]+/g) || [];
    const matches2 = content.match(/\/uploads\/[^"'\s<>]+/g) || [];
    const featuredMatch = featuredImage && (featuredImage.includes("wp-content") || featuredImage.startsWith("/uploads/")) ? [featuredImage] : [];

    const allUrls = Array.from(new Set([...matches1, ...matches2, ...featuredMatch]));

    if (allUrls.length > 0) {
      for (const rawUrl of allUrls) {
        // Clean URL from trailing attributes
        const cleanUrl = rawUrl.replace(/["']>.*$/, "").trim();
        const rawFileName = path.basename(cleanUrl.split("?")[0]);
        const lowerFileName = rawFileName.toLowerCase();

        let secureUrl = uploadedUrlCache.get(lowerFileName);

        if (!secureUrl) {
          // Find matching local file
          let foundPath = fileMap.get(lowerFileName);

          // Try without dimension suffix (-1024x768, etc.)
          if (!foundPath) {
            const ext = path.extname(lowerFileName);
            const baseWithoutExt = path.basename(lowerFileName, ext).replace(/-\d+x\d+$/i, "");
            const cleanFileNameWithExt = `${baseWithoutExt}${ext}`;
            foundPath = fileMap.get(cleanFileNameWithExt);

            if (!foundPath) {
              for (const [k, v] of fileMap.entries()) {
                if (k.startsWith(baseWithoutExt)) {
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
              uploadedUrlCache.set(lowerFileName, secureUrl);
              console.log(`  ✅ Uploaded: ${rawFileName} -> ${secureUrl}`);
            } catch (err: any) {
              console.error(`  ❌ Error uploading ${foundPath}: ${err.message}`);
            }
          }
        }

        if (secureUrl) {
          if (content.includes(cleanUrl)) {
            content = content.split(cleanUrl).join(secureUrl);
            contentChanged = true;
          }
          if (featuredImage && featuredImage.includes(cleanUrl)) {
            featuredImage = secureUrl;
            contentChanged = true;
          }
        }
      }

      // Strip legacy broken srcset attributes
      if (content.includes("srcset=")) {
        const cleanedContent = content.replace(/srcset=["']([^"']+)["']/g, "");
        if (cleanedContent !== content) {
          content = cleanedContent;
          contentChanged = true;
        }
      }

      if (contentChanged) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            content,
            featuredImage,
          },
        });
        updatedPostsCount++;
        console.log(`🎉 Updated Post [${updatedPostsCount}]: "${post.title}"`);
      }
    }
  }

  console.log(`\n✨ DONE! Fixed and updated ${updatedPostsCount} posts in Database.`);
}

executeRobustGlobalPostRepair()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
