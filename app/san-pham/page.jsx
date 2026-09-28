import content from '../../src/data/content.json';
import ContentCard from '../ui/ContentCard';

export const metadata = { title: 'Dịch vụ in ấn', description: 'Các sản phẩm và dịch vụ in ấn theo yêu cầu.', alternates: { canonical: '/san-pham/' } };
const categories = Object.fromEntries(content.productCategories.map((category) => [category.id, category]));

export default function Services() {
  const items = content.products.map((item) => ({ ...item, categoryAlias: categories[item.categoryIds[0]]?.alias }));
  return <main className="listing-page"><section className="page-intro wrap"><span className="eyebrow">THIẾT KẾ & IN ẤN</span><h1>Giải pháp <em>trọn vẹn.</em></h1><p>Mỗi sản phẩm được chăm chút từ ý tưởng, chất liệu đến khâu hoàn thiện cuối cùng.</p></section><section className="wrap listing-grid">{items.map((item) => <ContentCard key={item.id} item={item} kind="product" />)}</section></main>;
}
