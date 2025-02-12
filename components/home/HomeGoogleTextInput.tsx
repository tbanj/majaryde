import React from "react";
import GoogleTextInput from "../GoogleTextInput";
import { useLocationStore } from "@/store";
import useNetworkCheck from "@/app/hooks/useNetworkCheck";
import { router } from "expo-router";
import { icons } from "@/constants";

const HomeGoogleTextInput = () => {
  const { state } = useNetworkCheck();
  const { setDestinationLocation } = useLocationStore();
  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    if (state.isConnected) {
      setDestinationLocation(location);
      router.push("/(root)/find-ride");
    }
  };

  return (
    <>
      <GoogleTextInput
        icon={icons.search}
        containerStyle="bg-white shadow-neutral-300"
        handlePress={handleDestinationPress}
      />
    </>
  );
};

export default HomeGoogleTextInput;
