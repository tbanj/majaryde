import { Image, Text, TouchableOpacity, View } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { useRef, useState } from "react";
import { icons, onboarding } from "../../constants";
import CustomButton from "@/components/CustomButton";
import { useAuth } from "@clerk/clerk-expo";
import useNetworkCheck from "../hooks/useNetworkCheck";
import ISConnectedCard from "@/components/ISConnectedCard";

const Onboarding = () => {
  const { state } = useNetworkCheck();
  const { isSignedIn } = useAuth();
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const isLastSlide = activeIndex === onboarding.length - 1;

  const handleNavigation = () => {
    if (isLastSlide) {
      router.replace("/(auth)/sign-up");
    } else {
      swiperRef.current?.scrollBy(1);
    }
  };

  if (state.isConnected && isSignedIn)
    return <Redirect href={"/(root)/(tabs)/home"} />;

  return (
    <SafeAreaView
      className={`flex h-full items-center justify-between bg-white ${state.isConnected ? "p-5" : "px-5 py-7"}`}
    >
      {!state.isConnected && <ISConnectedCard />}
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-up");
        }}
        className={`w-full flex justify-end items-end   `}
      >
        <Text className="text-black text-md font-JakartaBold">Skip</Text>
      </TouchableOpacity>
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={
          <View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />
        }
        activeDot={
          <View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full" />
        }
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item) => (
          <View key={item.id} className="flex items-center justify-center p-5">
            <Image
              source={item.image}
              className="w-full h-[300px]"
              resizeMode="contain"
            />
            <View className="flx flex-row items-center justify-center w-full mt-10">
              <Text className="text-black text-3xl font-bold mx-10 text-center">
                {item.title}
              </Text>
            </View>
            <Text className="text-lg font-JakartaSemiBold text-center text-[#858585] mx-10 mt-3">
              {item.description}
            </Text>
          </View>
        ))}
      </Swiper>
      <CustomButton
        className="!w-11/12"
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={handleNavigation}
      />
    </SafeAreaView>
  );
};

export default Onboarding;
