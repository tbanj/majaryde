import { icons } from "@/constants";
import React from "react";
import { Image, Text, View } from "react-native";

const ISConnectedCard = () => {
  return (
    <View className="absolute w-full top-8 bg-yellow-500 ">
      <View className="flex flex-row justify-center items-center space-x-2 ">
        <Image source={icons.warningSignDark} className={`w-6 h-6 `} />
        <Text className="">No internet connection</Text>
      </View>
    </View>
  );
};

export default ISConnectedCard;
