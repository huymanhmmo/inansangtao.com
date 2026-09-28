import content from '../src/data/content.json';
import { safeHtml } from './ui/html';
import { legacyHref } from './ui/legacy';
import OwlCarousel from './ui/OwlCarousel';

export const metadata = { alternates: { canonical: '/' } };
const categories = Object.fromEntries(content.categories.map((item) => [item.id, item]));
const articles = [...content.news].sort((a, b) => b.publishedAt - a.publishedAt);

function ProductFeature({ item }) {
  const category = content.productCategories.find((entry) => entry.moduleName === item.moduleName && item.categoryIds.includes(entry.id));
  const href = `/shops/${category?.alias || 'san-pham'}/${item.alias}/`;
  return <div className="item col"><div className="pg-item"><div className="pg-img"><a href={href} title={item.title}>{item.image && <img src={item.image} alt={item.imageAlt || item.title} />}</a></div><div className="pg-content"><h4><a href={href} title={item.title}>{item.title}</a></h4><p>{item.summary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}</p><a className="read-more" href={href} title={item.title}>Xem thêm</a></div></div></div>;
}

function Banner({ item }) {
  if (!item) return null;
  return <a className="nv-block-banners" href={legacyHref(item.link) || '/lien-he/'} title={item.title}><img src={item.image} alt={item.alt || item.title} /></a>;
}

function HomeProductGroup({ group }) {
  if (!group) return null;
  return <section className="home-product"><div className="wraper"><div className="block-border"><div className="head"><h3><a href={legacyHref(group.link)}>{group.title}</a></h3></div><OwlCarousel className="product-groups" items={4} responsive interval={5000} nav dots loop={false}>{group.products.map((item) => <ProductFeature key={item.id} item={item} />)}</OwlCarousel></div></div></section>;
}

function NewsCard({ item }) {
  const href = `/${categories[item.categoryId]?.alias || 'blog'}/${item.alias}-${item.id}/`;
  return <div className="item"><div className="img">{item.image && <a href={href}><img src={item.image} alt={item.title} /></a>}</div><div className="content"><h3><a href={href}>{item.title}</a></h3><p>{item.summary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}</p><div className="btn-readmore text-center"><a href={href}>Xem thêm</a></div></div></div>;
}

