package com.cobox;

import android.app.Application;
import android.util.Log;

import com.facebook.react.PackageList;
import com.facebook.hermes.reactexecutor.HermesExecutorFactory;
import com.facebook.react.bridge.JavaScriptExecutorFactory;
import com.facebook.react.ReactApplication;
import com.bugsnag.BugsnagReactNative;
import cl.json.ShareApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import com.cobox.generated.BasePackageList;
import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;
import org.unimodules.core.interfaces.SingletonModule;

import com.mapbox.rctmgl.RCTMGLPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ShareApplication, ReactApplication {
  private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(
    new BasePackageList().getPackageList(),
    Arrays.<SingletonModule>asList()
  );

  @Override
  public String getFileProviderAuthority() {
      return BuildConfig.APPLICATION_ID + ".provider";
  }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      @SuppressWarnings("UnnecessaryLocalVariable")
      List<ReactPackage> packages = new PackageList(this).getPackages();
      // Packages that cannot be autolinked yet can be added manually here, for example:
      // packages.add(new MyReactNativePackage());
      packages.add(new ModuleRegistryAdapter(mModuleRegistryProvider));
      return packages;
      // return Arrays.<ReactPackage>asList(
      //     new MainReactPackage(),
      //       BugsnagReactNative.getPackage(),
      //       new RNSharePackage(),
      //       new KCKeepAwakePackage(),
      //       new AndroidOpenSettingsPackage(),
      //       new RNNetworkInfoPackage(),
      //       new NetInfoPackage(),
      //       new AsyncStoragePackage(),
      //       new LinearGradientPackage(),
      //       new ImageResizerPackage(),
      //       new RNFSPackage(),
      //       new ReanimatedPackage(),
      //     new RNGestureHandlerPackage(),
      //     new SplashScreenReactPackage(),
      //     new RNNodeJsMobilePackage(),
      //     new RCTMGLPackage(),
      //     new ModuleRegistryAdapter(mModuleRegistryProvider)
      // );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    BugsnagReactNative.start(this);
    SoLoader.init(this, /* native exopackage */ false);
  }
}
