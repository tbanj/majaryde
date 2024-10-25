import { icons } from "@/constants";
import React, { Dispatch } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ShowCatchErrorProp {
  text: string;
  setCOMPState: (data: boolean) => void;
}

const ShowCatchError = ({ setCOMPState, text }: ShowCatchErrorProp) => {
  return (
    <View className="absolute w-full top-6 bg-yellow-500 z-20">
      <TouchableOpacity
        onPress={() => setCOMPState(false)}
        className="justify-center items-center "
      >
        <View className="flex flex-row justify-center items-center space-x-2 ">
          <Image source={icons.warningSignDark} className={`w-8 h-8 `} />
          <Text className="text-base">{text}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ShowCatchError;
