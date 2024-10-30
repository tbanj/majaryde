import { useUser } from "@clerk/clerk-expo";
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
import { useFocusEffect, useNavigation } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Text,
  View,
} from "react-native";

const HomeComponent = () => {
  const [locationPermissionState, setLocationPermissionState] = useState({
    location: null,
    BTNDisabled: false,
    signOutActivated: NativeModalState.default,
    signOutDone: NativeModalState.default,
  });
  // const [showMap, setShowMap] = useState(true);
  const [COMPState, setCOMPState] = useState<any>({
    BTNDisabled: false,
    loadingState: false,
  });
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
    cacheKey: `majaryde_rides_${user?.id}`,
    cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
    endpoint: `${process.env.EXPO_PUBLIC_LIVE_API}/ride/${user?.id}`,
    apiParams: user?.id,
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      navigation.setOptions({
        tabBarStyle: { display: "none" },
      });
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
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

    // Clean up listeners on unmount
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [navigation]);

  useEffect(() => {
    if (COMPState.showCatchError)
      setTimeout(() => {
        setCOMPState({ ...COMPState, showCatchError: false });
      }, 3000);

    return () => {};
  }, [COMPState.showCatchError]);

  const requestLocation = async () => {
    try {
      if (!state.isConnected) return;
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationPermissionState((prev: any) => ({
          ...prev,
          location: status,
        }));
        return;
      } else {
        let location = await Location.getCurrentPositionAsync();
        if (location) {
          const address = await Location.reverseGeocodeAsync({
            latitude: location.coords?.latitude,
            longitude: location.coords?.longitude,
          });
          setShowMap({ mapCOMP: true });
          setUserLocation({
            latitude: location.coords?.latitude,
            longitude: location.coords?.longitude,
            /* latitude: 37.78825,
        longitude: -122.4324, */
            address: `${address[0].name}, ${address[0].region}`,
          });
          setUserCountry({ country: address[0].country! });
          setLocationPermissionState((prev: any) => ({
            ...prev,
            location: status,
          }));
        }
      }
    } catch (error: any) {
      setLocationPermissionState((prev: any) => ({
        ...prev,
        location: "denied",
      }));
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (
        !locationPermissionState?.location ||
        locationPermissionState?.location === "denied" ||
        !userLatitude
      ) {
        requestLocation();
      }
      return () => {
        console.log("home aware  route unfocus");
      };
    }, [locationPermissionState.location])
  );

  const requestPermit = async () => {
    setLocationPermissionState((prev: any) => ({
      ...prev,
      BTNDisabled: true,
    }));
    if (locationPermissionState?.location === "denied") Linking.openSettings();
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

              <View className="flex flex-row items-center justify-between my-5">
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
                {/* <TouchableOpacity
                  disabled={locationPermissionState.BTNDisabled}
                  onPress={handleLogoutModal}
                  className="justify-center items-center w-10 h-10 rounded-full bg-white"
                >
                  <Image source={icons.out} className="w-4 h-4" />
                </TouchableOpacity> */}
                <LogoutBTN />
              </View>

              {/* <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              
            </KeyboardAvoidingView> */}
              {/* <GoogleTextInput
                icon={icons.search}
                containerStyle="bg-white shadow-neutral-300"
                handlePress={handleDestinationPress}
              /> */}
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
                  {/* {showMap && (
                    <Map
                      // isLogout={locationPermissionState.signOutActivated}
                      isLogout="pending"
                      isConnected={state.isConnected}
                    />
                  )} */}
                  <MapComponent />
                </View>
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
  console.log(
    "recent rides",
    recentRides,
    "locationPermissionState?.location",
    locationPermissionState?.location
  );
  return <>{HomeComponentMemoid}</>;
};

export default HomeComponent;
