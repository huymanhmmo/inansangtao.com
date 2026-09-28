import content from '../src/data/content.json';
import ContentCard from './ui/ContentCard';

export const metadata = { alternates: { canonical: '/' } };

const categoryById = Object.fromEntries(content.categories.map((category) => [category.id, category]));
const latest = [...content.news].sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 6).map((item) => ({ ...item, categoryTitle: categoryById[item.categoryId]?.title, categoryAlias: categoryById[item.categoryId]?.alias }));
const services = content.products.slice(0, 3).map((item) => ({ ...item, categoryAlias: content.productCategories.find((category) => item.categoryIds.includes(category.id))?.alias }));

export default function Home() {
  return <main><section className="hero"><div className="wrap hero-grid"><div className="hero-copy"><span className="eyebrow eyebrow-light">ĐỒNG HÀNH CÙNG THƯƠNG HIỆU VIỆT</span><h1>Ý tưởng đẹp.<br /><em>Ấn phẩm</em> chỉn chu.</h1><p>Giải pháp thiết kế và in ấn cho doanh nghiệp, từ tấm danh thiếp đầu tiên đến những chiến dịch thương hiệu đáng nhớ.</p><div className="hero-actions"><a className="button button-primary" href="/san-pham/">Khám phá dịch vụ <span aria-hidden="true">↗</span></a><a className="hero-secondary" href="/tin-tuc/">Góc kiến thức <span aria-hidden="true">→</span></a></div><div className="hero-note"><span className="note-dot" /> Thiết kế • In ấn • Hoàn thiện</div></div><div className="hero-art" aria-label="Thiết kế sáng tạo và in ấn chất lượng"><div className="art-label">IN ĐÚNG<br />Ý TƯỞNG.</div><div className="art-circle" /><div className="paper paper-back" /><div className="paper paper-front"><span>ẤN PHẨM<br />CỦA BẠN</span><b>01 / 24</b></div><div className="art-stamp">MADE<br />WITH<br /><strong>CARE</strong></div></div></div><div className="hero-bottom"><div className="wrap hero-bottom-inner"><span>ĐỒNG HÀNH TỪ Ý TƯỞNG ĐẾN THÀNH PHẨM</span><span>Thiết kế và in ấn theo yêu cầu <b>↘</b></span></div></div></section>
    <section className="section wrap"><div className="section-head"><div><span className="eyebrow">DỊCH VỤ CỦA CHÚNG TÔI</span><h2>In đẹp để <em>được nhớ.</em></h2></div><a className="text-link" href="/san-pham/">Xem tất cả dịch vụ <span aria-hidden="true">→</span></a></div><div className="card-grid product-grid">{services.map((item) => <ContentCard key={item.id} item={item} kind="product" />)}</div></section>
    <section className="feature-band"><div className="wrap feature-inner"><div><span className="eyebrow eyebrow-light">CÙNG BẠN TẠO DẤU ẤN RIÊNG</span><h2>Từ một nét phác,<br />đến điều <em>khác biệt.</em></h2></div><a className="button button-outline" href="/lien-he/">Bắt đầu dự án <span aria-hidden="true">↗</span></a></div></section>
    <section className="section wrap"><div className="section-head"><div><span className="eyebrow">GÓC CHIA SẺ</span><h2>Chuyện nghề <em>in ấn.</em></h2></div><a className="text-link" href="/tin-tuc/">Đọc thêm bài viết <span aria-hidden="true">→</span></a></div><div className="card-grid">{latest.map((item) => <ContentCard key={item.id} item={item} />)}</div></section>
  </main>;
}
