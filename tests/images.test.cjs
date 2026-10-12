const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, '../src/utils/images.ts'), 'utf8'),
  {
    compilerOptions: {module: ts.ModuleKind.CommonJS},
  },
).outputText;
function resolver(
  platform,
  development,
  endpoint = 'http://localhost:4000/graphql',
  cdn,
) {
  const module = {exports: {}};
  const require = name => {
    if (name === 'react-native') return {Platform: {OS: platform}};
    if (name === '@/config/env')
      return {
        env: {
          GRAPHQL_ENDPOINT: endpoint,
          ORIGINAL_GRAPHQL_ENDPOINT: endpoint,
          IMAGE_CDN_URL: cdn,
        },
      };
    throw new Error(`Unexpected dependency: ${name}`);
  };
  vm.runInNewContext(source, {
    require,
    module,
    exports: module.exports,
    __DEV__: development,
    URL: global.URL,
  });
  return module.exports.resolveImageUrl;
}
const local =
  'http://api.shopx.localhost/products/1/image?v=2026-10-12T10%3A01%3A21.851Z';
test('managed product images resolve against their own backend, preserving revisions', () => {
  for (const platform of ['ios', 'android', 'web']) {
    assert.equal(
      resolver(
        platform,
        false,
        'https://api.northstar.test/graphql',
        'https://unrelated.test',
      )('/api/products/1/image?v=3'),
      'https://api.northstar.test/api/products/1/image?v=3',
    );
  }
});
test('native development product images use the reachable API origin and retain version queries', () => {
  assert.equal(
    resolver('ios', true)(local),
    local.replace('api.shopx.localhost', 'localhost:4000'),
  );
  assert.equal(
    resolver('android', true, 'http://192.168.1.7:4000/graphql')(local),
    local.replace('api.shopx.localhost', '192.168.1.7:4000'),
  );
});
test('browser, release and external asset URLs retain their original destinations', () => {
  assert.equal(resolver('web', true)(local), local);
  assert.equal(resolver('ios', false)(local), local);
  for (const url of [
    'https://cdn.example.com/products/1/image?v=2',
    'http://api.shopx.localhost/uploads/photo.jpg',
    'http://api.shopx.localhost.example.com/products/1/image',
  ]) {
    assert.equal(resolver('ios', true)(url), url);
  }
});
test('relative CDN and missing-image behavior remains compatible', () => {
  const resolve = resolver(
    'ios',
    true,
    undefined,
    'https://cdn.example.com/uploads/',
  );
  assert.equal(
    resolve('/photo.jpg'),
    'https://cdn.example.com/uploads/photo.jpg',
  );
  assert.equal(resolve(null), undefined);
  assert.equal(resolver('ios', true)('/products/1/image'), '/products/1/image');
});
