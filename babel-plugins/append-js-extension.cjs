function shouldProcess(filename) {
  if (!filename) {
    return false;
  }
  return (
    filename.includes('node_modules/@react-navigation') ||
    filename.includes('node_modules/react-native-drawer-layout')
  );
}

function needsExtension(value) {
  if (!value) {
    return false;
  }
  if (value.startsWith('data:') || value.startsWith('http')) {
    return false;
  }
  if (value.startsWith('./') || value.startsWith('../')) {
    return !/\.[a-zA-Z0-9]+(\?.*)?$/.test(value);
  }
  return false;
}

function addExtension(value) {
  if (value.endsWith('/')) {
    return value;
  }
  return `${value}.js`;
}

module.exports = function appendJsExtension() {
  return {
    name: 'append-js-extension',
    visitor: {
      ImportDeclaration(path, state) {
        if (!shouldProcess(state.file.opts.filename)) {
          return;
        }
        const source = path.node.source;
        if (needsExtension(source.value)) {
          source.value = addExtension(source.value);
        }
      },
      ExportNamedDeclaration(path, state) {
        if (!shouldProcess(state.file.opts.filename) || !path.node.source) {
          return;
        }
        const source = path.node.source;
        if (needsExtension(source.value)) {
          source.value = addExtension(source.value);
        }
      },
      ExportAllDeclaration(path, state) {
        if (!shouldProcess(state.file.opts.filename)) {
          return;
        }
        const source = path.node.source;
        if (source && needsExtension(source.value)) {
          source.value = addExtension(source.value);
        }
      },
      CallExpression(path, state) {
        if (!shouldProcess(state.file.opts.filename)) {
          return;
        }
        if (
          path.node.callee.type === 'Identifier' &&
          path.node.callee.name === 'require' &&
          path.node.arguments.length === 1 &&
          path.node.arguments[0].type === 'StringLiteral'
        ) {
          const arg = path.node.arguments[0];
          if (needsExtension(arg.value)) {
            arg.value = addExtension(arg.value);
          }
        }
      },
    },
  };
};
