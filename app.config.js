import "dotenv/config";

export default {
  expo: {
    jsEngine: "hermes",
    name: "aceeryde",
    slug: "aceeryde",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",

    ios: {
      bundleIdentifier: "com.tbanj.aceeryde",
      supportsTablet: true,
      config: {
        googleMapsApiKey:
          process.env.EXPO_PUBLIC_DEV_ANDROID_MAP_GOOGLE_API_KEY,
      },
      userInterfaceStyle: "automatic",
      // Dark mode splash for iOS
      splash: {
        dark: {
          image: "./assets/images/splash-dark.png",
          resizeMode: "contain",
          backgroundColor: "#121212",
        },
      },
    },
    // Dark mode splash screen
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      userInterfaceStyle: "automatic",
      splash: {
        image: "./assets/images/splash-light.png",
        resizeMode: "contain",
        backgroundColor: "#2F80ED",
        dark: {
          image: "./assets/images/splash-dark.png",
          resizeMode: "contain",
          backgroundColor: "#121212",
        },
      },
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
      ],
      package: "com.tbanj.aceeryde",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_DEV_ANDROID_MAP_GOOGLE_API_KEY,
        },
      },
    },
    splash: {
      image: "./assets/images/splash-light.png",
      resizeMode: "contain",
      backgroundColor: "#2F80ED",
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
          origin: process.env.EXPO_PUBLIC_SERVER_URL,
        },
      ],
      "expo-font",
      "@bugsnag/plugin-expo-eas-sourcemaps",
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "18b4b654-d4e5-4e1e-9940-bbe1c22476e9",
      },
      bugsnag: {
        apiKey: process.env.EXPO_PUBLIC_BUGSNAG_API_KEY,
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
