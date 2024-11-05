import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import useNetworkCheck from "./hooks/useNetworkCheck";

const Page = () => {
  const { state } = useNetworkCheck();
  const { isSignedIn, isLoaded, userId } = useAuth();
  if (state.isConnected && isSignedIn && isLoaded && userId) {
    return <Redirect href={`/(root)/(tabs)/home`} />;
  }
  return <Redirect href="/(auth)/welcome" />;
};

export default Page;
