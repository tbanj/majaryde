import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import useNetworkCheck from "./hooks/useNetworkCheck";
import "react-native-get-random-values";

const Page = () => {
  const { state } = useNetworkCheck();
  const { isSignedIn, isLoaded, userId } = useAuth();
  if (!isLoaded && !userId) {
    return (
      <View className="absolute w-full h-full z-10 items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  if (state.isConnected && isSignedIn && isLoaded && userId) {
    return <Redirect href={`/(root)/(tabs)/home`} />;
  }

  return (
    <>
      <Redirect href="/(auth)/welcome" />
    </>
  );
};

export default Page;
