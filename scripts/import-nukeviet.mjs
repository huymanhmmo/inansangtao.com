import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? path.resolve(args[index + 1]) : fallback;
};
const sqlPath = option('--sql', path.resolve(root, '..', '..', 'h02b7abdac_inansang_com.sql'));
const legacyRoot = option('--legacy', path.join(root, 'public_html'));
const uploadsRoot = path.join(legacyRoot, 'uploads');

if (!fs.existsSync(sqlPath)) {
  console.error(`Không tìm thấy SQL: ${sqlPath}`);
  console.error('Chạy: npm run import -- --sql "đường-dẫn-tới-file.sql" --legacy "đường-dẫn-public_html"');
  process.exit(1);
}

const dump = fs.readFileSync(sqlPath, 'utf8');
const wanted = /^(?:ccgdev_vi_news_\d+|ccgdev_vi_news_detail|ccgdev_vi_news_cat|ccgdev_vi_news_topics|ccgdev_vi_page|ccgdev_shops_rows|ccgdev_shops_catalogs|ccgdev_shops_block|ccgdev_an_pham_tet_2019_rows|ccgdev_an_pham_tet_2019_catalogs|ccgdev_vi_photos_rows|ccgdev_vi_photos_album|ccgdev_vi_photos_category|ccgdev_vi_menu|ccgdev_vi_menu_rows|ccgdev_vi_slider_rows|ccgdev_banners_rows|ccgdev_vi_produce_home_rows|ccgdev_vi_production_process_rows|ccgdev_vi_blocks_groups|ccgdev_config)$/;
const tables = new Map();

function parseValues(input) {
  const rows = [];
  let i = 0;
  const whitespace = () => { while (/\s/.test(input[i] ?? '')) i++; };
  while (i < input.length) {
    whitespace();
    if (input[i] === ';') break;
    if (input[i] === ',') { i++; continue; }
    if (input[i] !== '(') { i++; continue; }
    i++;
    const row = [];
    while (i < input.length) {
      whitespace();
      if (input[i] === "'") {
        i++;
        let value = '';
        while (i < input.length && input[i] !== "'") {
          if (input[i] === '\\' && i + 1 < input.length) {
            const next = input[++i];
            const escapes = { '0': '\0', b: '\b', n: '\n', r: '\r', t: '\t', Z: '\x1a' };
            value += escapes[next] ?? next;
            i++;
          } else if (input[i] === "'" && input[i + 1] === "'") {
            value += "'"; i += 2;
          } else {
            value += input[i++];
          }
        }
        i++;
        row.push(value);
      } else {
        const start = i;
        while (i < input.length && input[i] !== ',' && input[i] !== ')') i++;
        const raw = input.slice(start, i).trim();
        row.push(raw.toUpperCase() === 'NULL' ? null : /^-?\d+(?:\.\d+)?$/.test(raw) ? Number(raw) : raw);
      }
      whitespace();
      if (input[i] === ',') { i++; continue; }
      if (input[i] === ')') { i++; break; }
      break;
    }
    rows.push(row);
  }
  return rows;
}

const insert = /INSERT INTO `([^`]+)`\s*\(([^;]*?)\)\s*VALUES\s*/g;
let match;
while ((match = insert.exec(dump))) {
  const table = match[1];
  if (!wanted.test(table)) continue;
  const columns = [...match[2].matchAll(/`([^`]+)`/g)].map((item) => item[1]);
  let cursor = insert.lastIndex;
  let quoted = false;
  while (cursor < dump.length) {
    if (dump[cursor] === '\\' && quoted) { cursor += 2; continue; }
    if (dump[cursor] === "'") {
      if (quoted && dump[cursor + 1] === "'") { cursor += 2; continue; }
      quoted = !quoted;
    }
    if (dump[cursor] === ';' && !quoted) break;
    cursor++;
  }
  const values = parseValues(dump.slice(insert.lastIndex, cursor));
  if (!tables.has(table)) tables.set(table, []);
  for (const valuesRow of values) {
    const record = Object.fromEntries(columns.map((column, index) => [column, valuesRow[index] ?? null]));
    tables.get(table).push(record);
  }
  insert.lastIndex = cursor + 1;
}

