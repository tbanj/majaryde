import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import React from "react";

const Page = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (isSignedIn && isLoaded) {
    return <Redirect href={"/(root)/(tabs)/home"} />;
  }

  return <Redirect href="/(auth)/welcome" />;
};

export default Page;
