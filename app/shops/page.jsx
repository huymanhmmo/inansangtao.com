import content from '../../src/data/content.json';

export const metadata = { title: 'Dịch vụ', description: 'Danh mục sản phẩm và dịch vụ in ấn.', alternates: { canonical: '/shops/' } };
export default function ShopHome() {
  return <main className="wrap"><div className="row"><div className="col-xs-24"><div className="page"><h1>Dịch vụ</h1><div id="products" className="viewgrid row">{content.products.filter((item) => item.moduleName === 'shops').map((item) => { const category = content.productCategories.find((entry) => entry.moduleName === 'shops' && item.categoryIds.includes(entry.id)); const href = `/shops/${category?.alias || 'san-pham'}/${item.alias}/`; return <div className="col-xs-24 col-sm-12 col-md-6" key={item.id}><div className="item"><div className="image"><a href={href} title={item.title}>{item.image && <img src={item.image} alt={item.imageAlt || item.title} />}</a></div><div className="caption text-center"><h3><a href={href}>{item.title}</a></h3><p className="price">{item.price > 0 ? `${item.price.toLocaleString('vi-VN')} ${item.unit || 'VND'}` : 'Liên hệ báo giá'}</p></div></div></div>; })}</div></div></div></div></main>;
}