const tableRows = (name) => tables.get(name) ?? [];
const newsRows = [...tables.entries()]
  .filter(([name]) => /^ccgdev_vi_news_\d+$/.test(name))
  .flatMap(([, rows]) => rows)
  .filter((item) => Number(item.status) === 1 && item.alias)
  .map((item) => {
    const detail = tableRows('ccgdev_vi_news_detail').find((entry) => Number(entry.id) === Number(item.id)) ?? {};
    return {
      id: Number(item.id), title: item.title, alias: item.alias, categoryId: Number(item.catid),
      categoryIds: String(item.listcatid ?? '').split(',').filter(Boolean).map(Number),
      summary: item.hometext ?? '', image: item.homeimgfile ?? '', imageAlt: item.homeimgalt ?? '',
      publishedAt: Number(item.publtime ?? item.addtime ?? 0), titleTag: detail.titlesite ?? '',
      description: detail.description ?? item.hometext ?? '', keywords: detail.keywords ?? '',
      body: detail.bodyhtml ?? '',
    };
  });
const newsById = new Map();
for (const item of newsRows) {
  const existing = newsById.get(item.id);
  if (existing) existing.categoryIds = [...new Set([...existing.categoryIds, ...item.categoryIds])];
  else newsById.set(item.id, item);
}
const news = [...newsById.values()];
const categories = tableRows('ccgdev_vi_news_cat').filter((item) => Number(item.status) !== 0).map((item) => ({
  id: Number(item.catid), title: item.title, alias: item.alias, description: item.description ?? '',
  image: item.image ?? '', parentId: Number(item.parentid ?? 0),
}));
const pages = tableRows('ccgdev_vi_page').filter((item) => Number(item.status) === 1 && item.alias).map((item) => ({
  id: Number(item.id), title: item.title, alias: item.alias, image: item.image ?? '',
  description: item.description ?? '', body: item.bodytext ?? '', keywords: item.keywords ?? '',
}));
const productRows = [
  ...tableRows('ccgdev_shops_rows').map((item) => ({ ...item, moduleName: 'shops' })),
  ...tableRows('ccgdev_an_pham_tet_2019_rows').map((item) => ({ ...item, moduleName: 'an-pham-tet-2019' })),
];
const products = productRows.filter((item) => Number(item.status) === 1 && item.vi_alias).map((item) => ({
  id: Number(item.id), moduleName: item.moduleName, title: item.vi_title, alias: item.vi_alias,
  categoryIds: String(item.listcatid ?? '').split(',').filter(Boolean).map(Number),
  summary: item.vi_hometext ?? '', body: item.vi_bodytext ?? '', image: item.homeimgfile ?? '',
  imageAlt: item.homeimgalt ?? '', price: Number(item.product_price ?? 0), unit: item.money_unit ?? 'VND',
}));
const productCategories = [
  ...tableRows('ccgdev_shops_catalogs').map((item) => ({ ...item, moduleName: 'shops' })),
  ...tableRows('ccgdev_an_pham_tet_2019_catalogs').map((item) => ({ ...item, moduleName: 'an-pham-tet-2019' })),
].map((item) => ({
  id: Number(item.catid), parentId: Number(item.parentid ?? 0), weight: Number(item.sort ?? item.weight ?? item.catid), moduleName: item.moduleName, title: item.vi_title, alias: item.vi_alias,
  description: item.vi_description ?? '', image: item.image ?? '',
}));
const photoCategories = tableRows('ccgdev_vi_photos_category').filter((item) => Number(item.status) === 1).map((item) => ({
  id: Number(item.category_id), title: item.name, alias: item.alias, description: item.description ?? '',
}));
const photoAlbums = tableRows('ccgdev_vi_photos_album').filter((item) => Number(item.status) === 1).map((item) => ({
  id: Number(item.album_id), categoryId: Number(item.category_id), title: item.name, alias: item.alias,
  description: item.description ?? '', folder: item.folder ?? '',
}));
const photos = tableRows('ccgdev_vi_photos_rows').filter((item) => Number(item.status) === 1).map((item) => ({
  id: Number(item.row_id), albumId: Number(item.album_id), title: item.name, description: item.description ?? '',
  image: mediaFromUpload('photos', item.file), thumbnail: mediaFromUpload('photos', item.thumb),
}));

