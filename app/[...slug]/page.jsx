import { notFound } from 'next/navigation';
import content from '../../src/data/content.json';
import ContentCard from '../ui/ContentCard';
import { safeHtml } from '../ui/html';

const newsCategories = Object.fromEntries(content.categories.map((category) => [category.id, category]));
const productCategories = Object.fromEntries(content.productCategories.map((category) => [category.id, category]));
const getRoute = (item) => `${item.alias}-${item.id}`;
const categoryFor = (item, categories) => categories[item.categoryId] ?? Object.values(categories).find((category) => item.categoryIds?.includes(category.id));
const staticParams = [
  ...content.news.map((item) => [categoryFor(item, newsCategories)?.alias || 'tin-tuc', getRoute(item)]),
  ...content.products.map((item) => [categoryFor(item, productCategories)?.alias || 'san-pham', getRoute(item)]),
  ...content.categories.map((category) => [category.alias]),
  ...content.productCategories.map((category) => [category.alias]),
  ...content.pages.map((page) => [page.alias]),
];
const uniqueParams = new Map(staticParams.filter((parts) => parts.every(Boolean)).map((slug) => [slug.join('/'), { slug }]));

export function generateStaticParams() { return [...uniqueParams.values()]; }

function findDetail(route) {
  const news = content.news.find((item) => getRoute(item) === route);
  if (news) return { ...news, type: 'news', category: newsCategories[news.categoryId] };
  const product = content.products.find((item) => getRoute(item) === route);
  if (product) return { ...product, type: 'product', category: categoryFor(product, productCategories) };
  return null;
}

function CategoryListing({ title, description, items, kind }) {
  return <main className="listing-page"><section className="page-intro wrap"><span className="eyebrow">{kind === 'product' ? 'DỊCH VỤ IN ẤN' : 'GÓC CHIA SẺ'}</span><h1>{title}</h1>{description && <p>{description}</p>}</section><section className="wrap listing-grid">{items.map((item) => <ContentCard key={item.id} item={item} kind={kind} />)}</section></main>;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = findDetail(slug.at(-1));
  const page = content.pages.find((entry) => entry.alias === slug.at(-1));
  const category = content.categories.find((entry) => entry.alias === slug.at(-1)) || content.productCategories.find((entry) => entry.alias === slug.at(-1));
  return { title: item?.title || page?.title || category?.title || 'In Ấn Sáng Tạo', description: item?.description || page?.description || category?.description || undefined, alternates: { canonical: `/${slug.join('/')}/` } };
}

export default async function LegacyRoute({ params }) {
  const { slug } = await params;
  const last = slug.at(-1);
  const item = findDetail(last);
  if (item) {
    const contact = item.type === 'product' ? <a className="button button-primary" href="/lien-he/">Liên hệ nhận báo giá <span aria-hidden="true">↗</span></a> : null;
    return <main className="article-page wrap"><div className="breadcrumbs"><a href="/">Trang chủ</a><span>/</span><a href={item.type === 'product' ? '/san-pham/' : '/tin-tuc/'}>{item.type === 'product' ? 'Dịch vụ in' : 'Kiến thức in ấn'}</a></div><article><header className="article-head"><span className="eyebrow">{item.category?.title || (item.type === 'product' ? 'DỊCH VỤ IN ẤN' : 'KIẾN THỨC IN ẤN')}</span><h1>{item.title}</h1>{item.description && <p className="article-summary">{item.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}</p>}</header>{item.image && <img className="article-cover" src={item.image} alt={item.imageAlt || item.title} />}{item.type === 'product' && <div className="product-action">{contact}</div>}<div className="rich-content" dangerouslySetInnerHTML={{ __html: safeHtml(item.body) }} />{item.type === 'product' && <div className="product-action product-action-bottom">{contact}</div>}</article></main>;
  }
  const page = content.pages.find((entry) => entry.alias === last);
  if (page) return <main className="article-page wrap"><div className="breadcrumbs"><a href="/">Trang chủ</a><span>/</span>{page.title}</div><article><header className="article-head"><span className="eyebrow">IN ẤN SÁNG TẠO</span><h1>{page.title}</h1>{page.description && <p className="article-summary">{page.description}</p>}</header>{page.image && <img className="article-cover" src={page.image} alt={page.title} />}<div className="rich-content" dangerouslySetInnerHTML={{ __html: safeHtml(page.body) }} /></article></main>;
  const newsCategory = content.categories.find((entry) => entry.alias === last);
  if (newsCategory) {
    const items = content.news.filter((entry) => entry.categoryIds.includes(newsCategory.id)).map((entry) => ({ ...entry, categoryAlias: newsCategory.alias, categoryTitle: newsCategory.title }));
    return <CategoryListing title={newsCategory.title} description={newsCategory.description} items={items} kind="news" />;
  }
  const productCategory = content.productCategories.find((entry) => entry.alias === last);
  if (productCategory) {
    const items = content.products.filter((entry) => entry.categoryIds.includes(productCategory.id)).map((entry) => ({ ...entry, categoryAlias: productCategory.alias }));
    return <CategoryListing title={productCategory.title} description={productCategory.description} items={items} kind="product" />;
  }
  notFound();
}
