import Header from './ui/Header';
import Footer from './ui/Footer';

export const metadata = {
  metadataBase: new URL('https://inansangtao.com'),
  title: { default: 'In Ấn Sáng Tạo | Chia sẻ thành công, kết nối đam mê', template: '%s | In Ấn Sáng Tạo' },
  description: 'Dịch vụ in ấn và thiết kế sáng tạo. Chia sẻ kinh nghiệm, giải pháp và sản phẩm in ấn chất lượng.',
};

export default function RootLayout({ children }) {
  return <html lang="vi"><head><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="stylesheet" href="/assets/css/font-awesome.min.css"/><link rel="stylesheet" href="/themes/default/css/bootstrap.min.css"/><link rel="stylesheet" href="/themes/default/css/style.css"/><link rel="stylesheet" href="/themes/default/css/home.css"/><link rel="stylesheet" href="/themes/default/css/animate.css"/><link rel="stylesheet" href="/themes/default/css/style.responsive.css"/><link rel="stylesheet" href="/themes/default/css/news.css"/><link rel="stylesheet" href="/themes/default/css/shops.css"/><link rel="stylesheet" href="/themes/default/css/photos.css"/><link rel="stylesheet" href="/themes/default/css/legacy-conversion.css"/><link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&amp;subset=vietnamese"/></head><body><div className="wsmenucontainer clearfix"><div className="overlapblackbg"/><div className="body-bg"><Header />{children}<Footer /></div></div></body></html>
}
