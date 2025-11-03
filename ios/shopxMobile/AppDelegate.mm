#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React-RCTAppDelegate/RCTDefaultReactNativeFactoryDelegate.h>
#import <React-RCTAppDelegate/RCTReactNativeFactory.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>

@interface ShopxReactNativeDelegate : RCTDefaultReactNativeFactoryDelegate
@end

@implementation ShopxReactNativeDelegate

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end

@implementation AppDelegate {
  RCTReactNativeFactory *_reactNativeFactory;
  ShopxReactNativeDelegate *_factoryDelegate;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  _factoryDelegate = [ShopxReactNativeDelegate new];
  _factoryDelegate.dependencyProvider = [RCTAppDependencyProvider new];
  _reactNativeFactory = [[RCTReactNativeFactory alloc] initWithDelegate:_factoryDelegate];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];

  [_reactNativeFactory startReactNativeWithModuleName:@"shopxMobile"
                                             inWindow:self.window
                                        launchOptions:launchOptions];

  return YES;
}

@end
