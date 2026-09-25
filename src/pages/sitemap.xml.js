import { getCategories, getArticles } from '../lib/contentful.js';

const SITE = 'https://sacredinkacademy.com';

const STATIC_URLS = [
  '/ua/',
  '/ua/about/',
  '/ua/kateryna-yeromenko/',
  '/ua/results/',
  '/ua/tattoo-course/',
  '/ua/tattoo-course/baza/',
  '/ua/tattoo-course/grupove/',
  '/ua/tattoo-course/mikrorealizm/',
  '/ua/tattoo-course/pidvyshchennya-kvalifikatsii/',
  '/ua/free-tattoo-course/',
  '/ua/knowledge/',
  '/ua/contact/',
  '/ua/privacy/',
  '/ua/terms/',
  '/en/',
  '/en/about/',
  '/en/kateryna-yeromenko/',
  '/en/results/',
  '/en/tattoo-course/',
  '/en/tattoo-course/base/',
  '/en/tattoo-course/group/',
  '/en/tattoo-course/microrealism/',
  '/en/tattoo-course/upskilling/',
  '/en/free-tattoo-course/',
  '/en/knowledge/',
  '/en/contact/',
  '/en/privacy/',
  '/en/terms/',
];

export async function GET() {
  let dynamicUrls = [];
  try {
    const [categories, articles] = await Promise.all([getCategories(), getArticles()]);
    dynamicUrls = [
      ...categories.map((c) => `/ua/knowledge/${c.slug}/`),
      ...articles.filter((a) => a.category).map((a) => `/ua/knowledge/${a.category.slug}/${a.slug}/`),
    ];
  } catch {
    // Contentful not configured yet — ship the sitemap with static routes only.
  }

  const urls = [...STATIC_URLS, ...dynamicUrls];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
