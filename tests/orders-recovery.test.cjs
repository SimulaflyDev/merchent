const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function load(file, mocks = {}) {
  const source = readFileSync(path.join(__dirname, "..", file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    module,
    exports: module.exports,
    console: { ...console, error: () => {} },
    setTimeout,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
  }, { filename: file });
  return module.exports;
}

test("orders page renders a recoverable service error instead of crashing", async () => {
  const OrdersClient = ({ initialLoadError }) => React.createElement("p", null, initialLoadError);
  const page = load("app/merchant/(panel)/orders/page.tsx", {
    "@/lib/api/leads": { listLeads: async () => { throw new Error("backend unavailable"); } },
    "@/lib/api/errors": { isApiError: () => false },
    "@/lib/types/lead": { adaptLead: (lead) => lead },
    "next/navigation": { redirect: () => {}, unstable_rethrow: () => {} },
    "./OrdersClient": { __esModule: true, default: OrdersClient },
  });

  const html = renderToStaticMarkup(await page.default());
  assert.match(html, /order service is temporarily unavailable/i);
  assert.doesNotMatch(html, /backend unavailable/i);
});

test("orders client displays retry controls while the service is unavailable", () => {
  const component = load("app/merchant/(panel)/orders/OrdersClient.tsx", {
    "@/lib/types/lead": { reverseLeadStatus: (status) => status, adaptLead: (lead) => lead },
    "@/lib/auth/lead-actions": {
      updateLeadStatusAction: () => {},
      cancelLeadAction: () => {},
      updateOrderProgressAction: () => {},
      listLeadsAction: () => {},
    },
    "./LeadDrawer": { LeadDrawer: () => null },
    "./CreateCouponModal": { CreateCouponModal: () => null },
    "@/lib/api/action-utils": { callAction: (value) => value },
  });

  const html = renderToStaticMarkup(React.createElement(component.default, {
    initialLeads: [],
    backendIdMap: {},
    initialLoadError: "Service unavailable",
  }));
  assert.match(html, /Orders could not be loaded/);
  assert.match(html, /Retry orders/);
  assert.match(html, /Orders will appear here once the service reconnects/);
});
