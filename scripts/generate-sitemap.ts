import { neonConfig } from "@neondatabase/serverless";
import { writeFileSync } from "fs";
import { join } from "path";
import pg from "pg";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const { Pool } = pg;
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
    const sitemapEntries = [
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

    // Generate sitemap XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    (entry) => `
  <url>
    <loc>https://toiletguilt.com${entry.path}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${entry.path === "/" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("")}
</urlset>`;

    // Write sitemap to file
    const outputPath = join(process.cwd(), "dist/public/sitemap.xml");
    writeFileSync(outputPath, sitemapXml);
    console.log("Sitemap generated successfully at:", outputPath);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

generateSitemap().catch(console.error);
