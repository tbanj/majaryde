import "dotenv/config";

export default {
  expo: {
    jsEngine: "hermes",
    name: "majaryde",
    slug: "majaryde",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#2F80ED",
    },
    ios: {
      bundleIdentifier: "com.tbanj.majaryde",
      supportsTablet: true,
      config: {
        googleMapsApiKey:
          process.env.EXPO_PUBLIC_DEV_ANDROID_MAP_GOOGLE_API_KEY,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
      ],
      package: "com.tbanj.majaryde",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_DEV_ANDROID_MAP_GOOGLE_API_KEY,
        },
      },
    },
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      [
        "expo-router",
        {
          origin: "https://uber.dev/",
        },
      ],
      "expo-font",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "ef2825e6-74f7-49f8-b731-abdb75c17dbd",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/ef2825e6-74f7-49f8-b731-abdb75c17dbd",
    },
  },
};
