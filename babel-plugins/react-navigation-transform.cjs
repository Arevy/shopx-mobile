const PACKAGE_ROOTS = {
  '@react-navigation/native': 'node_modules/@react-navigation/native/lib/module',
  '@react-navigation/native-stack': 'node_modules/@react-navigation/native-stack/lib/module',
  '@react-navigation/drawer': 'node_modules/@react-navigation/drawer/lib/module',
  '@react-navigation/elements': 'node_modules/@react-navigation/elements/lib/module',
  'react-native-drawer-layout': 'node_modules/react-native-drawer-layout/lib/module',
};

const RELATIVE_IMPORTS = {
  '@react-navigation/native': {
    './createStaticNavigation': './createStaticNavigation.js',
    './LinkingContext': './LinkingContext.js',
    './LocaleDirContext': './LocaleDirContext.js',
    './NavigationContainer': './NavigationContainer.js',
    './UnhandledLinkingContext': './UnhandledLinkingContext.js',
    './useBackButton': './useBackButton.js',
    './useDocumentTitle': './useDocumentTitle.js',
    './useLinking': './useLinking.js',
    './useThenable': './useThenable.js',
    './useNavigationContainerRef': './useNavigationContainerRef.js',
  },
  '@react-navigation/native-stack': {
    '../views/NativeStackView': '../views/NativeStackView.js',
    '../views/Screen': '../views/Screen.js',
  },
  '@react-navigation/drawer': {
    '../utils/addCancelListener': '../utils/addCancelListener.js',
    '../utils/DrawerStatusContext': '../utils/DrawerStatusContext.js',
    '../utils/getDrawerStatusFromState': '../utils/getDrawerStatusFromState.js',
    '../utils/useDrawerProgress': '../utils/useDrawerProgress.js',
    './DrawerContent': './DrawerContent.js',
    './DrawerContentScrollView': './DrawerContentScrollView.js',
    './DrawerItem': './DrawerItem.js',
    './DrawerItemList': './DrawerItemList.js',
    './DrawerToggleButton': './DrawerToggleButton.js',
    './DrawerView': './DrawerView.js',
  },
  '@react-navigation/elements': {
    './Header/Header': './Header/Header.js',
    './Header/HeaderBackButton': './Header/HeaderBackButton.js',
    './Header/HeaderTitle': './Header/HeaderTitle.js',
    './Header/HeaderSegment': './Header/HeaderSegment.js',
    './Header/useHeaderHeight': './Header/useHeaderHeight.js',
    './useLayout': './useLayout.js',
    './useAnimatedValue': './useAnimatedValue.js',
    './useHeaderMeasurements': './useHeaderMeasurements.js',
    './useFrameSize': './useFrameSize.js',
  },
  'react-native-drawer-layout': {
    './views/Drawer': './views/Drawer.js',
  },
};

function shouldTransform(filename) {
  if (!filename) {
    return false;
  }
  return Object.keys(PACKAGE_ROOTS).some(pkg => filename.includes(pkg));
}

function resolveRelative(pkg, source) {
  const overrides = RELATIVE_IMPORTS[pkg];
  if (overrides && overrides[source]) {
    return overrides[source];
  }
  if (source.startsWith('./') || source.startsWith('../')) {
    if (/\.(png|jpg|jpeg|svg)$/i.test(source)) {
      return source;
    }
    return source.endsWith('.js') ? source : `${source}.js`;
  }
  return source;
}

module.exports = function reactNavigationTransform({types: t}) {
  return {
    name: 'react-navigation-transform',
    visitor: {
      Program(path, state) {
        state.__rnShouldProcess = shouldTransform(state.file.opts.filename || '');
      },
      ImportDeclaration(path, state) {
        if (!state.__rnShouldProcess) {
          return;
        }
        const source = path.node.source.value;
        const pkgKey = Object.keys(PACKAGE_ROOTS).find(pkg =>
          state.file.opts.filename.includes(pkg)
        );
        if (!pkgKey) {
          return;
        }
        path.node.source = t.stringLiteral(resolveRelative(pkgKey, source));
      },
      ExportNamedDeclaration(path, state) {
        if (!state.__rnShouldProcess || !path.node.source) {
          return;
        }
        const source = path.node.source.value;
        const pkgKey = Object.keys(PACKAGE_ROOTS).find(pkg =>
          state.file.opts.filename.includes(pkg)
        );
        if (!pkgKey) {
          return;
        }
        path.node.source = t.stringLiteral(resolveRelative(pkgKey, source));
      },
      ExportAllDeclaration(path, state) {
        if (!state.__rnShouldProcess || !path.node.source) {
          return;
        }
        const source = path.node.source.value;
        const pkgKey = Object.keys(PACKAGE_ROOTS).find(pkg =>
          state.file.opts.filename.includes(pkg)
        );
        if (!pkgKey) {
          return;
        }
        path.node.source = t.stringLiteral(resolveRelative(pkgKey, source));
      },
    },
  };
};
