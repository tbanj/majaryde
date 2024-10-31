import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import ISConnectedCard from "@/components/ISConnectedCard";
import RideLayout from "@/components/RideLayout";
import { useDriverStore } from "@/store";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import useNetworkCheck from "../hooks/useNetworkCheck";

const ConfirmRide = () => {
  const { state } = useNetworkCheck();
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  return (
    <RideLayout title="Choose a Rider" snapPoints={["65%", "85%"]}>
      <FlatList
        data={drivers}
        renderItem={({ item }) => (
          <DriverCard
            item={item}
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(Number(item.id))}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton
              disabled={!state.isConnected || !selectedDriver ? true : false}
              title={
                !state.isConnected ? "Select Ride Unavailable" : "Select Ride"
              }
              onPress={() => router.push("/(root)/book-ride")}
            />
          </View>
        )}
        ListHeaderComponent={() => (
          <View className="flex flex-col">
            {!state.isConnected && <ISConnectedCard />}
          </View>
        )}
      />
    </RideLayout>
  );
};

export default ConfirmRide;
