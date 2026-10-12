const {test} = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  Module = require('node:module'),
  ts = require('typescript');
const {configureStore} = require('@reduxjs/toolkit');
const env = {
  PLATFORM_ID: 'sx_0123456789ab',
  ORIGINAL_GRAPHQL_ENDPOINT: 'https://api.example.test/graphql',
};
function load(file, overrides) {
  const name = path.join(__dirname, '../src/store/slices', file),
    m = new Module(name, module);
  m.paths = module.paths;
  m.require = request =>
    Object.hasOwn(overrides, request) ? overrides[request] : require(request);
  m._compile(
    ts.transpileModule(fs.readFileSync(name, 'utf8'), {
      compilerOptions: {module: ts.ModuleKind.CommonJS},
    }).outputText,
    name,
  );
  return m.exports;
}
const platform = load('platformSlice.ts', {'@/config/env': {env}});
const ui = load('uiSlice.ts', {
  '@/i18n': {i18n: {language: 'en'}},
  './platformSlice': platform,
});
const config = {
  platformId: env.PLATFORM_ID,
  revision: 1,
  displayName: 'Northstar',
  locale: 'ro',
  currency: 'EUR',
  priceDisplay: 'gross',
  branding: {accent: '#c8ff5f', background: '#101112', surface: '#1a1d20'},
};
test('managed client rejects the wrong backend identity and closes an already-mounted platform gate', async () => {
  const original = global.fetch,
    store = configureStore({reducer: platform.platformReducer});
  try {
    global.fetch = async url => {
      assert.equal(url, 'https://api.example.test/platform-config');
      return new global.Response(JSON.stringify({configuration: config}));
    };
    await store.dispatch(platform.refreshPlatform());
    assert.equal(store.getState().configuration.platformId, env.PLATFORM_ID);
    global.fetch = async () =>
      new global.Response(
        JSON.stringify({
          configuration: {...config, platformId: 'sx_abcdef012345'},
        }),
      );
    await store.dispatch(platform.refreshPlatform());
    assert.equal(store.getState().configuration, null);
    assert.equal(store.getState().unavailable, true);
  } finally {
    global.fetch = original;
  }
});
test('configured locale supplies the default without overwriting an explicit user preference', () => {
  const store = configureStore({reducer: ui.uiReducer});
  store.dispatch(platform.refreshPlatform.fulfilled(config, 'request'));
  assert.equal(store.getState().language, 'ro');
  store.dispatch(ui.setLanguage('fr'));
  store.dispatch(
    platform.refreshPlatform.fulfilled({...config, locale: 'de'}, 'request2'),
  );
  assert.equal(store.getState().language, 'fr');
});
