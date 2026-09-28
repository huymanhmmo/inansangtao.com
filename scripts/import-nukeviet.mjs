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
const wanted = /^(?:ccgdev_vi_news_\d+|ccgdev_vi_news_detail|ccgdev_vi_news_cat|ccgdev_vi_news_topics|ccgdev_vi_page|ccgdev_shops_rows|ccgdev_shops_catalogs)$/;
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
const news = [...tables.entries()]
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
const categories = tableRows('ccgdev_vi_news_cat').filter((item) => Number(item.status) !== 0).map((item) => ({
  id: Number(item.catid), title: item.title, alias: item.alias, description: item.description ?? '',
  image: item.image ?? '', parentId: Number(item.parentid ?? 0),
}));
const pages = tableRows('ccgdev_vi_page').filter((item) => Number(item.status) === 1 && item.alias).map((item) => ({
  id: Number(item.id), title: item.title, alias: item.alias, image: item.image ?? '',
  description: item.description ?? '', body: item.bodytext ?? '', keywords: item.keywords ?? '',
}));
const products = tableRows('ccgdev_shops_rows').filter((item) => Number(item.status) === 1 && item.vi_alias).map((item) => ({
  id: Number(item.id), title: item.vi_title, alias: item.vi_alias,
  categoryIds: String(item.listcatid ?? '').split(',').filter(Boolean).map(Number),
  summary: item.vi_hometext ?? '', body: item.vi_bodytext ?? '', image: item.homeimgfile ?? '',
  imageAlt: item.homeimgalt ?? '', price: Number(item.product_price ?? 0), unit: item.money_unit ?? 'VND',
}));
const productCategories = tableRows('ccgdev_shops_catalogs').map((item) => ({
  id: Number(item.catid), title: item.vi_title, alias: item.vi_alias,
  description: item.vi_description ?? '', image: item.image ?? '',
}));

function mediaUrl(module, file) {
  if (!file) return '';
  if (/^https?:\/\//i.test(file)) return file;
  const clean = String(file).replace(/^\/+/, '').replace(/^uploads\//, '');
  return `/uploads/${clean.includes('/') ? clean : `${module}/${clean}`}`;
}
for (const item of news) item.image = mediaUrl('news', item.image);
for (const item of products) item.image = mediaUrl('shops', item.image);
for (const item of categories) item.image = mediaUrl('news', item.image);
for (const item of productCategories) item.image = mediaUrl('shops', item.image);
for (const item of pages) item.image = mediaUrl('page', item.image);

const content = { site: { name: 'IN ẤN SÁNG TẠO', description: 'Chia sẻ thành công, kết nối đam mê' }, news, categories, pages, products, productCategories };
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
for (const item of [...news, ...products, ...pages, ...categories, ...productCategories]) {
  collect(item.image);
  collect(item.body);
  collect(item.summary);
}
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
console.log(`Đã nhập ${news.length} bài viết, ${pages.length} trang, ${products.length} sản phẩm; chép ${copied} tệp hình ảnh.`);
