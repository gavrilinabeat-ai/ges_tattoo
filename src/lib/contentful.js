import { createClient } from 'contentful';

let client = null;

function getClient() {
  if (client) return client;
  const space = import.meta.env.CONTENTFUL_SPACE_ID;
  const accessToken = import.meta.env.CONTENTFUL_DELIVERY_TOKEN;
  if (!space || !accessToken) {
    throw new Error(
      'Missing Contentful credentials. Copy .env.example to .env and fill in CONTENTFUL_SPACE_ID / CONTENTFUL_DELIVERY_TOKEN.'
    );
  }
  client = createClient({ space, accessToken });
  return client;
}

/** All published categories. */
export async function getCategories() {
  const res = await getClient().getEntries({
    content_type: 'knowledgeCategory',
  });
  return res.items.map(mapCategory);
}

export async function getCategoryBySlug(slug) {
  const res = await getClient().getEntries({
    content_type: 'knowledgeCategory',
    'fields.slug': slug,
    limit: 1,
  });
  return res.items[0] ? mapCategory(res.items[0]) : null;
}

/** All published articles, optionally filtered by category slug. */
export async function getArticles({ categorySlug, limit } = {}) {
  const query = {
    content_type: 'knowledgeArticle',
    order: ['-fields.publishedDate'],
    include: 2,
  };
  if (limit) query.limit = limit;
  if (categorySlug) query['fields.category.sys.contentType.sys.id'] = 'knowledgeCategory';

  const res = await getClient().getEntries(query);
  let items = res.items.map(mapArticle);
  if (categorySlug) items = items.filter((a) => a.category?.slug === categorySlug);
  return items;
}

export async function getArticleBySlug(slug) {
  const res = await getClient().getEntries({
    content_type: 'knowledgeArticle',
    'fields.slug': slug,
    include: 2,
    limit: 1,
  });
  return res.items[0] ? mapArticle(res.items[0]) : null;
}

function mapCategory(entry) {
  return {
    id: entry.sys.id,
    slug: entry.fields.slug,
    title: entry.fields.title,
    description: entry.fields.description ?? '',
  };
}

function mapArticle(entry) {
  const category = entry.fields.category?.fields
    ? mapCategory(entry.fields.category)
    : null;
  return {
    id: entry.sys.id,
    slug: entry.fields.slug,
    title: entry.fields.title,
    excerpt: entry.fields.excerpt ?? '',
    body: entry.fields.body ?? null, // rich text document
    coverImageUrl: entry.fields.coverImage?.fields?.file?.url
      ? `https:${entry.fields.coverImage.fields.file.url}`
      : null,
    author: entry.fields.author ?? 'Катерина Єрьоменко',
    publishedDate: entry.fields.publishedDate ?? entry.sys.createdAt,
    updatedDate: entry.sys.updatedAt,
    seoTitle: entry.fields.seoTitle ?? entry.fields.title,
    seoDescription: entry.fields.seoDescription ?? entry.fields.excerpt ?? '',
    category,
  };
}
