import { TocItem } from './TableOfContents';

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // Remove nested html
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces with -
    .replace(/^-+|-+$/g, ''); // Trim -
}

export function processHtmlAndGetToc(html: string): { processedHtml: string; toc: TocItem[]; readingTimeMinutes: number } {
  const toc: TocItem[] = [];
  
  // Calculate reading time
  // Strip all HTML tags to get pure text length
  const plainText = html.replace(/<[^>]*>?/gm, '');
  const wordCount = plainText.trim().split(/\s+/).length;
  // Average reading speed 200 words per minute
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Regex to match H2 and H3 tags
  // Matches <h2 ...>Content</h2>
  const headingRegex = /<(h[23])([^>]*)>(.*?)<\/\1>/gi;

  const processedHtml = html.replace(headingRegex, (match, tag, attrs, content) => {
    // If it already has an ID, we could use it, but for simplicity we generate a clean one
    const plainContent = content.replace(/<[^>]*>/g, '');
    const id = generateId(plainContent) || `heading-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if ID already exists to avoid duplicates
    let uniqueId = id;
    let counter = 1;
    while (toc.find(t => t.id === uniqueId)) {
      uniqueId = `${id}-${counter}`;
      counter++;
    }

    const level = tag.toLowerCase() === 'h2' ? 2 : 3;
    
    toc.push({
      id: uniqueId,
      text: plainContent,
      level,
    });

    // Ensure we don't duplicate existing id attributes if they exist
    const cleanAttrs = attrs.replace(/id="[^"]*"/i, '').replace(/id='[^']*'/i, '');
    
    return `<${tag}${cleanAttrs} id="${uniqueId}">${content}</${tag}>`;
  });

  return { processedHtml, toc, readingTimeMinutes };
}
