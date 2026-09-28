import content from '../../src/data/content.json';
import { menuTree } from './legacy';

function MenuItems({ items }) {
  return items.map((item) => <li key={item.id} className={item.children.length ? 'dropdown' : ''}><a href={item.href} target={item.target} rel={item.target === '_blank' ? 'noreferrer' : undefined}>{item.title}{item.children.length > 0 && <span className="caret" />}</a>{item.children.length > 0 && <ul className="dropdown-menu">{item.children.map((child) => <li key={child.id}><a href={child.href} target={child.target} rel={child.target === '_blank' ? 'noreferrer' : undefined}>{child.title}</a></li>)}</ul>}</li>);
}

export default function Header() {
  const items = menuTree(1);
  return <><header><div className="wraper"><div className="container"><div id="header" className="row"><div className="logo col-xs-16 col-sm-12 col-md-4"><a title={content.site.name} href="/"><img src={content.site.logo} alt={content.site.name} /></a></div><div className="col-xs-8 col-sm-24 col-md-18"><nav className="second-nav" id="menusite"><div className="navbar navbar-default"><ul className="nav navbar-nav">{MenuItems({ items })}</ul></div></nav></div><div className="hidden-xs col-sm-24 col-md-4"><div className="headerSearch"><div className="input-group"><form action="/blog/" method="get"><input className="form-control" name="q" maxLength="100" placeholder="Tìm kiếm..." /><button className="btn btn-info" aria-label="Tìm kiếm"><i className="fa fa-search" /></button></form></div></div></div></div></div></div></header><nav className="header-nav"><div className="wraper"><div className="container"><div className="row"><div className="col-md-24"><div className="contactDefault"><a href="/lien-he/">Liên hệ</a><span> | </span><a href="tel:0911618185">Hotline: 0911 618 185</a></div></div></div></div></div></nav></>;
}
