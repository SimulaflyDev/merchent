// Run with: node --test tests/public-sharing.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function load(file, mocks = {}, globals = {}) {
  const source = readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    module, exports: module.exports, URL, AbortSignal, console,
    process: { env: {} },
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    ...globals,
  }, { filename: file });
  return module.exports;
}

const links = load('lib/share-links.ts');
const appLinks = load('lib/android-app-links.ts');

test('Android association targets the directly installed Simulafly APK certificate', () => {
  const [statement] = appLinks.androidAssetLinks();
  assert.equal(statement.relation[0], 'delegate_permission/common.handle_all_urls');
  assert.equal(statement.target.namespace, 'android_app');
  assert.equal(statement.target.package_name, 'com.simulafly');
  assert.equal(statement.target.sha256_cert_fingerprints[0], '0B:A8:AD:F9:80:4E:65:DE:5A:EA:BA:A6:1F:93:84:F6:85:55:08:A4:03:6D:33:C9:C6:BF:E0:74:9E:E2:DF:4B');
  const nextCert = Array(32).fill('AB').join(':');
  const configured = appLinks.androidAssetLinks(`${nextCert.toLowerCase()},${nextCert}`);
  assert.equal(configured[0].target.sha256_cert_fingerprints.length, 1);
  assert.equal(configured[0].target.sha256_cert_fingerprints[0], nextCert);
  assert.throws(() => appLinks.androidAssetLinks(''));
  assert.throws(() => appLinks.androidAssetLinks('not-a-certificate'));
});

test('Android verification endpoint returns JSON with no redirect and fails closed on bad config', async () => {
  const route = load('app/.well-known/assetlinks.json/route.ts', {
    '@/lib/android-app-links': appLinks,
  }, { Response });
  const response = route.GET();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.equal(response.headers.get('location'), null);
  assert.equal((await response.json())[0].target.package_name, 'com.simulafly');
  const invalidRoute = load('app/.well-known/assetlinks.json/route.ts', {
    '@/lib/android-app-links': { androidAssetLinks: () => { throw new Error('invalid'); } },
  }, { Response });
  assert.equal(invalidRoute.GET().status, 503);
});
const shop = { id: 'merchant-1', slug: 'demo-shop', display_name: 'Demo shop', legal_name: 'Demo merchant', address: 'Delhi', support_phone: null, support_email: null, logo_url: null };
const products = [
  { id: 'product-1', merchant_id: shop.id, title: 'Walnut table', status: 'published', has_simulafly_listing: true, primary_image_url: '/api/v1/upload/room-image/photo-1', in_app_price: '1200.00', in_app_stock: 2 },
  { id: 'product-2', merchant_id: shop.id, title: 'Velvet chair', status: 'published', has_simulafly_listing: true, primary_image_url: null, in_app_price: 800, in_app_stock: null },
  { id: 'draft-product', merchant_id: shop.id, title: 'Private draft', status: 'draft', has_simulafly_listing: false },
  { id: 'wrong-shop', merchant_id: 'merchant-2', title: 'Other shop product', status: 'published', has_simulafly_listing: true },
];
function storefront(extra = {}) {
  const calls = [];
  const data = load('lib/public-storefront.ts', {
    'server-only': {}, react: { cache: (fn) => fn },
    'next/navigation': { notFound: () => { throw new Error('NOT_FOUND'); } },
  }, {
    fetch: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, status: 200, json: async () => url.endsWith('/products') ? products : shop };
    }, ...extra,
  });
  return { data, calls };
}

test('shop and individual product URLs use merchant domain and editable base', () => {
  assert.equal(links.publicShopUrl('demo-shop'), 'https://merchant.simulatech.org/shop/demo-shop');
  assert.equal(links.publicShopUrl('merchant-1', 'product-1'), 'https://merchant.simulatech.org/shop/merchant-1?product=product-1');
  assert.equal(links.publicShopUrl('demo-shop', 'product-1', 'https://example.com/catalog/'), 'https://example.com/catalog/shop/demo-shop?product=product-1');
  assert.throws(() => links.publicShopUrl('..'));
  assert.throws(() => links.publicShopUrl('shop', undefined, 'simulafly://merchant'));
});

