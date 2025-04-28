import { neonConfig } from "@neondatabase/serverless";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import pg from "pg";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const { Pool } = pg;

const MAX_ENTRIES_PER_SITEMAP = 50000;
const BASE_URL = "https://toiletguilt.com";

interface SitemapEntry {
  path: string;
  lastmod: string;
}

async function generateSitemap() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Get all articles
    const { rows: articles } = await pool.query(`
      SELECT id, updated_at 
      FROM articles
    `);

    // Get all public bathrooms
    const { rows: bathrooms } = await pool.query(`
      SELECT id, updated_at 
      FROM public_bathrooms
    `);

    // Generate sitemap entries
    const sitemapEntries: SitemapEntry[] = [
      // Static routes
      { path: "/", lastmod: new Date().toISOString() },
      { path: "/about", lastmod: new Date().toISOString() },
      { path: "/articles", lastmod: new Date().toISOString() },
      { path: "/find-restrooms", lastmod: new Date().toISOString() },

      // Dynamic article routes
      ...articles.map((article) => ({
        path: `/article/${article.id}`,
        lastmod: new Date(article.updated_at).toISOString(),
      })),

      // Dynamic bathroom routes
      ...bathrooms.map((bathroom) => ({
        path: `/restroom/${bathroom.id}`,
        lastmod: new Date(bathroom.updated_at).toISOString(),
      })),
    ];

    // Create sitemaps directory if it doesn't exist
    const sitemapsDir = join(process.cwd(), "dist/public/sitemaps");
    mkdirSync(sitemapsDir, { recursive: true });

    // Split entries into chunks
    const chunks: SitemapEntry[][] = [];
    for (let i = 0; i < sitemapEntries.length; i += MAX_ENTRIES_PER_SITEMAP) {
      chunks.push(sitemapEntries.slice(i, i + MAX_ENTRIES_PER_SITEMAP));
    }

    // Generate individual sitemap files
    const sitemapFiles: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunk
  .map(
    (entry) => `
  <url>
    <loc>${BASE_URL}${entry.path}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${entry.path === "/" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("")}
</urlset>`;

      const filename = `sitemap-${i + 1}.xml`;
      const outputPath = join(sitemapsDir, filename);
      writeFileSync(outputPath, sitemapXml);
      sitemapFiles.push(filename);
      console.log(`Generated sitemap file: ${filename}`);
    }

    // Generate sitemap index
    const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles
  .map(
    (filename) => `
  <sitemap>
    <loc>${BASE_URL}/sitemaps/${filename}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
  )
  .join("")}
</sitemapindex>`;

    // Write sitemap index
    const indexOutputPath = join(process.cwd(), "dist/public/sitemap.xml");
    writeFileSync(indexOutputPath, sitemapIndexXml);
    console.log("Generated sitemap index at:", indexOutputPath);

  } catch (error) {
    console.error("Error generating sitemap:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

generateSitemap().catch(console.error);
