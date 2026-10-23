// Local UI check only: renders the real component with simulated verification responses.
// No API, merchant records, or emails are touched. Run from merchant-app.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const ts = require('typescript');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const bundledWebpack = require('next/dist/compiled/webpack/webpack');
const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'merchant-kyc-preview-'));
const write = (name, source) => { const file = path.join(temporary, name); fs.writeFileSync(file, source); return file; };
const transpile = (relative, name) => write(name, ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText);
const component = transpile('app/merchant/(panel)/verification/VerificationClient.tsx', 'verification.js');
const errors = transpile('lib/api/errors.ts', 'errors.js');
const navigation = write('navigation.js', `exports.useRouter = () => ({ refresh() {}, push() {} }); exports.useSearchParams = () => new URLSearchParams(window.location.search);`);
const actions = write('actions.js', `
const fixture = (stage) => ({
  pan: { status: stage >= 1 ? 'verified' : 'not_started', masked_pan: '******234F', verified_name: 'Demo Merchant Private Limited', category: 'Company', verified_at: null },
  gstin: { status: stage >= 2 ? 'verified' : 'not_started', gstin: '27ABCDE1234F1Z5', legal_name: 'Demo Merchant Private Limited', registration_status: 'Active', state_name: 'Maharashtra', verified_at: null },
  agreement: { accepted: stage === 3, accepted_at: null, versions: {} },
  other_checks: { authorized_person: { status: 'verified' }, business_address: { status: 'verified' }, shop_location: { status: 'verified' } },
  can_activate: stage === 2, is_kyc_completed: stage >= 2, approval_status: stage === 3 ? 'approved' : 'pending_verification'
});
exports.fixture = fixture;
exports.verifyMerchantPanAction = async () => fixture(1);
exports.verifyMerchantGstinAction = async () => fixture(2);
exports.acceptMerchantAgreementsAction = async () => fixture(3);
`);
const utils = write('utils.js', 'exports.callAction = async (value) => value;');
const entry = write('entry.js', `
const React = require('react');
const { createRoot } = require('react-dom/client');
const Component = require('./verification.js').default;
const { fixture } = require('./actions.js');
createRoot(document.getElementById('app')).render(React.createElement(Component, {
  merchant: { id: 'local-demo', display_name: 'SimulaFly Demo Shop' },
  initialVerification: fixture(Number(new URLSearchParams(location.search).get('stage') || 0)), initialGstin: ''
}));
`);

async function start() {
  const css = await postcss([tailwind({ base: root })]).process(fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8'), { from: path.join(root, 'app/globals.css') });
  await new Promise((resolve, reject) => {
    bundledWebpack.webpack({
      mode: 'development', devtool: false, entry, context: root,
      output: { path: temporary, filename: 'bundle.js' },
      resolve: { modules: [path.join(root, 'node_modules')], alias: {
        'next/navigation': navigation,
        '@/lib/api/errors': errors,
        '@/lib/api/action-utils': utils,
        '@/lib/auth/verification-actions': actions,
      } },
    }, (error, stats) => error || stats.hasErrors() ? reject(error || new Error(stats.toString({ all: false, errors: true }))) : resolve());
  });
  http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/bundle.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      return res.end(fs.readFileSync(path.join(temporary, 'bundle.js')));
    }
    if (url.pathname === '/terms-and-conditions.pdf') {
      res.writeHead(200, { 'Content-Type': 'application/pdf' });
      return res.end(fs.readFileSync(path.join(root, 'public/terms-and-conditions.pdf')));
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Merchant KYC local UI check</title><style>${css.css}</style></head><body><p style="padding:8px;text-align:center;font-size:12px">LOCAL UI CHECK · simulated verification responses</p><div id="app"></div><script src="/bundle.js"></script></body></html>`);
  }).listen(3198, '127.0.0.1', () => console.log('Local UI check: http://127.0.0.1:3198/?stage=2'));
}
start().catch((error) => { console.error(error); process.exitCode = 1; });
