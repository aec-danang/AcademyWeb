import { prisma } from './src/lib/prisma';

async function fix() {
  console.log("Searching for corrupted URLs...");
  const posts = await prisma.post.findMany();
  let count = 0;
  
  for (const post of posts) {
    let contentChanged = false;
    let newContent = post.content || "";
    let newFeaturedImage = post.featuredImage || "";

    // This regex looks for any URL starting with http that has /wp-content followed by http(s)://res.cloudinary.com
    // It captures the cloudinary part and discards the garbage prefix.
    const regex = /https?:\/\/[^\s"'<>]+\/wp-content(https?:\/+\/?res\.cloudinary\.com[^\s"'<>]+)/g;

    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, "$1");
      contentChanged = true;
    }
    if (newFeaturedImage && regex.test(newFeaturedImage)) {
      newFeaturedImage = newFeaturedImage.replace(regex, "$1");
      contentChanged = true;
    }

    // Also check for any other domains that got prefixed to cloudinary
    // e.g., something.com/https://res.cloudinary...
    const genericRegex = /https?:\/\/[^\s"'<>]+\/?(https?:\/+\/?res\.cloudinary\.com[^\s"'<>]+)/g;
    if (genericRegex.test(newContent)) {
      newContent = newContent.replace(genericRegex, "$1");
      contentChanged = true;
    }
    if (newFeaturedImage && genericRegex.test(newFeaturedImage)) {
      newFeaturedImage = newFeaturedImage.replace(genericRegex, "$1");
      contentChanged = true;
    }

    if (contentChanged) {
      await prisma.post.update({
        where: { id: post.id },
        data: { content: newContent, featuredImage: newFeaturedImage }
      });
      console.log(`Fixed post: ${post.slug}`);
      count++;
    }
  }
  console.log(`\nFixed ${count} posts with corrupted URLs.`);
}
fix();
