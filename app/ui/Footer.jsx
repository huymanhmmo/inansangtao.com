import content from '../../src/data/content.json';
import { menuTree } from './legacy';

function FooterMenu({ title, items }) {
  return <div className="col-xs-24 col-sm-12 col-md-6"><h3>{title}</h3><ul className="menu">{items.map((item) => <li key={item.id}><a href={item.href}>{item.title}</a></li>)}</ul></div>;
}

export default function Footer() {
  const regulations = menuTree(3);
  const productLinks = menuTree(5);
  return <><footer id="footer"><div className="wraper"><div className="container"><div className="row"><div className="col-xs-24 col-sm-12 col-md-6"><ul className="company_info"><li className="logo"><a href="/"><img src={content.site.logo} alt={content.site.name} /></a></li><li>{content.site.description}</li><li><i className="fa fa-phone" /> <a href="tel:0911618185">0911 618 185</a></li><li><i className="fa fa-envelope" /> <a href="mailto:inansangtao.com@gmail.com">inansangtao.com@gmail.com</a></li></ul></div><FooterMenu title="Quy định chung" items={regulations} /><FooterMenu title="Danh mục sản phẩm" items={productLinks} /><div className="col-xs-24 col-sm-12 col-md-6"><h3>Liên hệ</h3><ul className="menu"><li><a href="/lien-he/">Thông tin liên hệ</a></li><li><a href="tel:0911618185">Hotline: 0911 618 185</a></li><li><a href="mailto:inansangtao.com@gmail.com">Gửi email</a></li></ul></div></div></div></div></footer><nav className="footerNav2"><div className="wraper"><div className="container"><div className="copyright">© {new Date().getFullYear()} {content.site.name}. {content.site.description}</div></div></div></nav><div className="social-button"><div className="social-button-content"><a href="tel:0911618185" className="call-icon" rel="nofollow"><i className="fa fa-phone" /><span>Hotline: 0911 618 185</span></a><a href="https://zalo.me/0911618185" className="zalo" target="_blank" rel="noreferrer"><i className="fa fa-commenting-o" /><span>Zalo: 0911 618 185</span></a></div></div></>;
}
