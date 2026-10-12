const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Pure data tests: no React renderer or native module emulation is required.
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(
  fs.readFileSync(filename, 'utf8'),
  {compilerOptions: {module: ts.ModuleKind.CommonJS, esModuleInterop: true}},
).outputText, filename);

const {restoreWishlistItems} = require('../src/store/wishlistPersistence.ts');
const {withCommerceResources} = require('../src/i18n/commerceResources.ts');
const {createMigrate} = require('redux-persist');
const product = {id: '7', name: 'Test product', price: 12.5};

test('legacy persisted wishlist envelope migrates before selectors consume it', async () => {
  const migrate = createMigrate({1: state => ({...state, items: restoreWishlistItems(state.items)})});
  const restored = await migrate({items: {userId: '2', products: [product]}, _persist: {version: -1, rehydrated: true}}, 1);
  assert.deepEqual(restored.items.map(item => item.id), ['7']);
  assert.deepEqual(restoreWishlistItems([product]), [product]);
});

test('corrupt wishlist storage cannot become arbitrary product rows', () => {
  for (const input of [null, undefined, 'broken', {userId: '2'}, {products: 1}]) {
    assert.deepEqual(restoreWishlistItems(input), []);
  }
  assert.deepEqual(restoreWishlistItems([null, 2, {}, [product], product]), [product]);
});

const files = [];
function collect(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(filename);
    else if (/\.tsx?$/.test(filename)) files.push(filename);
  }
}
collect(path.join(__dirname, '../src'));
const keys = new Set(files.flatMap(filename => [...fs.readFileSync(filename, 'utf8')
  .matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)].map(match => match[1])));

for (const language of ['en', 'ro', 'fr', 'de', 'ar', 'he']) {
  test(`all qualified static translation keys exist in ${language}`, () => {
    const base = require(`../src/i18n/locales/${language}.ts`)[language];
    const resources = withCommerceResources(base, language);
    for (const key of keys) {
      if (!key.includes('.') || key.endsWith('.') || !Object.hasOwn(resources, key.split('.')[0])) continue;
      const value = key.split('.').reduce((result, part) => result?.[part], resources);
      assert.equal(typeof value, 'string', `${language}: missing ${key}`);
      assert(value.length > 0, `${language}: empty ${key}`);
    }
  });
}

test('static Paper icon names resolve to one of the bundled glyph maps', () => {
  const feather = require('react-native-vector-icons/glyphmaps/Feather.json');
  const material = require('react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json');
  for (const filename of files) {
    for (const [, name] of fs.readFileSync(filename, 'utf8').matchAll(/\bicon="([^"]+)"/g)) {
      assert(Object.hasOwn(feather, name) || Object.hasOwn(material, name), `Unknown icon ${name} in ${filename}`);
    }
  }
});
