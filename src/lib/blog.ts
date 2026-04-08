import fs from "fs";
import path from "path";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image: string;
  body: string;
}

const BLOG_DIR = path.join(process.cwd(), "content/blog");

/** Parse YAML-like frontmatter from markdown text */
function parseFrontmatter(raw: string): { data: Record<string, string | string[]>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string | string[]> = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    // Handle array values like ["a", "b"]
    const arrMatch = value.match(/^\[(.+)\]$/);
    if (arrMatch) {
      data[key] = arrMatch[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    } else {
      data[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return { data, body: match[2] };
}

function fileToPost(slug: string, raw: string): BlogPost {
  const { data, body } = parseFrontmatter(raw);
  return {
    slug,
    title: (data.title as string) || slug,
    description: (data.description as string) || "",
    date: (data.date as string) || "",
    author: (data.author as string) || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    image: (data.image as string) || "/icons/icon-512.png",
    body,
  };
}

/** Get all blog posts from filesystem sorted by date descending */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf-8");
      return fileToPost(slug, raw);
    })
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

/** Get all posts including Redis-stored auto-generated ones */
export async function getAllPostsWithRedis(): Promise<BlogPost[]> {
  const filePosts = getAllPosts();

  // Try loading auto-generated posts from Redis
  try {
    const { getCached } = await import("./cache");
    const indexRaw = await getCached("blog:index");
    if (indexRaw) {
      const slugs: string[] = JSON.parse(indexRaw);
      const redisPosts: BlogPost[] = [];
      for (const slug of slugs) {
        // Skip if we already have this from filesystem
        if (filePosts.some((p) => p.slug === slug)) continue;
        const raw = await getCached(`blog:post:${slug}`);
        if (raw) redisPosts.push(JSON.parse(raw));
      }
      return [...filePosts, ...redisPosts].sort((a, b) => (b.date > a.date ? 1 : -1));
    }
  } catch { /* Redis not available, return file posts only */ }

  return filePosts;
}

/** Get a single post by slug (filesystem first, then Redis) */
export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return fileToPost(slug, raw);
}

/** Get a single post, checking Redis too for auto-generated posts */
export async function getPostBySlugWithRedis(slug: string): Promise<BlogPost | null> {
  // Try filesystem first
  const filePost = getPostBySlug(slug);
  if (filePost) return filePost;

  // Try Redis
  try {
    const { getCached } = await import("./cache");
    const raw = await getCached(`blog:post:${slug}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }

  return null;
}

/** Get posts that share at least one tag with the given post */
export function getRelatedPosts(slug: string, tags: string[], limit = 3): BlogPost[] {
  const all = getAllPosts();
  return all
    .filter((p) => p.slug !== slug && p.tags.some((t) => tags.includes(t)))
    .slice(0, limit);
}

/** Basic markdown to HTML renderer (no external deps) */
export function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const htmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Blank line: close list if open, add paragraph break
    if (line.trim() === "") {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      continue;
    }

    // Block-level image (line is only an image)
    const blockImg = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (blockImg) {
      if (inList) { htmlParts.push("</ul>"); inList = false; }
      const isSmallCrest = blockImg[2].includes("media.api-sports.io");
      if (isSmallCrest) {
        htmlParts.push(`<div class="flex justify-center gap-4 my-6"><img src="${blockImg[2]}" alt="${blockImg[1]}" class="w-20 h-20 object-contain" loading="lazy" /></div>`);
      } else {
        htmlParts.push(`<div class="my-6 rounded-xl overflow-hidden border border-border"><img src="${blockImg[2]}" alt="${blockImg[1]}" class="w-full h-auto" loading="lazy" /></div>`);
      }
      continue;
    }

    // Multiple inline images on one line (e.g., two team crests)
    const multiImg = line.match(/^!\[.*\]\(.*\)\s+!\[.*\]\(.*\)$/);
    if (multiImg) {
      if (inList) { htmlParts.push("</ul>"); inList = false; }
      htmlParts.push(`<div class="flex justify-center items-center gap-8 my-6">${inlineFormat(line)}</div>`);
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      if (inList) { htmlParts.push("</ul>"); inList = false; }
      htmlParts.push('<hr class="border-border/50 my-6" />');
      continue;
    }

    // Headings
    const h3 = line.match(/^### (.+)$/);
    if (h3) {
      if (inList) { htmlParts.push("</ul>"); inList = false; }
      htmlParts.push(`<h3 class="text-lg font-semibold mt-6 mb-2">${inlineFormat(h3[1])}</h3>`);
      continue;
    }
    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      if (inList) { htmlParts.push("</ul>"); inList = false; }
      htmlParts.push(`<h2 class="text-xl font-bold mt-8 mb-3">${inlineFormat(h2[1])}</h2>`);
      continue;
    }

    // List items
    if (line.match(/^- /)) {
      if (!inList) {
        htmlParts.push('<ul class="list-disc pl-5 space-y-1 my-3">');
        inList = true;
      }
      htmlParts.push(`<li class="text-sm text-text-secondary leading-relaxed">${inlineFormat(line.slice(2))}</li>`);
      continue;
    }

    // Paragraph
    if (inList) { htmlParts.push("</ul>"); inList = false; }
    htmlParts.push(`<p class="text-sm text-text-secondary leading-relaxed mb-4">${inlineFormat(line)}</p>`);
  }

  if (inList) htmlParts.push("</ul>");
  return htmlParts.join("\n");
}

/** Inline formatting: bold, italic, code, images, links */
function inlineFormat(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="inline-block w-16 h-16 object-contain mx-2" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent hover:underline">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-bg-primary/60 px-1 py-0.5 rounded text-xs">$1</code>');
}
