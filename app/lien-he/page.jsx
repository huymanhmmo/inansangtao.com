import content from '../../src/data/content.json';

export const metadata = { title: 'Liên hệ', description: 'Liên hệ In Ấn Sáng Tạo để được tư vấn dịch vụ thiết kế và in ấn.', alternates: { canonical: '/lien-he/' } };
const contactPage = content.pages.find((item) => /lien-he|contact/i.test(item.alias));

export default function Contact() {
  return <main className="listing-page"><section className="page-intro wrap"><span className="eyebrow">CÙNG BẮT ĐẦU</span><h1>Hãy kể chúng tôi<br /><em>nghe ý tưởng của bạn.</em></h1><p>Để lại lời nhắn hoặc xem các thông tin liên hệ của chúng tôi.</p><a className="button button-primary" href="mailto:inansangtao.com@gmail.com">Gửi email tư vấn <span aria-hidden="true">↗</span></a></section>{contactPage?.body && <article className="wrap rich-content" dangerouslySetInnerHTML={{ __html: contactPage.body }} />}</main>;
}
