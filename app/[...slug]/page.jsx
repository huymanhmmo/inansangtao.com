import { notFound } from 'next/navigation';
import content from '../../src/data/content.json';
import { safeHtml } from '../ui/html';

const newsCategories = Object.fromEntries(content.categories.map((category) => [category.id, category]));
const getRoute = (item) => `${item.alias}-${item.id}`;
const categoryForNews = (item) => newsCategories[item.categoryId];
const categoryForProduct = (item) => content.productCategories.find((category) => category.moduleName === item.moduleName && item.categoryIds?.includes(category.id));
const staticParams = [
  ['design'],
  ...content.news.flatMap((item) => [...new Set(item.categoryIds)].map((categoryId) => [newsCategories[categoryId]?.alias || categoryForNews(item)?.alias || 'blog', getRoute(item)])),
  ...content.products.map((item) => [item.moduleName, categoryForProduct(item)?.alias || 'san-pham', item.alias]),
  ...content.categories.map((category) => [category.alias]),
  ...content.productCategories.map((category) => [category.moduleName, category.alias]),
  ...[...new Set([...content.products.map((item) => item.moduleName), ...content.productCategories.map((item) => item.moduleName)])].map((module) => [module]),
  ['photos'],
  ...content.photoCategories.map((category) => ['photos', category.alias]),
  ...content.photoAlbums.flatMap((album) => {
    const category = content.photoCategories.find((entry) => entry.id === album.categoryId);
    if (!category) return [];
    const albumPath = `${album.alias}-${album.id}`;
    return [
      ['photos', category.alias, albumPath],
      ...content.photos.filter((photo) => photo.albumId === album.id).map((photo) => ['photos', category.alias, albumPath, String(photo.id)]),
    ];
  }),
  ...content.pages.map((page) => [page.alias]),
];
const uniqueParams = new Map(staticParams.filter((parts) => parts.every(Boolean)).map((slug) => [slug.join('/'), { slug }]));

export function generateStaticParams() { return [...uniqueParams.values()]; }

function findDetail(route, moduleName) {
  const news = content.news.find((item) => getRoute(item) === route);
  if (news) return { ...news, type: 'news', category: newsCategories[news.categoryId] };
  const product = content.products.find((item) => item.moduleName === moduleName && (getRoute(item) === route || item.alias === route));
  if (product) return { ...product, type: 'product', category: categoryForProduct(product) };
  return null;
}

function CategoryListing({ title, description, items, kind }) {
  if (kind === 'product') return <main className="wrap"><div className="row"><div className="col-xs-24"><div className="page"><h1>{title}</h1>{description && <p>{description}</p>}<div className="viewgrid row">{items.map((item) => { const href = `/${item.moduleName || 'shops'}/${item.categoryAlias}/${item.alias}/`; return <div className="col-xs-24 col-sm-12 col-md-6" key={`${item.moduleName}-${item.id}`}><div className="item"><div className="image"><a href={href} title={item.title}>{item.image && <img src={item.image} alt={item.imageAlt || item.title} />}</a></div><div className="caption text-center"><h3><a href={href}>{item.title}</a></h3><p className="price">{item.price > 0 ? `${item.price.toLocaleString('vi-VN')} ${item.unit || 'VND'}` : 'Liên hệ báo giá'}</p></div></div></div>; })}</div></div></div></div></main>;
  const article = (item) => <article className="category-news" key={item.id}><h2><a href={`/${item.categoryAlias}/${item.alias}-${item.id}/`} title={item.title}>{item.title}</a></h2><div className="text-muted"><i className="fa fa-clock-o" /> {new Date(item.publishedAt * 1000).toLocaleDateString('vi-VN')} <i className="fa fa-eye" /> {item.hits || ''}</div>{item.image && <div className="post-thumbnail"><a href={`/${item.categoryAlias}/${item.alias}-${item.id}/`}><img src={item.image} alt={item.imageAlt || item.title} /></a></div>}<p>{item.summary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}</p></article>;
  return <main className="wrap"><div className="row"><div className="col-xs-24 col-md-16"><div className="news_column"><h1>{title}</h1>{description && <p>{description}</p>}{items.map((item, index) => article(item, index === 0))}</div></div><aside className="col-xs-24 col-md-8 widget-right"><div className="block-border"><h3>Mạng xã hội</h3><ul className="socialList"><li><a href="https://facebook.com/Inansangtao.Com.0903419596/">Facebook</a></li><li><a href="https://youtube.com/">YouTube</a></li></ul></div></aside></div></main>;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = findDetail(slug.at(-1), slug[0]);
  const page = content.pages.find((entry) => entry.alias === slug.at(-1));
  const category = content.categories.find((entry) => entry.alias === slug.at(-1)) || content.productCategories.find((entry) => entry.alias === slug.at(-1));
  return { title: item?.title || page?.title || category?.title || 'In Ấn Sáng Tạo', description: item?.description || page?.description || category?.description || undefined, alternates: { canonical: `/${slug.join('/')}/` } };
}

