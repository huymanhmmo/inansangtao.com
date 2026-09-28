import content from '../../src/data/content.json';
import ContentCard from '../ui/ContentCard';

export const metadata = { title: 'Kiến thức in ấn', description: 'Kinh nghiệm thiết kế, lựa chọn chất liệu và giải pháp in ấn.', alternates: { canonical: '/tin-tuc/' } };
const categoryById = Object.fromEntries(content.categories.map((category) => [category.id, category]));
const items = [...content.news].sort((a, b) => b.publishedAt - a.publishedAt).map((item) => ({ ...item, categoryTitle: categoryById[item.categoryId]?.title, categoryAlias: categoryById[item.categoryId]?.alias }));

export default function Articles() {
  return <main className="listing-page"><section className="page-intro wrap"><span className="eyebrow">GÓC CHIA SẺ</span><h1>Kiến thức <em>in ấn.</em></h1><p>Kinh nghiệm, ý tưởng và những điều hữu ích từ thế giới thiết kế và in ấn.</p></section><section className="wrap listing-grid">{items.map((item) => <ContentCard key={item.id} item={item} />)}</section></main>;
}
