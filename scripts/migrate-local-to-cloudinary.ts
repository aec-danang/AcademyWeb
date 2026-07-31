import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { prisma } from "../src/lib/prisma";
import { storageService } from "../src/lib/storage/storage.service";
import fs from "fs";

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) {
        // Skip WordPress resized thumbnail variations (e.g. -300x188, -1024x643) to avoid duplicate uploads
        const baseName = path.basename(file, ext);
        if (!/-\d+x\d+$/i.test(baseName)) {
          arrayOfFiles.push(fullPath);
        }
      }
    }
  });

  return arrayOfFiles;
}

async function main() {
  console.log("🚀 Starting Full System Cloudinary Migration & Image Repair...");

  const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
  const rootUploadsDir = path.resolve(process.cwd(), "..", "uploads");

  console.log(`📁 Scanning directories:\n - ${publicUploadsDir}\n - ${rootUploadsDir}`);

  const localFiles = [
    ...getAllFiles(publicUploadsDir),
    ...getAllFiles(rootUploadsDir),
  ];
  console.log(`📸 Found ${localFiles.length} image files in local storage.`);

  const urlMap = new Map<string, string>(); // oldRelativeOrUrl -> newCloudinaryUrl

  let uploadedCount = 0;
  let skippedCount = 0;

  for (const filePath of localFiles) {
    try {
      // Calculate relative path inside uploads folder cleanly
      let relDir = "";
      if (filePath.includes("public" + path.sep + "uploads")) {
        relDir = path.relative(publicUploadsDir, path.dirname(filePath));
      } else {
        relDir = path.relative(rootUploadsDir, path.dirname(filePath));
      }

      const cleanRelDir = relDir.replace(/\\/g, "/").replace(/^\.\.\/?/g, "").replace(/[^a-zA-Z0-9_\-\/]/g, "");
      const cloudinaryFolder = cleanRelDir ? `academy_media/${cleanRelDir}` : "academy_media";
      const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));
      
      // Fix relative URL mapping for DB replacement phase
      // Regardless of where the file came from (public/uploads or ../uploads), we map it to /uploads/...
      const relativeUrl = cleanRelDir 
        ? `/uploads/${cleanRelDir}/${path.basename(filePath)}` 
        : `/uploads/${path.basename(filePath)}`;

      const fileBuffer = fs.readFileSync(filePath);

      // Upload to Cloudinary & Save to Media DB (Using original filename for SEO)
      const media = await storageService.uploadAndSaveMedia(fileBuffer, {
        folder: cloudinaryFolder,
        publicId: fileNameWithoutExt,
      });

      urlMap.set(relativeUrl, media.secureUrl);
      urlMap.set(`http://localhost:3000${relativeUrl}`, media.secureUrl);
      urlMap.set(`https://aec.edu.vn${relativeUrl}`, media.secureUrl);

      uploadedCount++;
      console.log(`  [${uploadedCount}/${localFiles.length}] Uploaded: ${relativeUrl} -> ${media.secureUrl}`);
    } catch (err: any) {
      console.error(`  ❌ Failed to upload ${filePath}: ${err.message}`);
      skippedCount++;
    }
  }

  console.log(`\n✅ Upload Phase Complete: ${uploadedCount} uploaded, ${skippedCount} failed/skipped.\n`);

  // Phase 2: System-wide Database Image URL Healing & Repair
  console.log("🛠️ Phase 2: Repairing all Post image URLs in Database...");

  const posts = await prisma.post.findMany();
  let updatedPostsCount = 0;

  for (const post of posts) {
    let contentChanged = false;
    let newContent = post.content || "";
    let newFeaturedImage = post.featuredImage || "";

    // 1. Replace mapped local and domain URLs
    for (const [oldUrl, newUrl] of urlMap.entries()) {
      if (newContent.includes(oldUrl)) {
        newContent = newContent.split(oldUrl).join(newUrl);
        contentChanged = true;
      }
      if (newFeaturedImage && newFeaturedImage.includes(oldUrl)) {
        newFeaturedImage = newUrl;
        contentChanged = true;
      }
    }

    // 2. Replace WordPress legacy domain URLs (e.g., https://academy.edu.vn/new/wp-content/uploads/2024/11/Asset-3.png)
    for (const [oldRelative, newCloudinaryUrl] of urlMap.entries()) {
      if (!oldRelative.startsWith("/uploads/")) continue;
      
      // Clean filename from local upload path
      const filename = path.basename(oldRelative);
      const filenameWithoutExt = path.basename(filename, path.extname(filename));

      // Regex matching any external wordpress domain image URL containing the same filename
      const wpRegex = new RegExp(`https?:\\/\\/[^"']+\\/wp-content\\/uploads\\/[^"']+\\/${filenameWithoutExt}(?:-[0-9]+x[0-9]+)?\\.[a-zA-Z]+`, "g");
      if (wpRegex.test(newContent)) {
        newContent = newContent.replace(wpRegex, newCloudinaryUrl);
        contentChanged = true;
      }
      if (newFeaturedImage && wpRegex.test(newFeaturedImage)) {
        newFeaturedImage = newCloudinaryUrl;
        contentChanged = true;
      }
    }

    // 3. Clean up srcset attributes pointing to broken old domains
    if (newContent.includes('srcset=')) {
      const srcsetRegex = /srcset=["']([^"']+)["']/g;
      newContent = newContent.replace(srcsetRegex, (match, srcsetVal) => {
        // Keep only if Cloudinary, or remove broken wp-content srcset
        if (srcsetVal.includes('res.cloudinary.com')) return match;
        contentChanged = true;
        return '';
      });
    }

    if (contentChanged) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          content: newContent,
          featuredImage: newFeaturedImage,
        },
      });
      updatedPostsCount++;
      console.log(`  Updated Post: "${post.title}" (${post.slug})`);
    }
  }

  console.log(`\n🎉 MIGRATION SUCCESSFUL!`);
  console.log(`- Uploaded ${uploadedCount} images to Cloudinary with f_auto,q_auto.`);
  console.log(`- Fixed and updated ${updatedPostsCount} posts in Database.`);
}

main()
  .catch((e) => {
    console.error("Migration Script Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
