import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  type DrawerContentComponentProps,
  DrawerItemList,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Feather';
import {Button, Divider, List, Text, useTheme} from 'react-native-paper';

import {useAppTranslation} from '@/hooks/useAppTranslation';

import {AccountScreen} from '@/screens/Account/AccountScreen';
import {CartScreen} from '@/screens/Cart/CartScreen';
import {CmsDetailScreen} from '@/screens/Cms/CmsDetailScreen';
import {CmsListScreen} from '@/screens/Cms/CmsListScreen';
import {HomeScreen} from '@/screens/Home/HomeScreen';
import {ProductDetailScreen} from '@/screens/ProductDetail/ProductDetailScreen';
import {SettingsScreen} from '@/screens/Settings/SettingsScreen';
import {WishlistScreen} from '@/screens/Wishlist/WishlistScreen';
import {CheckoutScreen} from '@/screens/Checkout/CheckoutScreen';
import type {
  CmsStackParamList,
  HomeStackParamList,
  CartStackParamList,
  MainTabParamList,
  RootDrawerParamList,
} from '@/navigation/types';
import {useAppSelector} from '@/store/hooks';
import {env} from '@/config/env';
import {AppHeader} from '@/components/core/AppHeader';
import {AnimatedBottomTabBar} from '@/navigation/AnimatedBottomTabBar';
import {
  useGetCategoriesQuery,
  useGetCmsPagesQuery,
} from '@/services/graphql/shopxGraphqlApi';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CmsStack = createNativeStackNavigator<CmsStackParamList>();
const CartStack = createNativeStackNavigator<CartStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const Drawer = createDrawerNavigator<RootDrawerParamList>();

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={{headerShown: false}}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen
      name="ProductDetail"
      component={ProductDetailScreen}
      options={{headerShown: false, presentation: 'modal'}}
    />
  </HomeStack.Navigator>
);

const CmsStackNavigator: React.FC = () => (
  <CmsStack.Navigator screenOptions={{headerShown: false}}>
    <CmsStack.Screen name="CmsList" component={CmsListScreen} />
    <CmsStack.Screen name="CmsDetail" component={CmsDetailScreen} />
  </CmsStack.Navigator>
);

const CartStackNavigator: React.FC = () => (
  <CartStack.Navigator screenOptions={{headerShown: false}}>
    <CartStack.Screen name="CartHome" component={CartScreen} />
    <CartStack.Screen
      name="Checkout"
      component={CheckoutScreen}
      options={{headerShown: false, presentation: 'modal'}}
    />
  </CartStack.Navigator>
);

const MainTabsNavigator: React.FC = () => {
  const theme = useTheme();
  const {t} = useAppTranslation('navigation');

  const iconMap: Record<keyof MainTabParamList, string> = {
    HomeStack: 'shopping-bag',
    Cart: 'shopping-cart',
    Wishlist: 'heart',
    Account: 'user',
  };
  return (
    <Tab.Navigator
      tabBar={props => <AnimatedBottomTabBar {...props} />}
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: theme.colors.surface,
        },
        tabBarIcon: ({color, size}) => (
          <Icon
            name={iconMap[route.name as keyof MainTabParamList]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{title: t('tabs.home')}}
      />
      <Tab.Screen
        name="Cart"
        component={CartStackNavigator}
        options={{title: t('tabs.cart')}}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{title: t('tabs.wishlist')}}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{title: t('tabs.account')}}
      />
    </Tab.Navigator>
  );
};

