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

@interface AppDelegate ()
@property (nonatomic, copy) NSDictionary *launchOptions;
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.launchOptions = launchOptions;
  return YES;
}

@end

// The SDK shipped with Xcode 27 requires a scene-owned application window.
// Keep the RN factory alive for the lifetime of that scene.
@interface ShopxSceneDelegate : UIResponder <UIWindowSceneDelegate>
@property (nonatomic, strong) UIWindow *window;
@end

@implementation ShopxSceneDelegate {
  RCTReactNativeFactory *_reactNativeFactory;
  ShopxReactNativeDelegate *_factoryDelegate;
}

- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions
{
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }

  _factoryDelegate = [ShopxReactNativeDelegate new];
  _factoryDelegate.dependencyProvider = [RCTAppDependencyProvider new];
  _reactNativeFactory = [[RCTReactNativeFactory alloc] initWithDelegate:_factoryDelegate];

  self.window = [[UIWindow alloc] initWithWindowScene:(UIWindowScene *)scene];
  AppDelegate *appDelegate = (AppDelegate *)UIApplication.sharedApplication.delegate;
  appDelegate.window = self.window;

  [_reactNativeFactory startReactNativeWithModuleName:@"shopxMobile"
                                             inWindow:self.window
                                        launchOptions:appDelegate.launchOptions];
}

@end