test('only public shop routes bypass merchant authentication', async () => {
  const next = { next: () => ({ allowed: true }), redirect: () => ({ redirected: true }) };
  const { proxy } = load('proxy.ts', {
    'next/server': { NextResponse: next }, './lib/share-links': links,
    './lib/auth/jwt': { getJwtExpiry: () => { throw new Error('Public page must not inspect tokens'); } },
  });
  const publicRequest = { nextUrl: { pathname: '/shop/demo-shop' }, cookies: { get: () => { throw new Error('Public page must not read cookies'); } } };
  assert.equal((await proxy(publicRequest)).allowed, true);
  assert.equal((await proxy({ ...publicRequest, nextUrl: { pathname: '/.well-known/assetlinks.json' } })).allowed, true);
  assert.equal((await proxy({ nextUrl: { pathname: '/.well-known/private' }, url: 'https://merchant.simulatech.org/.well-known/private', cookies: { get: () => undefined } })).redirected, true);
  assert.equal((await proxy({ nextUrl: { pathname: '/merchant/orders' }, url: 'https://merchant.simulatech.org/merchant/orders', cookies: { get: () => undefined } })).redirected, true);
  assert.equal(links.isPublicStorefrontPath('/shop/demo-shop/admin'), false);
});

test('public product selection only uses published products owned by the shop', async () => {
  const { data, calls } = storefront();
  const result = await data.loadPublicStorefront('demo-shop', 'product-2');
  assert.equal(result.selected.title, 'Velvet chair');
  assert.equal(result.products.length, 2);
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.match(call.url, /^https:\/\/api.simulatech.org\/api\/v1\/merchants\/public\/demo-shop/);
    assert.equal(call.options.headers, undefined);
    assert.equal(call.options.cache, 'no-store');
  }
  await assert.rejects(data.loadPublicStorefront('demo-shop', 'wrong-shop'), /NOT_FOUND/);
  await assert.rejects(data.loadPublicStorefront('demo-shop', 'draft-product'), /NOT_FOUND/);
  await assert.rejects(data.loadPublicStorefront('demo-shop', 'missing-product'), /NOT_FOUND/);
});

test('unavailable and suspended shops cannot be rendered', async () => {
  for (const status of [400, 404]) {
    const { data } = storefront({ fetch: async () => ({ status, ok: false }) });
    await assert.rejects(data.loadPublicStorefront('demo-shop'), /NOT_FOUND/);
  }
});

test('shared product HTML and link-preview metadata show only the selected product', async () => {
  const { data } = storefront();
  const page = load('app/shop/[lookup]/page.tsx', {
    '@/lib/public-storefront': data,
    'next/navigation': { notFound: () => { throw new Error('NOT_FOUND'); } },
    'next/link': ({ children, ...props }) => React.createElement('a', props, children),
    'next/image': ({ fill, unoptimized, ...props }) => React.createElement('img', props),
  });
  const props = { params: Promise.resolve({ lookup: 'demo-shop' }), searchParams: Promise.resolve({ product: 'product-1' }) };
  const metadata = await page.generateMetadata(props);
  assert.equal(metadata.title, 'Walnut table | Demo shop');
  assert.equal(metadata.openGraph.images[0].url, 'https://api.simulatech.org/api/v1/upload/room-image/photo-1');
  const html = renderToStaticMarkup(await page.default(props));
  assert.match(html, /Walnut table/);
  assert.doesNotMatch(html, /Velvet chair|Private draft|Other shop product|simulafly:\/\//);
  assert.match(html, /Browse all products/);
});

test('full-shop HTML includes public catalog and excludes private products', async () => {
  const { data } = storefront();
  const result = await data.loadPublicStorefront('demo-shop');
  assert.equal(result.selected, undefined);
  assert.deepEqual(Array.from(result.products, p => p.id), ['product-1', 'product-2']);
  assert.equal(data.publicImageUrl('javascript:alert(1)'), undefined);
});
