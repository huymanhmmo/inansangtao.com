import content from '../../src/data/content.json';

const stripHtml = (value = '') => value.replace(/&amp;/g, '&');

export function legacyHref(value = '') {
  const href = stripHtml(value);
  if (!href || href === '#') return '#';
  if (/^https?:\/\//i.test(href) && !/https?:\/\/(www\.)?inansangtao\.com/i.test(href)) return href;
  if (href.startsWith('/index.php')) {
    const url = new URL(href, 'https://inansangtao.com');
    const module = url.searchParams.get('nv');
    const operation = (url.searchParams.get('op') || '').replace(/\.html?$/i, '');
    if (module === 'contact') return '/lien-he/';
    if (module === 'photos') return '/photos/';
    if (module === 'qua-tang-su-kien') return '/shops/';
    if (module === 'shops' || module === 'an-pham-tet-2019') {
      const prefix = module;
      if (!operation) return module === 'shops' ? '/shops/' : `/${module}/`;
      const productCategory = content.productCategories.find((entry) => entry.moduleName === module && entry.alias === operation);
      if (productCategory) return `/${prefix}/${productCategory.alias}/`;
      const product = content.products.find((entry) => entry.moduleName === module && entry.alias === operation);
      if (product) {
        const category = content.productCategories.find((entry) => entry.moduleName === module && product.categoryIds.includes(entry.id));
        return `/${prefix}/${category?.alias || 'san-pham'}/${product.alias}/`;
      }
      return `/${prefix}/`;
    }
    if (module === 'news') {
      const category = content.categories.find((entry) => entry.alias === operation);
      if (category) return `/${category.alias}/`;
      const article = content.news.find((entry) => entry.alias === operation);
      if (article) {
        const parent = content.categories.find((entry) => entry.id === article.categoryId);
        return `/${parent?.alias || 'blog'}/${article.alias}-${article.id}/`;
      }
      return '/blog/';
    }
    if (module === 'page') {
      const page = content.pages.find((entry) => entry.alias === operation);
      if (page) return `/${page.alias}/`;
    }
  }
  if (/^https?:\/\/(www\.)?inansangtao\.com/i.test(href)) {
    const url = new URL(href);
    return legacyHref(`${url.pathname}${url.search}`);
  }
  if (/^\/(?:www\.)?inansangtao\.com\//i.test(href)) return legacyHref(href.replace(/^\/[^/]+/, ''));
  if (href.startsWith('/shops/')) {
    const parts = href.split('/').filter(Boolean).slice(1);
    const category = content.productCategories.find((entry) => entry.alias === parts[0]);
    const last = (parts.at(-1) || '').replace(/\.html?$/i, '').replace(/-\d+$/, '');
    const product = content.products.find((entry) => entry.alias === last);
    if (product) {
      const parent = content.productCategories.find((entry) => product.categoryIds.includes(entry.id));
      return `/shops/${parent?.alias || category?.alias || 'san-pham'}/${product.alias}/`;
    }
    return category ? `/shops/${category.alias}/` : '/shops/';
  }
  if (href.startsWith('/an-pham-tet-2019/')) {
    const parts = href.split('/').filter(Boolean).slice(1);
    const category = content.productCategories.find((entry) => entry.moduleName === 'an-pham-tet-2019' && entry.alias === parts[0]);
    const last = (parts.at(-1) || '').replace(/\.html?$/i, '').replace(/-\d+$/, '');
    const product = content.products.find((entry) => entry.moduleName === 'an-pham-tet-2019' && entry.alias === last);
    if (product) {
      const parent = content.productCategories.find((entry) => entry.moduleName === 'an-pham-tet-2019' && product.categoryIds.includes(entry.id));
      return `/an-pham-tet-2019/${parent?.alias || category?.alias || 'san-pham'}/${product.alias}/`;
    }
    return category ? `/an-pham-tet-2019/${category.alias}/` : '/an-pham-tet-2019/';
  }
  if (href.startsWith('/photos/')) {
    const parts = href.split('/').filter(Boolean).slice(1);
    const category = content.photoCategories.find((entry) => entry.alias === parts[0]);
    const albumSlug = parts[1] || '';
    const album = content.photoAlbums.find((entry) => `${entry.alias}-${entry.id}` === albumSlug || entry.alias === albumSlug);
    if (album && category) {
      const photoId = (parts[2] || '').replace(/\.html?$/i, '');
      return photoId ? `/photos/${category.alias}/${album.alias}-${album.id}/${photoId}/` : `/photos/${category.alias}/${album.alias}-${album.id}/`;
    }
    return category ? `/photos/${category.alias}/` : '/photos/';
  }
  if (href.startsWith('/blog/') || href.startsWith('/news/')) {
    const parts = href.split('/').filter(Boolean);
    const category = content.categories.find((entry) => entry.alias === parts[0]);
    const last = (parts.at(-1) || '').replace(/\.html?$/i, '').replace(/-\d+$/, '');
    const article = content.news.find((entry) => entry.alias === last);
    if (article) {
      const parent = content.categories.find((entry) => entry.id === article.categoryId);
      return `/${parent?.alias || 'blog'}/${article.alias}-${article.id}/`;
    }
    return category ? `/${category.alias}/` : '/blog/';
  }
  return href;
}

export function menuTree(groupId = 1) {
  const entries = content.menu.filter((item) => item.groupId === groupId);
  const build = (parentId) => entries.filter((item) => item.parentId === parentId).map((item) => ({ ...item, href: legacyHref(item.link), children: build(item.id) }));
  return build(0);
}