export default async function LegacyRoute({ params }) {
  const { slug } = await params;
  const last = slug.at(-1);
  const item = findDetail(last, slug[0]);
  if (item) {
    const categoryAlias = item.category?.alias;
    const requestedCategory = content.categories.find((entry) => entry.alias === slug[0] && item.categoryIds?.includes(entry.id));
    const detailHref = item.type === 'product' ? `/${item.moduleName}/${categoryAlias || 'san-pham'}/${item.alias}/` : `/${requestedCategory?.alias || categoryAlias || 'blog'}/${item.alias}-${item.id}/`;
    const contact = item.type === 'product' ? <a className="hotline" href="tel:0911618185">Liên hệ đặt hàng: 0911 618 185</a> : null;
    return <main className="wrap"><div className="row"><div className="col-xs-24"><div className="detail"><h1>{item.title}</h1>{item.type === 'news' && <div className="dt-info"><ul><li><i className="fa fa-calendar-o" /> {new Date(item.publishedAt * 1000).toLocaleDateString('vi-VN')}</li></ul></div>}{item.image && <figure className="article left"><img className="img-thumbnail" src={item.image} alt={item.imageAlt || item.title} /></figure>}{item.summary && <div className="hometext m-bottom" dangerouslySetInnerHTML={{ __html: safeHtml(item.summary) }} />}{item.type === 'product' && <div className="product-action">{contact}</div>}<div id="news-bodyhtml" className="bodytext margin-bottom-lg" dangerouslySetInnerHTML={{ __html: safeHtml(item.body) }} />{item.type === 'product' && <div className="product-action product-action-bottom">{contact}</div>}</div><div className="news_column panel panel-default"><div className="panel-body"><div className="fb-comments" data-width="100%" data-href={`https://inansangtao.com${detailHref}`} data-num-posts="5" data-adapt-container-width="true" /></div></div></div></div></main>;
  }
  const page = content.pages.find((entry) => entry.alias === last);
  if (page) return <main className="wrap"><div className="row"><div className="col-xs-24"><div className="page"><h1>{page.title}</h1>{page.image && <img className="img-thumbnail pull-left imghome" src={page.image} alt={page.title} />}<div className="hometext">{page.description}</div><div className="bodytext" dangerouslySetInnerHTML={{ __html: safeHtml(page.body) }} /></div></div></div></main>;
  const newsCategory = content.categories.find((entry) => entry.alias === last);
  if (newsCategory) {
    const descendantIds = new Set([newsCategory.id]);
    let hasDescendants = true;
    while (hasDescendants) { hasDescendants = false; for (const category of content.categories) if (descendantIds.has(category.parentId) && !descendantIds.has(category.id)) { descendantIds.add(category.id); hasDescendants = true; } }
    const items = content.news.filter((entry) => entry.categoryIds.some((id) => descendantIds.has(id))).sort((a, b) => b.publishedAt - a.publishedAt).map((entry) => ({ ...entry, categoryAlias: newsCategory.alias, categoryTitle: newsCategory.title }));
    return <CategoryListing title={newsCategory.title} description={newsCategory.description} items={items} kind="news" />;
  }
  const productCategory = content.productCategories.find((entry) => entry.alias === last && entry.moduleName === slug[0]);
  if (productCategory) {
    const items = content.products.filter((entry) => entry.moduleName === productCategory.moduleName && entry.categoryIds.includes(productCategory.id)).map((entry) => ({ ...entry, categoryAlias: productCategory.alias }));
    return <CategoryListing title={productCategory.title} description={productCategory.description} items={items} kind="product" />;
  }
  const moduleProducts = content.products.filter((entry) => entry.moduleName === last);
  if (slug.length === 1 && moduleProducts.length) return <CategoryListing title="Ấn phẩm Tết 2019" description="" items={moduleProducts.map((entry) => ({ ...entry, categoryAlias: categoryForProduct(entry)?.alias }))} kind="product" />;
  if (slug[0] === 'photos') {
    const photoCategory = content.photoCategories.find((entry) => entry.alias === slug[1]);
    const albumSlug = slug[2] || '';
    const album = content.photoAlbums.find((entry) => `${entry.alias}-${entry.id}` === albumSlug);
    const photo = content.photos.find((entry) => entry.albumId === album?.id && String(entry.id) === slug[3]);
    if (photo && album) return <main className="wrap"><div className="row"><div className="col-xs-24"><div className="page"><h1>{photo.title || album.title}</h1><div className="view_detail pd10"><img className="img-responsive center-block" src={photo.image} alt={photo.title || album.title} /><p>{photo.description}</p></div></div></div></div></main>;
    if (album) {
      const items = content.photos.filter((entry) => entry.albumId === album.id);
      return <main className="wrap"><div className="row"><div className="col-xs-24"><div className="page"><h1>{album.title}</h1><p>{album.description}</p><div className="row">{items.map((entry) => <div className="col-xs-24 col-sm-8 col-md-6" key={entry.id}><a href={`/photos/${photoCategory?.alias}/${album.alias}-${album.id}/${entry.id}/`}><img className="img-thumbnail" src={entry.thumbnail || entry.image} alt={entry.title || album.title} /></a></div>)}</div></div></div></div></main>;
    }
    if (photoCategory) {
      const albums = content.photoAlbums.filter((entry) => entry.categoryId === photoCategory.id);
      return <main className="wrap"><div className="row"><div className="col-xs-24"><div className="page"><h1>{photoCategory.title}</h1><p>{photoCategory.description}</p><div className="row">{albums.map((entry) => <div className="col-xs-24 col-sm-8 col-md-6" key={entry.id}><a href={`/photos/${photoCategory.alias}/${entry.alias}-${entry.id}/`}><h3>{entry.title}</h3></a><p>{entry.description}</p></div>)}</div></div></div></div></main>;
    }
    return <main className="wrap"><div className="row"><div className="col-xs-24"><div className="page"><h1>Catalogue ảnh</h1><div className="row">{content.photoCategories.map((entry) => <div className="col-xs-24 col-sm-8 col-md-6" key={entry.id}><a href={`/photos/${entry.alias}/`}><h3>{entry.title}</h3></a><p>{entry.description}</p></div>)}</div></div></div></div></main>;
  }
  notFound();
}
