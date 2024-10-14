import { useUser } from "@clerk/clerk-expo";
import { Image, Text, View } from "react-native";

import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useDriverStore, useLocationStore } from "@/store";
import { formatTime } from "../lib/utils";
import Payment from "@/components/Payment";

import { StripeProvider } from "@stripe/stripe-react-native";
import { useEffect, useState } from "react";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";

const BookRide = () => {
  const [driverDetails, setDriverDetails] = useState<any>(null);
  const { user } = useUser();
  const { userAddress, destinationAddress } = useLocationStore();
  const { drivers, selectedDriver } = useDriverStore();

  useEffect(() => {
    if (Array.isArray(drivers)) {
      setDriverDetails(
        drivers?.filter((driver) => +driver.id === selectedDriver)[0],
      );
    }

    return () => {};
  }, []);

  const handleHomeBTN = () => {
    router.replace("/(root)/(tabs)/home");
  };
  return (
    <RideLayout
      title="Track Ride"
      snapPoints={["58%", "85%"]}
      showBackRoute={false}
    >
      {driverDetails && (
        <>
          <View className="space-x-2 flex justify-start flex-row border-b border-general-700">
            <Text className="text-xl font-JakartaSemiBold mb-3">
              Arriving in
            </Text>
            <Text className="text-xl font-JakartaRegular text-[#0CC25F]">
              {formatTime(parseInt(`${driverDetails?.time}`) || 5)}
            </Text>
          </View>

          <View className="flex py-3 px-5 w-full  items-start justify-center rounded-3xl bg-general-600 mt-5">
            <View className="flex flex-row items-center justify-between w-full">
              <View className="flex flex-col items-center justify-center">
                <Image
                  source={{ uri: driverDetails?.profile_image_url }}
                  className="w-16 h-16 rounded-full"
                />

                <View className="flex flex-row items-center justify-center pt-2">
                  <Text className="text-lg font-JakartaRegular">
                    {driverDetails?.title}
                  </Text>
                </View>
              </View>

              {/* //TODO car */}
              <View className="flex justify-center items-center h-auto">
                <Image
                  source={{ uri: driverDetails?.car_image_url }}
                  className="w-28 h-28"
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>

          <View className="flex flex-col w-full items-start justify-center mt-5">
            <View className="flex flex-row items-center justify-start mt-3 border-b border-general-700 w-full py-3">
              <Image source={icons.to} className="w-6 h-6" />
              <Text className="text-lg font-JakartaRegular ml-2">
                {userAddress}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-start w-full py-3">
              <Image source={icons.point} className="w-6 h-6" />
              <Text className="text-lg font-JakartaRegular ml-2">
                {destinationAddress}
              </Text>
            </View>
          </View>

          <CustomButton
            title="Back Home"
            className="my-4"
            onPress={handleHomeBTN}
          />
        </>
      )}
    </RideLayout>
  );
};

export default BookRide;