const DrawerContent: React.FC<DrawerContentComponentProps> = props => {
  const {navigation} = props;
  const {t} = useAppTranslation(['navigation', 'common', 'home', 'cart']);
  const session = useAppSelector(state => state.session);
  const theme = useTheme();
  const {data: categories} = useGetCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const {data: cmsPages} = useGetCmsPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const handleNavigateToTab = useCallback(
    (tab: keyof MainTabParamList) => {
      navigation.navigate('HomeTabs', {screen: tab});
      navigation.closeDrawer();
    },
    [navigation],
  );

  const handleCategoryPress = useCallback(
    (categoryId?: string) => {
      navigation.navigate('HomeTabs', {
        screen: 'HomeStack',
        params: {
          screen: 'Home',
          params: {categoryId},
        },
      });
      navigation.closeDrawer();
    },
    [navigation],
  );

  const handleCmsPress = useCallback(
    (slug: string, title?: string) => {
      navigation.navigate('CmsStack', {
        screen: 'CmsDetail',
        params: {slug, title},
      });
      navigation.closeDrawer();
    },
    [navigation],
  );

  const renderQuickLinks = useMemo(
    () => (
      <List.Section title={t('navigation.drawer.quickLinks')}>
        <List.Item
          title={t('navigation.drawer.cart')}
          description={t('common.actions.viewCart')}
          left={iconProps => <List.Icon {...iconProps} icon="shopping-cart" />}
          onPress={() => handleNavigateToTab('Cart')}
        />
        <List.Item
          title={t('navigation.drawer.checkout')}
          description={t('cart.actions.checkout')}
          left={iconProps => <List.Icon {...iconProps} icon="credit-card" />}
          onPress={() => {
            navigation.navigate('HomeTabs', {
              screen: 'Cart',
              params: {screen: 'Checkout'},
            });
            navigation.closeDrawer();
          }}
        />
        <List.Item
          title={t('navigation.drawer.wishlist')}
          description={t('common.actions.viewWishlist')}
          left={iconProps => <List.Icon {...iconProps} icon="heart" />}
          onPress={() => handleNavigateToTab('Wishlist')}
        />
      </List.Section>
    ),
    [handleNavigateToTab, navigation, t],
  );

  const renderCategories = useMemo(() => {
    if (!categories?.length) {
      return null;
    }
    return (
      <List.Section title={t('navigation.drawer.categories')}>
        <List.Item
          title={t('home.categoriesAll')}
          left={iconProps => <List.Icon {...iconProps} icon="grid" />}
          onPress={() => handleCategoryPress(undefined)}
        />
        {categories.map(category => (
          <List.Item
            key={category.id}
            title={category.name}
            left={iconProps => <List.Icon {...iconProps} icon="tag" />}
            onPress={() => handleCategoryPress(category.id)}
          />
        ))}
      </List.Section>
    );
  }, [categories, handleCategoryPress, t]);

  const renderCmsPages = useMemo(() => {
    if (!cmsPages?.length) {
      return null;
    }
    return (
      <List.Section title={t('navigation.drawer.pages')}>
        {cmsPages.map(page => (
          <List.Item
            key={page.slug}
            title={page.title}
            left={iconProps => <List.Icon {...iconProps} icon="file-text" />}
            onPress={() => handleCmsPress(page.slug, page.title)}
          />
        ))}
      </List.Section>
    );
  }, [cmsPages, handleCmsPress, t]);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerScroll}
    >
      <View style={[styles.drawerHeader, {borderBottomColor: theme.colors.surfaceVariant}]}> 
        <Text variant="titleMedium">{env.SITE_NAME}</Text>
        {session.user ? (
          <View style={styles.statusContainer}>
            <Text variant="bodySmall" style={styles.statusSubtitle}>
              {t('navigation.drawer.signedInAs', {email: session.user.email})}
            </Text>
            <Button
              mode="contained-tonal"
              onPress={() => handleNavigateToTab('Account')}
              compact
            >
              {t('navigation.drawer.goToAccount')}
            </Button>
          </View>
        ) : (
          <View style={styles.statusContainer}>
            <Text variant="bodySmall" style={styles.statusSubtitle}>
              {t('navigation.drawer.guestTitle')}
            </Text>
            <Button
              mode="contained"
              onPress={() => handleNavigateToTab('Account')}
              compact
            >
              {t('navigation.drawer.signInCta')}
            </Button>
          </View>
        )}
      </View>
      <View style={styles.sectionSpacing}>
        {renderQuickLinks}
        {renderCategories}
        {renderCmsPages}
      </View>
      <Divider style={styles.sectionDivider} />
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

export const RootNavigator: React.FC = () => {
  const {t} = useAppTranslation('navigation');
  const theme = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        header: ({navigation}) => <AppHeader navigation={navigation} />,
        headerStyle: {backgroundColor: theme.colors.surface},
        headerShadowVisible: false,
      }}
      drawerContent={props => <DrawerContent {...props} />}
    >
      <Drawer.Screen
        name="HomeTabs"
        component={MainTabsNavigator}
        options={{
          drawerLabel: t('drawer.catalog'),
          drawerIcon: ({color, size}) => (
            <Icon name="grid" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="CmsStack"
        component={CmsStackNavigator}
        options={{
          drawerLabel: t('drawer.cms'),
          drawerIcon: ({color, size}) => (
            <Icon name="file-text" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: t('drawer.settings'),
          drawerIcon: ({color, size}) => (
            <Icon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerScroll: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  statusContainer: {
    gap: 8,
  },
  statusSubtitle: {
    color: '#6b7280',
  },
  sectionSpacing: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  sectionDivider: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
});

export type {
  CmsStackParamList,
  HomeStackParamList,
  MainTabParamList,
  RootDrawerParamList,
};
