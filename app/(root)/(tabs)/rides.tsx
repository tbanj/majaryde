import { useFetch } from "@/app/lib/fetch";
import ISConnectedCard from "@/components/ISConnectedCard";
import RideCard from "@/components/RideCard";
import ShowCatchError from "@/components/ShowCatchError";
import { images } from "@/constants";
import { Ride } from "@/types/type";
import { useUser } from "@clerk/clerk-expo";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Rides = () => {
  const [showCatchError, setShowCatchError] = useState(false);
  const { user } = useUser();
  const {
    data: recentRides,
    loading,
    error,
    isConnected,
  } = useFetch<Ride[]>(`${process.env.EXPO_PUBLIC_LIVE_API}/ride/${user?.id}`);

  useEffect(() => {
    if (showCatchError)
      setTimeout(() => {
        setShowCatchError(false);
      }, 3000);

    return () => {};
  }, [showCatchError]);

  const handleCOMPState = (data: boolean) => setShowCatchError(data);
  return (
    <SafeAreaView>
      <FlatList
        data={recentRides}
        renderItem={({ item }) => <RideCard ride={item} />}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text>No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <View className="flex flex-col">
            {showCatchError && (
              <ShowCatchError
                text="Error encounter during api call"
                setCOMPState={handleCOMPState}
              />
            )}
            {!isConnected && <ISConnectedCard />}
            <Text className="text-2xl font-JakartaBold my-5">All Rides</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Rides;
