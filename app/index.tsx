import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import React from "react";
import { Alert } from "react-native";

const Page = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (isSignedIn && isLoaded) {
    return <Redirect href={`/(root)/(tabs)/home`} />;
  }
  return <Redirect href="/(auth)/welcome" />;
};

export default Page;
