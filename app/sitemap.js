import content from '../src/data/content.json';

export const dynamic = 'force-static';

const origin = 'https://inansangtao.com';
const paths = new Set(['/', '/tin-tuc/', '/san-pham/', '/lien-he/']);
for (const page of content.pages) paths.add(`/${page.alias}/`);
for (const category of [...content.categories, ...content.productCategories]) paths.add(`/${category.alias}/`);
for (const item of content.news) {
  const category = content.categories.find((entry) => entry.id === item.categoryId);
  paths.add(`/${category?.alias || 'tin-tuc'}/${item.alias}-${item.id}/`);
}
for (const item of content.products) {
  const category = content.productCategories.find((entry) => item.categoryIds.includes(entry.id));
  paths.add(`/${category?.alias || 'san-pham'}/${item.alias}-${item.id}/`);
}

export default function sitemap() {
  return [...paths].map((pathname) => ({ url: `${origin}${pathname}`, changeFrequency: 'monthly', priority: pathname === '/' ? 1 : 0.6 }));
}
