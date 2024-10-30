import CustomButton from "@/components/CustomButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useDriverStore, useLocationStore } from "@/store";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Alert, Text, View } from "react-native";
import ISConnectedCard from "@/components/ISConnectedCard";
import useNetworkCheck from "@/app/hooks/useNetworkCheck";

const FindRide = () => {
  const { state } = useNetworkCheck();
  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
    userCountry,
  } = useLocationStore();
  const { drivers } = useDriverStore();

  const CheckDESTCountry = () => {
    if (userCountry) {
      const checkDESTWithinCTRY =
        destinationAddress &&
        destinationAddress?.split(", ").pop()!.toLocaleLowerCase();
      const validCountry =
        checkDESTWithinCTRY === userCountry.toLocaleLowerCase();
      return validCountry;
    }
  };

  const handleFindRide = () => {
    /* const dataNotValid = drivers.find((data: any) => data.price === "NaN");
    if (dataNotValid) {
      Alert.alert("Error", "Choose another closeby destination");
      return;
    } */
    const withinCountry = CheckDESTCountry();
    if (!withinCountry) {
      Alert.alert("Warning", "Inter country destination is not supported yet.");
      return;
    }
    router.push("/(root)/confirm-ride");
  };

  return (
    <RideLayout title="Ride">
      <>
        <View className="my-3">
          <Text className="text-lg font-JakartaBold mb-3">From</Text>
          <GoogleTextInput
            icon={icons.target}
            initialLocation={userAddress!}
            containerStyle="bg-neutral-100"
            textInputBackgroundColor="#f5f5f5"
            handlePress={(location) => setUserLocation(location)}
          />
        </View>

        <View className="">
          <Text className="text-lg font-JakartaBold mb-3">To</Text>
          <GoogleTextInput
            icon={icons.map}
            initialLocation={destinationAddress!}
            containerStyle="bg-neutral-100"
            textInputBackgroundColor="transparent"
            handlePress={(location) => setDestinationLocation(location)}
          />
        </View>

        <CustomButton
          title={!state.isConnected ? "Find now Unavailable" : "Find now"}
          disabled={!state.isConnected ? true : false}
          onPress={handleFindRide}
          className="mt-5"
        />
      </>
    </RideLayout>
  );
};

export default FindRide;
