import './site.css';
import Header from './ui/Header';

export const metadata = {
  metadataBase: new URL('https://inansangtao.com'),
  title: { default: 'In Ấn Sáng Tạo | Chia sẻ thành công, kết nối đam mê', template: '%s | In Ấn Sáng Tạo' },
  description: 'Dịch vụ in ấn và thiết kế sáng tạo. Chia sẻ kinh nghiệm, giải pháp và sản phẩm in ấn chất lượng.',
};

export default function RootLayout({ children }) {
  return <html lang="vi"><body><Header />{children}<footer className="footer"><div className="wrap footer-inner"><a className="brand brand-light" href="/">IN ẤN <span>SÁNG TẠO</span></a><p>Chia sẻ thành công, kết nối đam mê.</p><a href="/lien-he/">Liên hệ tư vấn <span aria-hidden="true">↗</span></a></div><div className="footer-bottom"><div className="wrap">© {new Date().getFullYear()} In Ấn Sáng Tạo</div></div></footer></body></html>
}