function mediaUrl(module, file) {
  if (!file) return '';
  if (/^https?:\/\//i.test(file)) return file;
  const clean = String(file).replace(/^\/+/, '').replace(/^uploads\//, '');
  return `/uploads/${clean.startsWith(`${module}/`) ? clean : `${module}/${clean}`}`;
}
for (const item of news) item.image = mediaUrl('news', item.image);
for (const item of products) item.image = mediaUrl(item.moduleName, item.image);
for (const item of categories) item.image = mediaUrl('news', item.image);
for (const item of productCategories) item.image = mediaUrl(item.moduleName, item.image);
for (const item of pages) item.image = mediaUrl('page', item.image);

const config = Object.fromEntries(tableRows('ccgdev_config')
  .filter((item) => item.lang === 'vi' && item.module === 'global')
  .map((item) => [item.config_name, item.config_value]));
function mediaFromUpload(folder, file) {
  if (!file || /^https?:\/\//i.test(file)) return file ?? '';
  const clean = String(file).replace(/^\/+/, '').replace(/^uploads\//, '');
  return folder && !clean.startsWith(`${folder}/`) ? `/uploads/${folder}/${clean}` : `/uploads/${clean}`;
}
const menuGroups = tableRows('ccgdev_vi_menu').map((item) => ({ id: Number(item.id), title: item.title }));
const menu = tableRows('ccgdev_vi_menu_rows')
  .filter((item) => Number(item.status) === 1)
  .sort((a, b) => Number(a.weight) - Number(b.weight))
  .map((item) => ({ id: Number(item.id), groupId: Number(item.mid), parentId: Number(item.parentid), title: item.title, link: item.link, note: item.note ?? '', icon: item.css ?? '', target: Number(item.target) === 1 ? '_blank' : '_self' }));
const slider = tableRows('ccgdev_vi_slider_rows')
  .filter((item) => Number(item.status) === 1)
  .sort((a, b) => Number(a.weight) - Number(b.weight))
  .map((item) => ({ title: item.title, description: item.description ?? '', link: item.link_href ?? '', image: mediaFromUpload('slider', item.image), contentImage: mediaFromUpload('slider', item.image_content) }));
const banners = tableRows('ccgdev_banners_rows')
  .filter((item) => Number(item.act) === 1 && (!Number(item.exp_time) || Number(item.exp_time) > Math.floor(Date.now() / 1000)))
  .map((item) => ({ title: item.title, alt: item.file_alt, image: mediaFromUpload('banners', item.file_name), link: item.click_url ?? '', html: item.bannerhtml ?? '' }));
const produceHome = tableRows('ccgdev_vi_produce_home_rows')
  .filter((item) => Number(item.status) === 1)
  .sort((a, b) => Number(a.weight) - Number(b.weight))
  .map((item) => ({ title: item.title, description: item.description ?? '', link: item.link_href ?? '', image: mediaFromUpload('produce-home', item.image), imageContent: item.image_content ?? '' }));
const productionProcess = tableRows('ccgdev_vi_production_process_rows')
  .filter((item) => Number(item.status) === 1)
  .sort((a, b) => Number(a.weight) - Number(b.weight))
  .map((item) => ({ title: item.title, description: item.description ?? '', link: item.link_href ?? '', image: mediaFromUpload('production-process', item.image), imageContent: item.image_content ?? '' }));
const parseFlatPhpConfig = (value = '') => {
  const result = {};
  const pattern = /s:\d+:"([^"]+)";s:\d+:"([\s\S]*?)";|s:\d+:"([^"]+)";i:(-?\d+);/g;
  for (const match of String(value).matchAll(pattern)) {
    if (match[1]) result[match[1]] = match[2];
    else if (match[3]) result[match[3]] = Number(match[4]);
  }
  return result;
};
const blockGroups = tableRows('ccgdev_vi_blocks_groups');
const featuredOrder = {
  38: [35, 34, 33, 32, 29, 50, 42, 41, 40, 36],
  37: [28, 26, 23, 20, 19, 40, 38, 35, 31, 29],
};
const featuredGroups = [38, 37].map((bid) => {
  const block = blockGroups.find((entry) => Number(entry.bid) === bid);
  const config = parseFlatPhpConfig(block?.config);
  const productsInGroup = tableRows('ccgdev_shops_block')
    .filter((entry) => Number(entry.bid) === Number(config.blockid))
    .map((entry) => products.find((product) => product.moduleName === 'shops' && product.id === Number(entry.id)))
    .filter(Boolean)
    .sort((a, b) => featuredOrder[bid].indexOf(a.id) - featuredOrder[bid].indexOf(b.id))
    .slice(0, Number(config.numget) || 10);
  return { bid, title: block?.title ?? '', link: block?.link ?? '', products: productsInGroup };
});
const capacityBlock = blockGroups.find((entry) => Number(entry.bid) === 50);
const capacityConfig = parseFlatPhpConfig(capacityBlock?.config);
const homepage = {
  productGroups: featuredGroups,
  technology: (() => {
    const block = blockGroups.find((entry) => Number(entry.bid) === 36);
    return { title: block?.title ?? '', link: block?.link ?? '', description: block?.description ?? '' };
  })(),
  capacity: {
    title: capacityBlock?.title ?? '', description: capacityBlock?.description ?? '',
    items: [1, 2, 3, 4].map((number) => ({
      value: capacityConfig[`number${number}`] ?? '',
      title: capacityConfig[`title${number}`] ?? '',
      description: capacityConfig[`des${number}`] ?? '',
    })),
  },
};
const content = {
  site: {
    name: config.site_name || 'IN ẤN SÁNG TẠO',
    description: config.site_description || 'Chia sẻ thành công, kết nối đam mê',
    logo: mediaFromUpload('', config.site_logo || 'logo.png'),
  },
  menuGroups, menu, slider, banners, produceHome, productionProcess, homepage,
  news, categories, pages, products, productCategories, photoCategories, photoAlbums, photos,
};
const dataDir = path.join(root, 'src', 'data');
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'content.json'), JSON.stringify(content));

const media = new Set();
const collect = (value) => {
  if (typeof value !== 'string') return;
  for (const match of value.matchAll(/(?:https?:\/\/[^/"'\s]+)?\/?uploads\/([^"'\s<>\)]+)/gi)) {
    media.add(decodeURIComponent(match[1].split(/[?#]/)[0]));
  }
};
for (const item of [...news, ...products, ...pages, ...categories, ...productCategories, ...photoCategories, ...photoAlbums, ...photos]) {
  collect(item.image);
  collect(item.thumbnail);
  collect(item.body);
  collect(item.summary);
}
for (const item of [...slider, ...banners, ...produceHome, ...productionProcess]) {
  collect(item.image);
  collect(item.contentImage);
}
for (const item of blockGroups) collect(item.config);
collect(content.site.logo);
const publicDir = path.join(root, 'public', 'uploads');
let copied = 0;
for (const relative of media) {
  const safe = path.normalize(relative);
  if (safe.startsWith('..') || path.isAbsolute(safe)) continue;
  const source = path.join(uploadsRoot, safe);
  if (!source.startsWith(path.resolve(uploadsRoot) + path.sep) || !fs.existsSync(source) || !fs.statSync(source).isFile()) continue;
  const destination = path.join(publicDir, safe);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  copied++;
}
for (const [relative, destinationRelative] of [
  ['themes/default/css', 'themes/default/css'],
  ['themes/default/images', 'themes/default/images'],
  ['themes/default/fonts', 'themes/default/fonts'],
  ['assets/css', 'assets/css'],
  ['assets/fonts', 'assets/fonts'],
]) {
  const sourceDir = path.join(legacyRoot, relative);
  if (!fs.existsSync(sourceDir)) continue;
  const copyTree = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const source = path.join(directory, entry.name);
      const destination = path.join(root, 'public', destinationRelative, path.relative(sourceDir, source));
      if (entry.isDirectory()) copyTree(source);
      else if (entry.isFile() && !/\.php$/i.test(entry.name)) {
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(source, destination);
      }
    }
  };
  copyTree(sourceDir);
}
console.log(`Đã nhập ${news.length} bài viết, ${pages.length} trang, ${products.length} sản phẩm; chép ${copied} tệp hình ảnh.`);
