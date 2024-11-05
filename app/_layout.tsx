import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { LogBox, Text, View } from "react-native";
import Bugsnag from "@bugsnag/expo";
import NetworkAwareWrapper from "@/components/hoc/NetworkAwareWrapperProps";
import useNetworkCheck from "./hooks/useNetworkCheck";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
// Prevent the splash screen from auto-hiding before asset loading is complete.

SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs(["Clerk:", "MapViewDirections Error:"]);

export default function RootLayout() {
  const [loaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    Jakarta: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });
  const { state } = useNetworkCheck();
  // Subscribe to network state changes

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (state.isConnected) {
      Bugsnag.start();
    }

    return () => {};
  }, [state.isConnected]);

  if (!loaded) {
    return null;
  }

  // Create the error boundary...
  const ErrorBoundary = Bugsnag.getPlugin("react").createErrorBoundary(React);

  const ErrorView = () => (
    <View>
      <Text>Inform users of an error in the component tree.</Text>
    </View>
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorView}>
      <NetworkAwareWrapper publishableKey={publishableKey}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(root)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </NetworkAwareWrapper>
    </ErrorBoundary>
  );
}
