import content from '../../src/data/content.json';

const categoryForProduct = (item) => content.productCategories.find((category) => category.moduleName === item.moduleName && item.categoryIds?.includes(category.id));

export default function ShopsHome() {
  const categories = content.productCategories.filter((item) => item.moduleName === 'shops');
  const roots = categories.filter((item) => !item.parentId || item.parentId === 0).sort((a, b) => a.weight - b.weight);
  const popular = content.products.find((item) => item.moduleName === 'shops' && /kỷ yếu/i.test(item.title) && item.image) || content.products.find((item) => item.moduleName === 'shops' && item.image);
  return <>
    <div className="legacy-breadcrumb"><div className="wraper"><div className="container">Dịch vụ <span>›</span></div></div></div>
    <main className="wrap shops-index"><div className="row"><div className="col-xs-24 col-md-6 shops-sidebar"><h3>Sản phẩm được quan tâm</h3>{popular && <a href={`/shops/${categoryForProduct(popular)?.alias || 'san-pham'}/${popular.alias}/`}><img src={popular.image} alt={popular.title} /></a>}<h3>Bài viết xem nhiều</h3></div><div className="col-xs-24 col-md-18 shops-catalogs">{roots.map((root) => { const children = categories.filter((item) => item.parentId === root.id).sort((a, b) => a.weight - b.weight); return <section className="shops-catalog" key={root.id}><div className="head-cat"><a href={`/shops/${root.alias}/`}>{root.title}</a><a className="pull-right" href={`/shops/${root.alias}/`}>Xem tất cả</a></div><div className="row">{children.map((item) => <div className="col-xs-12 col-sm-12 col-md-8" key={item.id}><div className="item"><div className="image"><a href={`/shops/${item.alias}/`} title={item.title}><img src={item.image || popular?.image} alt={item.title} /></a></div><div className="caption text-center"><h3><a href={`/shops/${item.alias}/`}>{item.title}</a></h3></div></div></div>)}</div></section>; })}</div></div></main>
  </>;
}
