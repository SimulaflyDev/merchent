const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function load(file, mocks = {}, globals = {}) {
  const { outputText } = ts.transpileModule(readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    module, exports: module.exports, console, URL, atob,
    process: { env: {} },
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    ...globals,
  });
  return module.exports;
}

const errors = load('lib/api/errors.ts');

test('backend validation errors are text and never crash React rendering', () => {
  const payload = { detail: [{ loc: ['body', 'new_password'], msg: 'Password is too long', input: 'private-password' }] };
  const detail = errors.apiErrorDetail(payload, 'Request failed');
  assert.equal(detail, 'new password: Password is too long');
  assert.doesNotThrow(() => renderToStaticMarkup(React.createElement('p', null, detail)));
  assert.equal(errors.apiErrorDetail({ detail: {} }, 'Request failed'), 'Request failed');
});

test('recovery GET/POST and PDF stay accessible with missing or stale sessions', async () => {
  const { NextRequest } = require('next/server');
  const { proxy } = load('proxy.ts', {
    './lib/auth/jwt': load('lib/auth/jwt.ts'),
    './lib/share-links': load('lib/share-links.ts'),
  }, { fetch: () => { throw new Error('Must not refresh sessions on public recovery routes'); } });
  for (const route of ['/merchant/forgot_password', '/merchant/forgot_password/', '/terms-and-conditions.pdf']) {
    for (const method of ['GET', 'POST']) {
      for (const cookie of ['', 'refresh_token=old; access_token=old']) {
        const response = await proxy(new NextRequest(`http://localhost${route}`, { method, headers: { cookie } }));
        assert.equal(response.headers.get('location'), null);
        assert.equal(response.headers.get('x-middleware-next'), '1');
      }
    }
  }
  const protectedResponse = await proxy(new NextRequest('http://localhost/merchant/dashboard'));
  assert.equal(new URL(protectedResponse.headers.get('location')).pathname, '/merchant/sign_in');
});

function fixture(stage) {
  return {
    pan: { status: stage >= 1 ? 'verified' : 'not_started', masked_pan: '******234F', verified_at: null },
    gstin: { status: stage >= 2 ? 'verified' : 'not_started', verified_at: null },
    agreement: { accepted: stage === 3, accepted_at: null, versions: {} },
    other_checks: { authorized_person: { status: 'verified' }, business_address: { status: 'verified' }, shop_location: { status: 'verified' } },
    can_activate: stage === 2, is_kyc_completed: stage >= 2,
    approval_status: stage === 3 ? 'approved' : 'pending_verification',
  };
}

function harness(stage) {
  let cursor = 0;
  const state = [];
  const pending = [];
  const submissions = [];
  const verification = fixture(stage);
  const Component = load('app/merchant/(panel)/verification/VerificationClient.tsx', {
    react: { ...React, useEffect: () => {}, useState: (initial) => {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
      return [state[index], (value) => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
    }, useTransition: () => [false, (fn) => pending.push(fn())] },
    'next/navigation': { useRouter: () => ({ refresh() {}, push() {} }), useSearchParams: () => new URLSearchParams() },
    '@/lib/api/action-utils': { callAction: async (value) => value },
    '@/lib/api/errors': errors,
    '@/lib/auth/verification-actions': {
      acceptMerchantAgreementsAction: async (id, payload) => { submissions.push({ id, payload }); return fixture(3); },
    },
  }, { URLSearchParams, sessionStorage: { removeItem() {} } }).default;
  const render = () => { cursor = 0; return Component({ merchant: { id: 'test-shop', display_name: 'Test shop' }, initialVerification: verification, initialGstin: '' }); };
  return { render, pending, submissions };
}

function find(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (Array.isArray(node)) return node.map((child) => find(child, predicate)).find(Boolean);
  if (predicate(node)) return node;
  return find(node.props?.children, predicate);
}

test('all three stages are horizontal and locked until prerequisite verification', () => {
  const view = harness(0);
  const tree = view.render();
  assert.match(renderToStaticMarkup(tree), /grid grid-cols-3/);
  assert.equal(find(tree, (n) => n.props?.id === 'verification-step-0').props['aria-current'], 'step');
  assert.equal(find(tree, (n) => n.props?.id === 'verification-step-1').props.disabled, true);
  assert.equal(find(tree, (n) => n.props?.id === 'verification-step-2').props.disabled, true);
});

test('PDF agreement requires explicit checkbox acceptance and persists the agreement bundle', async () => {
  const view = harness(2);
  let tree = view.render();
  assert.equal(find(tree, (n) => n.props?.id === 'verification-step-2').props['aria-current'], 'step');
  assert.match(find(tree, (n) => n.type === 'iframe').props.src, /^\/terms-and-conditions.pdf/);
  const submit = () => find(tree, (n) => n.type === 'button' && String(n.props?.children).includes('complete verification'));
  assert.equal(submit().props.disabled, true);
  const termsPanel = find(tree, (n) => n.props?.id === 'verification-panel-2');
  find(termsPanel, (n) => n.type === 'input' && n.props.type === 'checkbox').props.onChange({ target: { checked: true } });
  tree = view.render();
  assert.equal(submit().props.disabled, false);
  submit().props.onClick();
  await Promise.all(view.pending);
  assert.equal(view.submissions.length, 1);
  assert.equal(view.submissions[0].id, 'test-shop');
  assert.equal(Object.keys(view.submissions[0].payload).length, 7);
  assert.ok(Object.values(view.submissions[0].payload).every((value) => value === true));
  assert.match(renderToStaticMarkup(view.render()), /All terms accepted/);
});

test('approved merchants still see the stepper, PDF and accepted checkbox and can review earlier steps', () => {
  const view = harness(3);
  let tree = view.render();
  assert.ok(find(tree, (n) => n.type === 'iframe'));
  const panel = find(tree, (n) => n.props?.id === 'verification-panel-2');
  const checkbox = find(panel, (n) => n.type === 'input');
  assert.equal(checkbox.props.checked, true);
  assert.equal(checkbox.props.disabled, true);
  find(tree, (n) => n.props?.id === 'verification-step-0').props.onClick();
  tree = view.render();
  assert.equal(find(tree, (n) => n.props?.id === 'verification-panel-0').props.hidden, false);
});