export default function Home() {
  const policies = content.menu.filter((item) => item.groupId === 2 && item.parentId === 0).sort((a, b) => a.id - b.id);
  const technology = articles.filter((item) => [1, 2, 3].includes(item.categoryId)).slice(0, 15);
  const latest = articles.slice(0, 4);
  const bannersLeft = content.banners.filter((banner) => banner.title.toLowerCase().includes('left'));
  const bannersMiddle = content.banners.filter((banner) => banner.title.toLowerCase().includes('mid'));
  const bannerRight = content.banners.find((banner) => banner.title.toLowerCase().includes('right'));
  const [productGroup, designGroup] = content.homepage.productGroups;
  return <>
    <nav><OwlCarousel className="home-slider" items={1} interval={4000} nav dots loop>{content.slider.map((slide, index) => <div className="item" key={slide.title}><img className="image" src={slide.image} alt={slide.title} /><div className="slide-content"><div className="wraper"><div className="row"><div className="col-md-14"><h3>{slide.title}</h3><h4 dangerouslySetInnerHTML={{ __html: safeHtml(slide.description) }} /><p><a href={legacyHref(slide.link) || '/shops/'} className="btn">Đọc tiếp</a></p></div><div className="col-md-10">{slide.contentImage && <div className="slide-content-img"><img className="image_content" src={slide.contentImage} alt={slide.title} /></div>}</div></div></div></div></div>)}</OwlCarousel></nav>
    <section className="outstanding-policy"><div className="wraper"><div className="row">{policies.map((policy) => <div className="col-xs-24 col-sm-12 col-md-6" key={policy.id}><div className="policybox-icon"><i className={policy.icon || 'fa fa-check'} /></div><h3 className="policybox-heading">{policy.title}</h3><p className="policybox-text">{policy.note}</p></div>)}</div></div></section>
    <HomeProductGroup group={productGroup} />
    <section className="home-banner"><div className="wraper"><div className="row"><div className="col-md-8"><div className="banner"><Banner item={bannersLeft[0]} /></div></div><div className="col-md-8 banner_middle"><div className="banner">{bannersMiddle.slice(0, 2).map((item) => <Banner key={item.title} item={item} />)}</div></div><div className="col-md-8"><div className="banner"><Banner item={bannerRight} /></div></div></div></div></section>
    <HomeProductGroup group={designGroup} />
    <section className="production-process"><div className="wraper"><div className="row"><div className="col-xs-24 col-sm-12 col-md-14"><div className="image-production"><img src="/themes/default/images/production.png" alt="Dự án thực hiện" /></div></div><div className="col-xs-24 col-sm-12 col-md-10">{content.productionProcess.map((item) => <div className="item-production" key={item.title}><div className="icon-production"><img src={item.image} alt={item.title} /></div><div className="des-production"><h4 dangerouslySetInnerHTML={{ __html: safeHtml(item.title) }} /><p dangerouslySetInnerHTML={{ __html: safeHtml(item.description) }} /></div><div className="clearfix" /></div>)}</div></div><div className="row"><div className="col-xs-24 col-sm-12 col-md-12"><Banner item={content.banners.find((item) => item.title.includes('Production Banner Left'))} /></div><div className="col-xs-24 col-sm-12 col-md-12"><Banner item={content.banners.find((item) => item.title.includes('Production Banner Right'))} /></div></div></div></section>
    <section className="our-capacity"><div className="wraper"><div className="row"><div className="impression-title"><h3>{content.homepage.capacity.title}</h3><p>{content.homepage.capacity.description}</p></div>{content.homepage.capacity.items.map((item, index) => <div className="col-xs-24 col-sm-24 col-md-6 col" key={index}><div className="circle-number">{item.value}</div><div className="oc-content"><h4>{item.title}</h4><p>{item.description}</p></div></div>)}</div></div></section>
    <section className="home-technology"><div className="wraper"><div className="row"><div className="impression-title"><h3><a href={content.homepage.technology.link}>{content.homepage.technology.title}</a></h3><p>{content.homepage.technology.description}</p></div><OwlCarousel className="technology-carousel" items={4} responsive interval={6000} nav={false} dots={false} loop={false}>{technology.map((item) => <NewsCard key={item.id} item={item} />)}</OwlCarousel></div></div></section>
    <section className="home-blog"><div className="wraper"><div className="row"><div className="block-groups"><div className="col-xs-24 col-sm-12 col-md-12"><div className="item-large"><a href={`/${categories[latest[0]?.categoryId]?.alias || 'blog'}/${latest[0]?.alias}-${latest[0]?.id}/`}>{latest[0]?.image && <img src={latest[0].image} alt={latest[0].title} />}</a><div className="info-large"><div className="info"><h4><a href={`/${categories[latest[0]?.categoryId]?.alias || 'blog'}/${latest[0]?.alias}-${latest[0]?.id}/`}>{latest[0]?.title}</a></h4><p>{latest[0]?.summary}</p></div><div className="date-created">{latest[0] ? new Date(latest[0].publishedAt * 1000).getDate() : ''}</div></div></div></div><div className="col-xs-24 col-sm-12 col-md-12"><ul className="news-item"><li>Bài viết mới nhất <span className="pull-right"><a href="/blog/">Xem tất cả &gt;&gt;</a></span></li>{latest.slice(1).map((item) => <li key={item.id}><h4><a href={`/${categories[item.categoryId]?.alias || 'blog'}/${item.alias}-${item.id}/`}>{item.title}</a></h4><div className="publtime">{new Date(item.publishedAt * 1000).toLocaleDateString('vi-VN')}</div><p>{item.summary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}</p></li>)}</ul></div></div></div></div></section>
    <section className="produce-home"><div className="wraper"><div className="row"><h2>Được tin dùng bởi hơn 800 doanh nghiệp và thương hiệu lớn</h2><div className="content-produce-home"><ul className="list-logo marquee">{[...content.produceHome, ...content.produceHome].map((item, index) => <li key={`${item.image}-${index}`}>{item.link ? <a href={legacyHref(item.link)}><img src={item.image} alt={item.title || 'Khách hàng'} /></a> : <img src={item.image} alt={item.title || 'Khách hàng'} />}</li>)}</ul></div></div></div></section>
  </>;
}
