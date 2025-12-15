import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = "https://mentoria.ticklab.site";
const API_URL = process.env.VITE_API_ENDPOINT || BASE_URL;

const staticRoutes = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/login", priority: 0.8, changefreq: "monthly" },
  { path: "/mentee/register", priority: 0.8, changefreq: "monthly" },
  { path: "/mentor/register", priority: 0.8, changefreq: "monthly" },
  { path: "/mentor-browse", priority: 0.9, changefreq: "daily" },
];

async function fetchMentorProfiles() {
  try {
    console.log(`Fetching mentors from: ${API_URL}/api/mentors`);
    const firstResponse = await fetch(`${API_URL}/api/mentors`);
    if (!firstResponse.ok) {
      console.warn(`Could not fetch mentor profiles (status: ${firstResponse.status}), using static routes only`);
      return [];
    }

    const firstResult = await firstResponse.json();

    if (!firstResult.success || !firstResult.data?.mentors || !Array.isArray(firstResult.data.mentors)) {
      console.warn("Invalid API response format, using static routes only");
      return [];
    }

    const allMentors = [...firstResult.data.mentors];
    const { pagination } = firstResult.data;

    if (pagination.hasNextPage) {
      for (let page = 2; page <= pagination.totalPages; page++) {
        const response = await fetch(`${API_URL}/api/mentors?page=${page}&limit=${pagination.itemsPerPage}`);
        if (!response.ok) continue;

        const result = await response.json();
        if (result.success && result.data?.mentors) {
          allMentors.push(...result.data.mentors);
        }
      }
    }

    return allMentors.map((mentor) => ({
      path: `/mentor-profile/${mentor.user_id}`,
      priority: 0.7,
      changefreq: "weekly",
    }));
  } catch (error) {
    console.warn("Error fetching mentor profiles:", error.message);
    return [];
  }
}

function generateSitemapXML(urls) {
  const lastmod = new Date().toISOString();

  const urlEntries = urls
    .map(
      (url) => `
<url>
  <loc>${BASE_URL}${url.path}</loc>
  <lastmod>${lastmod}</lastmod>
  <changefreq>${url.changefreq}</changefreq>
  <priority>${url.priority}</priority>
</url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}

async function generateSitemap() {
  console.log("🚀 Generating sitemap...");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`API URL: ${API_URL}`);

  const dynamicRoutes = await fetchMentorProfiles();

  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  console.log(`Found ${allRoutes.length} URLs (${staticRoutes.length} static + ${dynamicRoutes.length} dynamic)`);

  const xml = generateSitemapXML(allRoutes);

  const outputPath = join(__dirname, "..", "public", "sitemap.xml");
  writeFileSync(outputPath, xml, "utf-8");

  console.log("Sitemap generated successfully at:", outputPath);
  console.log(`${allRoutes.length} URLs included in sitemap`);
}

generateSitemap().catch((error) => {
  console.error("Error generating sitemap:", error);
  process.exit(1);
});
