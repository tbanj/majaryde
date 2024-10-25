import { useAuth, useUser } from "@clerk/clerk-expo";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import ReactNativeModal from "react-native-modal";
// import { useDriverStore, useLocationStore } from "@/store";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RideCard from "@/components/RideCard";
import { Ride } from "@/types/type";
import { icons, images, NativeModalState } from "@/constants";
import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import { useLocationStore } from "@/store";
import { useEffect, useState, useCallback } from "react";
import { useFetch } from "@/app/lib/fetch";
import CustomButton from "@/components/CustomButton";
import ISConnectedCard from "@/components/ISConnectedCard";

export default function Page() {
  const [locationPermissionState, setLocationPermissionState] = useState({
    location: null,
    BTNDisabled: false,
    signOutActivated: NativeModalState.default,
  });

  const [COMPState, setCOMPState] = useState<any>({
    BTNDisabled: false,
    loadingState: false,
  });

  const { setUserLocation, setDestinationLocation, userLatitude } =
    useLocationStore();

  const { user } = useUser();
  const { signOut } = useAuth();
  const {
    data: recentRides,
    loading,
    error,
    isConnected,
    refetch,
  } = useFetch<Ride[]>(`${process.env.EXPO_PUBLIC_LIVE_API}/ride/${user?.id}`);

  const navigation = useNavigation();

  const handleRejectLogout = () => {
    setLocationPermissionState((prev: any) => ({
      ...prev,
      signOutActivated: NativeModalState.default,
    }));
  };

  const handleLogoutModal = () => {
    setLocationPermissionState((prev: any) => ({
      ...prev,
      signOutActivated: NativeModalState.pending,
    }));
  };
  const handleSignOut = async () => {
    try {
      setLocationPermissionState((prev: any) => ({
        ...prev,
        BTNDisabled: true,
      }));
      setCOMPState({ ...COMPState, BTNDisabled: true, loadingState: true });
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error: any) {
      setLocationPermissionState((prev: any) => ({
        ...prev,
        BTNDisabled: false,
        signOutActivated: NativeModalState.default,
      }));
      setCOMPState({ ...COMPState, BTNDisabled: false, loadingState: false });
      console.error("Failed to log out:", error);
    }
  };

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);
    router.push("/(root)/find-ride");
  };

  const requestLocation = async () => {
    try {
      // Linking.openSettings();
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

          setUserLocation({
            latitude: location.coords?.latitude,
            longitude: location.coords?.longitude,
            /* latitude: 37.78825,
        longitude: -122.4324, */
            address: `${address[0].name}, ${address[0].region}`,
          });
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
        locationPermissionState.location === null ||
        locationPermissionState.location === "denied" ||
        !userLatitude
      )
        requestLocation();

      return () => {
        console.log("home route is now unfocused.");
        if (
          locationPermissionState.signOutActivated === NativeModalState.success
        )
          setLocationPermissionState((prev: any) => ({
            ...prev,
            location: null,
            signOutActivated: NativeModalState.default,
            BTNDisabled: false,
          }));
      };
    }, [])
  );

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

  const handleLogout = (data: string) => {
    setCOMPState({
      ...COMPState,
      BTNDisabled: false,
      loadingState: false,
    });
    setLocationPermissionState((prev: any) => ({
      ...prev,
      BTNDisabled: false,
      signOutActivated: data,
    }));
  };

  return (
    <SafeAreaView>
      <FlatList
        data={recentRides?.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item} />}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {loading && !error ? (
              <ActivityIndicator size="small" color="#000" />
            ) : !loading && !error ? (
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
              error &&
              !loading && (
                <>
                  <Image
                    source={images.noResult}
                    className="w-40 h-40"
                    alt="No recent rides found"
                    resizeMode="contain"
                  />
                  <Text>Error: {error}</Text>
                </>
              )
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <View className="relative">
            {!isConnected && <ISConnectedCard />}

            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-1xl font-JakartaExtraBold">
                Welcome{", "}
                {user?.firstName ||
                  user?.emailAddresses[0].emailAddress.split("@")[0]}{" "}
                👋
              </Text>
              <TouchableOpacity
                disabled={locationPermissionState.BTNDisabled}
                onPress={handleLogoutModal}
                className="justify-center items-center w-10 h-10 rounded-full bg-white"
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            {/* <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              
            </KeyboardAvoidingView> */}
            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-neutral-300"
              handlePress={handleDestinationPress}
            />

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
                <Map
                  isLogout={locationPermissionState.signOutActivated}
                  setIsLogout={handleLogout}
                />
              </View>
            </>

            <Text className="text-xl font-JakartaBold mt-5 mb-3">
              Recent Rides
            </Text>
          </View>
        )}
      />
      <ReactNativeModal
        isVisible={
          locationPermissionState.signOutActivated === NativeModalState.pending
        }
      >
        <View className="bg-white px-7 py-9 rounded-2xl min-h-[150px] flex justify-center items-center">
          <Text className="text-2xl font-JakartaExtraBold mb-2">Logout</Text>
          <Text className="font-Jakarta mb-5">Do you want to logout.</Text>

          <View className="flex flex-row items-center space-x-2">
            <CustomButton
              title="No"
              onPress={handleRejectLogout}
              className="mt-5 !text-blue-500 !w-[100px]"
              bgVariant="secondary"
            />

            <CustomButton
              title="Yes"
              onPress={handleSignOut}
              disabled={locationPermissionState.BTNDisabled}
              className="mt-5 !w-[100px]"
            />
          </View>
        </View>
      </ReactNativeModal>
    </SafeAreaView>
  );
}
