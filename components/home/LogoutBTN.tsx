import { icons, NativeModalState } from "@/constants";
import React, { useCallback, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ReactNativeModal from "react-native-modal";
import CustomButton from "../CustomButton";
import { useAuth } from "@clerk/clerk-expo";
import { useDriverStore, useLocationStore } from "@/store";
import useNetworkCheck from "@/app/hooks/useNetworkCheck";
import { clearCacheData, handleClearStoredData } from "@/app/lib/utils";
import { router, useFocusEffect } from "expo-router";

const LogoutBTN = () => {
  //   const [showNow, setShowNow] = useState(false);
  const [signOutState, setSignOutState] = useState({
    signOutActivated: false,
    signOutDone: NativeModalState.default,
    BTNDisabled: false,
  });
  const { state } = useNetworkCheck();
  const { signOut } = useAuth();
  const { setDrivers, clearSelectedDriver } = useDriverStore();
  const { setDestinationLocation, setShowMap, showMap } = useLocationStore();

  const handleRejectLogout = () => {
    // setShowNow(false);
    setSignOutState((prev: any) => ({
      ...prev,
      signOutActivated: false,
    }));
  };

  const handleLogoutModal = () => {
    /* setLocationPermissionState((prev: any) => ({
      ...prev,
      signOutActivated: NativeModalState.pending,
      signOutDone: NativeModalState.success,
    })); */
    // setShowNow(false);
    setSignOutState((prev: any) => ({
      ...prev,
      signOutActivated: true,
      signOutDone: NativeModalState.success,
    }));
  };

  const resetUserMapData = () => {
    setDrivers([]);
    clearSelectedDriver();
    setDestinationLocation({
      latitude: null!,
      longitude: null!,
      address: null!,
    });
    // setIsLogout!(NativeModalState.success);
  };
  const handleSignOut = async () => {
    try {
      setSignOutState((prev: any) => ({
        ...prev,
        BTNDisabled: true,
      }));
      // setShowMap(false);
      setShowMap({ mapCOMP: false });
      //   setCOMPState({ ...COMPState, BTNDisabled: true, loadingState: true });
      setTimeout(async () => {
        if (state.isConnected) {
          const data = await handleClearStoredData();
          data && (await clearCacheData(data));
          resetUserMapData();
          await signOut();
        }
        router.replace("/(auth)/sign-in");
      }, 1000);
    } catch (error: any) {
      setSignOutState((prev: any) => ({
        ...prev,
        BTNDisabled: false,
      }));
      console.error("Failed to log out:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        setTimeout(async () => {
          if (
            signOutState.signOutDone === NativeModalState.success &&
            state.isConnected
          ) {
            const data = await handleClearStoredData();
            if (data) await clearCacheData(data);
            setSignOutState((prev: any) => ({
              ...prev,
              //   location: null,
              BTNDisabled: false,
              signOutDone: NativeModalState.default,
            }));
          }
        }, 1000);
      };
    }, [])
  );

  return (
    <>
      <TouchableOpacity
        disabled={signOutState.BTNDisabled}
        onPress={handleLogoutModal}
        className="justify-center items-center w-10 h-10 rounded-full bg-white"
      >
        <Image source={icons.out} className="w-4 h-4" />
      </TouchableOpacity>
      <ReactNativeModal
        isVisible={
          // locationPermissionState.signOutActivated === NativeModalState.pending
          //   showNow
          signOutState.signOutActivated
        }
        onModalHide={() => {}}
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
              disabled={signOutState.BTNDisabled}
            />

            <CustomButton
              title={`${signOutState.BTNDisabled ? "please wait" : "Yes"} `}
              onPress={handleSignOut}
              disabled={signOutState.BTNDisabled}
              className="mt-5 !w-[100px]"
            />
          </View>
        </View>
      </ReactNativeModal>
    </>
  );
};

export default LogoutBTN;
