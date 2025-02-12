import { icons } from "@/constants";
import { router, useRouter } from "expo-router";
import { ReactNode, useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Map from "./Map";
import useNetworkCheck from "@/app/hooks/useNetworkCheck";
import ISConnectedCard from "./ISConnectedCard";
import { useLocationStore } from "@/store";

const RideLayout = ({
  title,
  children,
  snapPoints,
  showBackRoute = true,
}: {
  title: string;
  children: ReactNode;
  snapPoints?: string[];
  showBackRoute?: boolean;
}) => {
  const { state } = useNetworkCheck();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { setDestinationLocation } = useLocationStore();

  const resetDestination = () => {
    setDestinationLocation({
      latitude: null!,
      longitude: null!,
      address: null!,
    });
  };

  return (
    <GestureHandlerRootView className="flex flex-1">
      <View className="flex flex-1 bg-white">
        <View className="flex flex-col h-screen bg-blue-500">
          {!state.isConnected && <ISConnectedCard customClass=" !z-10" />}
          <View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
            {showBackRoute && (
              <TouchableOpacity
                onPress={() => {
                  if (title === "Ride") {
                    resetDestination();
                  }
                  router.back();
                }}
              >
                <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                  <Image
                    source={icons.backArrow}
                    resizeMode="contain"
                    className="w-6 h-6"
                  />
                </View>
              </TouchableOpacity>
            )}
            <Text className="text-xl font-JakartaSemiBold ml-5">
              {title || "Go Back"}
            </Text>
          </View>
          <Map isConnected={state.isConnected} />
        </View>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints || ["45%", "85%"]}
          index={0}
        >
          {title === "Choose a Rider" ||
          title === "Ride" ||
          title === "Ride information" ? (
            <BottomSheetView
              style={{
                flex: 1,
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
            >
              {children}
            </BottomSheetView>
          ) : (
            <BottomSheetScrollView
              style={{
                flex: 1,
                padding: 10,
              }}
            >
              {children}
            </BottomSheetScrollView>
          )}
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default RideLayout;
