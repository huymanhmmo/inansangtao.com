import content from '../src/data/content.json';

export const dynamic = 'force-static';

const origin = 'https://inansangtao.com';
const paths = new Set(['/', '/blog/', '/shops/', '/lien-he/', '/contact/', '/photos/']);
paths.add('/design/');
for (const page of content.pages) paths.add(`/${page.alias}/`);
for (const category of content.categories) paths.add(`/${category.alias}/`);
for (const category of content.productCategories) paths.add(`/${category.moduleName}/${category.alias}/`);
for (const item of content.news) {
  for (const categoryId of new Set(item.categoryIds)) {
    const category = content.categories.find((entry) => entry.id === categoryId);
    if (category) paths.add(`/${category.alias}/${item.alias}-${item.id}/`);
  }
}
for (const item of content.products) {
  const category = content.productCategories.find((entry) => entry.moduleName === item.moduleName && item.categoryIds.includes(entry.id));
  paths.add(`/${item.moduleName}/${category?.alias || 'san-pham'}/${item.alias}/`);
}
for (const category of content.photoCategories) paths.add(`/photos/${category.alias}/`);
for (const album of content.photoAlbums) {
  const category = content.photoCategories.find((entry) => entry.id === album.categoryId);
  if (!category) continue;
  const albumPath = `${album.alias}-${album.id}`;
  paths.add(`/photos/${category.alias}/${albumPath}/`);
  for (const photo of content.photos.filter((entry) => entry.albumId === album.id)) paths.add(`/photos/${category.alias}/${albumPath}/${photo.id}/`);
}

export default function sitemap() {
  return [...paths].map((pathname) => ({ url: `${origin}${pathname}`, changeFrequency: 'monthly', priority: pathname === '/' ? 1 : 0.6 }));
}
