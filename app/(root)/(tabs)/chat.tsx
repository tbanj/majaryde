import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants";
import useNetworkCheck from "@/app/hooks/useNetworkCheck";
import ISConnectedCard from "@/components/ISConnectedCard";

const Chat = () => {
  const { state } = useNetworkCheck();
  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      {!state.isConnected && <ISConnectedCard customClass="!ml-5" />}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text className="text-2xl font-JakartaBold">Chat</Text>
        <View className="flex-1 h-fit flex justify-center items-center">
          <Image
            source={images.message}
            alt="message"
            className="w-full h-40"
            resizeMode="contain"
          />
          <Text className="text-3xl font-JakartaBold mt-3">
            No Messages Yet
          </Text>
          <Text className="text-base mt-2 text-center px-7">
            Start a conversation with your friends and family
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Chat;
