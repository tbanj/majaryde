import { icons } from "@/constants";
import React from "react";
import { Image, Text, View } from "react-native";

interface ISConnectedCardProps {
  customClass?: string;
}
const ISConnectedCard = ({ customClass }: ISConnectedCardProps) => {
  return (
    <View className={`absolute w-full top-8 bg-yellow-500 z-15 ${customClass}`}>
      <View className="flex flex-row justify-center items-center space-x-2 ">
        <Image source={icons.warningSignDark} className={`w-8 h-8 `} />
        <Text className="text-base font-JakartaMedium">
          No internet connection
        </Text>
      </View>
    </View>
  );
};

export default ISConnectedCard;
