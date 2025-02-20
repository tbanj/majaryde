import { useAuth, useUser } from "@clerk/clerk-expo";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";
import RideCard from "../RideCard";

import { images, NativeModalState } from "@/constants";
import ShowCatchError from "../ShowCatchError";
import ISConnectedCard from "../ISConnectedCard";
import LogoutBTN from "../home/LogoutBTN";
import HomeGoogleTextInput from "../home/HomeGoogleTextInput";
import ReactNativeModal from "react-native-modal";
import CustomButton from "../CustomButton";
import MapComponent from "../home/MapComponent";
import useNetworkCheck from "@/app/hooks/useNetworkCheck";
import { useFetch } from "@/app/lib/fetch";
import { Ride } from "@/types/type";
import { useLocationStore } from "@/store";
import { router, useFocusEffect, useNavigation } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Linking,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeComponent = () => {
  const [locationPermissionState, setLocationPermissionState] = useState({
    location: null,
    BTNDisabled: false,
    signOutActivated: NativeModalState.default,
    signOutDone: NativeModalState.default,
  });
  const [COMPState, setCOMPState] = useState<any>({
    BTNDisabled: false,
    loadingState: false,
  });
  /* const [debugInfo, setDebugInfo] = useState<{
    apiKey: string;
    AndroidApiKey: string;
    region: any;
    markersCount: number;
    hasValidUserLocation: boolean;
    hasValidDestination: boolean;
    permissions: string[] | null;
    directionsError: string | null;
    userLat: number | null;
    userLong: number | null;
    destLat: number | null;
    destLong: number | null;
    error: any;
  }>({
    apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY || "not set",
    AndroidApiKey:
      process.env.EXPO_PUBLIC_DEV_ANDROID_MAP_GOOGLE_API_KEY || "not set",
    region: null,
    markersCount: 0,
    hasValidUserLocation: false,
    hasValidDestination: false,
    permissions: null,
    directionsError: null,
    userLat: null,
    userLong: null,
    destLat: null,
    destLong: null,
    error: null,
  }); */

  const {
    setUserLocation,
    setDestinationLocation,
    destinationAddress,
    userLatitude,
    setUserCountry,
    userLongitude,
    setShowMap,
  } = useLocationStore();

  const { state } = useNetworkCheck();

  const { signOut } = useAuth();
  const { user } = useUser();
  const navigation = useNavigation();

  const {
    data: recentRides,
    loading,
    error,
    isOfflineData,
    refetch,
    clearCacheData,
  } = useFetch<Ride[]>({
    cacheKey: `aceeryde_rides_${user?.id}`,
    cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
    endpoint: `${process.env.EXPO_PUBLIC_LIVE_API}/ride/${user?.id}`,
    apiParams: user?.id,
  });

  const hideKeyboardSub = useCallback(() => {
    return Keyboard.addListener("keyboardDidHide", () => {
      navigation.setOptions({
        tabBarStyle: {
          backgroundColor: "#333333",
          borderRadius: 50,
          paddingBottom: 0,
          overflow: "hidden",
          marginHorizontal: 20,
          marginBottom: 20,
          height: 78,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          position: "absolute",
        },
      });
    });
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      navigation.setOptions({
        tabBarStyle: { display: "none" },
      });
    });

    const hideSubscription = hideKeyboardSub();

    // Clean up listeners on unmount
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [navigation]);

  useEffect(() => {
    if (COMPState.showCatchError)
      setTimeout(() => {
        setCOMPState({
          ...COMPState,
          showCatchError: false,
        });
      }, 3000);

    return () => {};
  }, [COMPState.showCatchError]);

  useEffect(() => {
    if (user?.id && !recentRides) {
      refetch();
    }
    return () => {};
  }, [user?.id]);

  const requestLocation = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        // await new Promise((resolve) => setTimeout(resolve, 500));
        if (status !== "granted") {
          /* setLocationPermissionState((prev: any) => ({
            ...prev,
            location: status,
          })); */
          resolve({ location: status });
          // return;
        } else {
          let location = await Location.getCurrentPositionAsync();
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (location) {
            const address = await Location.reverseGeocodeAsync({
              latitude: location.coords?.latitude,
              longitude: location.coords?.longitude,
            });
            //     setShowMap({ mapCOMP: true });
            //     setUserLocation({
            //       latitude: location.coords?.latitude,
            //       longitude: location.coords?.longitude,
            //       /* latitude: 37.78825,
            // longitude: -122.4324, */
            //       address: `${address[0].name}, ${address[0].region}`,
            //     });

            // setUserCountry({ country: address[0].country! });
            // setLocationPermissionState((prev: any) => ({
            //   ...prev,
            //   location: status,
            // }));
            resolve({
              mapCOMP: true,
              latitude: location.coords?.latitude,
              longitude: location.coords?.longitude,
              address: `${address[0].name}, ${address[0].region}`,
              country: address[0].country!,
              location: status,
            });
          }
        }
      } catch (error: any) {
        /* setLocationPermissionState((prev: any) => ({
          ...prev,
          location: "denied",
        })); */
        reject({ location: "denied" });
      }
    });
  };

  useFocusEffect(
    useCallback(() => {
      const hideSubscription = hideKeyboardSub();
      async function initialLocationData() {
        if (!state.isConnected) return;
        const fetchedLOCData: any = await requestLocation();
        // location: status
        const { location, latitude, longitude, address, country, mapCOMP } =
          fetchedLOCData;
        if (fetchedLOCData.location !== "granted") {
          setLocationPermissionState((prev: any) => ({
            ...prev,
            location,
          }));
        } else {
          if (longitude) {
            setUserLocation({
              latitude,
              longitude,
              /* latitude: 37.78825,
            longitude: -122.4324, */
              address,
            });
            setUserCountry({ country });
            setLocationPermissionState((prev: any) => ({
              ...prev,
              location,
            }));
            await new Promise((resolve) => setTimeout(resolve, 800));
            setShowMap({ mapCOMP });
          }
        }
      }
      if (
        locationPermissionState.location === null ||
        locationPermissionState.location === "denied" ||
        !userLatitude
      ) {
        initialLocationData();
      }

      return () => {
        console.log("home aware  route unfocus");
        hideSubscription.remove();
      };
    }, [locationPermissionState.location, userLatitude])
  );

  const requestPermit = async () => {
    setLocationPermissionState((prev: any) => ({
      ...prev,
      BTNDisabled: true,
    }));
    // if (locationPermissionState?.location === "denied") Linking.openSettings();
    await requestLocation();
    setLocationPermissionState((prev: any) => ({
      ...prev,
      BTNDisabled: false,
    }));
  };

  const handleCOMPState = (data: boolean) => {
    setCOMPState((COMPState: any) => ({
      ...COMPState,
      showCatchError: data,
    }));
    setShowMap({ mapCOMP: false });
    setTimeout(() => {
      setShowMap({ mapCOMP: true });
    }, 1200);
  };

  /* //todo implement checker to check if recentRides is empty or null */

  /* useFocusEffect(
    useCallback(
      () => {
        first
      },
      [second],
    )
    
  ) */
  const HomeComponentMemoid = useMemo(() => {
    if (user?.id) {
      return (
        <FlatList
          data={recentRides?.slice(0, 5)}
          // isOffline={isOfflineData}
          renderItem={({ item }) => <RideCard ride={item} />}
          className="px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          ListEmptyComponent={() => (
            <View className="flex flex-col items-center justify-center">
              <View>
                {loading && !error ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Image
                      source={images.noResult}
                      className="w-40 h-40"
                      alt="No recent rides found"
                      resizeMode="contain"
                    />
                    <Text>No recent rides found</Text>
                  </>
                )}
              </View>

              {!state.isConnected && (
                <>
                  <Image
                    source={images.noResult}
                    className="w-40 h-40"
                    alt="No recent rides found"
                    resizeMode="contain"
                  />
                  <Text>No offline rides found</Text>
                </>
              )}
            </View>
          )}
          ListHeaderComponent={() => (
            <View className="relative">
              {state.isConnected && error && !loading && (
                <ShowCatchError
                  text={JSON.stringify(error, null, 2)}
                  setCOMPState={handleCOMPState}
                  showCatchError={COMPState.showCatchError}
                />
              )}
              {!state.isConnected && <ISConnectedCard customClass="!top-2" />}

              <View className="flex flex-row items-center justify-between my-5 relative">
                <Text className="text-1xl font-JakartaExtraBold">
                  Welcome{", "}
                  {(state.isConnected &&
                    (user?.firstName ||
                      (user?.emailAddresses?.length &&
                        user?.emailAddresses?.[0].emailAddress?.split(
                          "@"
                        )[0]))) ||
                    "Guest"}{" "}
                  👋
                </Text>

                <LogoutBTN />
              </View>

              <HomeGoogleTextInput />
              <>
                <Text className="text-xl font-JakartaBold mt-5 mb-3">
                  Your Current Location
                </Text>
                {locationPermissionState.location === "denied" && (
                  <ReactNativeModal
                    isVisible={locationPermissionState.location === "denied"}
                  >
                    <View className="bg-white px-7 py-9 rounded-2xl min-h-[150px] flex justify-center items-center">
                      <Text className="text-2xl font-JakartaExtraBold mb-2">
                        Grant Permission
                      </Text>
                      <Text className="font-Jakarta mb-5">
                        Kindly grant location Permission.
                      </Text>

                      <CustomButton
                        title="Ok"
                        onPress={requestPermit}
                        disabled={locationPermissionState.BTNDisabled}
                        className="mt-5 bg-warning-500 !w-[100px]"
                      />
                    </View>
                  </ReactNativeModal>
                )}
                <View className="flex flex-row items-center bg-transparent h-[300px]">
                  <MapComponent />
                </View>
                {/* {debugInfo.hasValidUserLocation && (
                  <View>
                    <ScrollView className="w-full  bg-gray-100 p-2">
                      <Text className="font-bold">Debug Information:</Text>
                      <Text>
                        API Key: {debugInfo.apiKey.substring(0, 6)}...
                      </Text>
                      <Text>
                        Android API Key:{" "}
                        {debugInfo.AndroidApiKey.substring(0, 6)}
                        ...
                      </Text>
                      <Text>
                        Directions Error: {debugInfo.directionsError || "None"}
                      </Text>
                      <Text>Markers Count: {debugInfo.markersCount}</Text>
                      <Text>
                        Valid User Location:{" "}
                        {String(debugInfo.hasValidUserLocation)}
                      </Text>
                      <Text>User Lat: {debugInfo.userLat}</Text>
                      <Text>User Long: {debugInfo.userLong}</Text>
                      <Text>
                        Has Destination: {String(debugInfo.hasValidDestination)}
                      </Text>
                      <Text>Dest Lat: {debugInfo.destLat}</Text>
                      <Text>Dest Long: {debugInfo.destLong}</Text>
                      <Text>
                        Initial Region:{" "}
                        {JSON.stringify(debugInfo.region, null, 2)}
                      </Text>
                      {debugInfo.error && (
                        <Text className="text-red-500">
                          Fetch Error:{" "}
                          {JSON.stringify(debugInfo.error, null, 2)}{" "}
                        </Text>
                      )}
                      {loading && <Text>Loading: {String(loading)}</Text>}
                      {isOfflineData && (
                        <Text>Using Offline Data: {String(isOfflineData)}</Text>
                      )}
                    </ScrollView>
                  </View>
                )} */}
              </>

              <Text className="text-xl font-JakartaBold mt-5 mb-3">
                Recent Rides
              </Text>
            </View>
          )}
        />
      );
    }
  }, [
    state.isConnected,
    user?.id,
    locationPermissionState?.location,
    recentRides,
  ]);

  return <>{HomeComponentMemoid}</>;
};

export default HomeComponent;
