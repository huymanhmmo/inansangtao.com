import content from '../../src/data/content.json';

export default function Header() {
  const links = [
    ['Dịch vụ in', '/san-pham/'],
    ['Kiến thức in ấn', '/tin-tuc/'],
    ...content.pages.filter((page) => /gioi-thieu|lien-he|ve-chung-toi/i.test(page.alias)).slice(0, 2).map((page) => [page.title, `/${page.alias}/`]),
  ];
  return <header className="header"><div className="wrap header-inner"><a className="brand" href="/" aria-label="In Ấn Sáng Tạo - Trang chủ">IN ẤN <span>SÁNG TẠO</span><i>PRINT • DESIGN • CREATE</i></a><nav aria-label="Điều hướng chính">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}<a className="nav-contact" href="/lien-he/">Nhận tư vấn <span aria-hidden="true">↗</span></a></nav><details className="mobile-menu"><summary aria-label="Mở menu">☰</summary><div>{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}<a href="/lien-he/">Nhận tư vấn</a></div></details></div></header>
}
