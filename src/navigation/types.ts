import type {NavigatorScreenParams} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {DrawerNavigationProp} from '@react-navigation/drawer';

export type HomeStackParamList = {
  Home: {categoryId?: string} | undefined;
  ProductDetail: {productId: string};
};

export type CartStackParamList = {
  CartHome: undefined;
  Checkout: undefined;
};

export type CmsStackParamList = {
  CmsList: undefined;
  CmsDetail: {slug: string; title?: string};
};

export type MainTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  Cart: NavigatorScreenParams<CartStackParamList>;
  Wishlist: undefined;
  Account: undefined;
};

export type RootDrawerParamList = {
  HomeTabs: NavigatorScreenParams<MainTabParamList>;
  CmsStack: NavigatorScreenParams<CmsStackParamList>;
  Settings: undefined;
};

export type HomeStackNavigation = NativeStackNavigationProp<
  HomeStackParamList
>;

export type CartStackNavigation = NativeStackNavigationProp<
  CartStackParamList
>;

export type CmsStackNavigation = NativeStackNavigationProp<CmsStackParamList>;

export type MainTabNavigation = BottomTabNavigationProp<MainTabParamList>;

export type RootDrawerNavigation = DrawerNavigationProp<RootDrawerParamList>;
