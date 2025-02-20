import { Alert, Image, Text, View } from "react-native";
import { PaymentSheetError, useStripe } from "@stripe/stripe-react-native";
import CustomButton from "./CustomButton";
import { useState } from "react";
import { fetchAPI } from "@/app/lib/fetch";
import { PaymentProps } from "@/types/type";
import { useLocationStore } from "@/store";
import { useAuth } from "@clerk/clerk-expo";
import ReactNativeModal from "react-native-modal";
import { images } from "@/constants";
import { router } from "expo-router";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
    destinationAddress,
  } = useLocationStore();

  const initializePaymentSheet = async () => {
    const data = await initPaymentSheet({
      merchantDisplayName: "MajaRyde Inc.",
      intentConfiguration: {
        mode: {
          amount: parseFloat(amount) * 100,
          currencyCode: "USD",
        },
        confirmHandler: async (paymentMethod, _, intentCreationCallback) => {
          const data = await fetchAPITest(
            `${process.env.EXPO_PUBLIC_LIVE_API_STRIPE}/create`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email,
                amount,
                paymentMethodId: paymentMethod.id,
              }),
            }
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("ttetette", data);
        },
      },
      returnURL: "myapp://book-ride",
    });

    if (data.error) {
      // handle error
      console.log(data.error);
    }
  };

  const fetchAPITest = async (url: string, options?: RequestInit) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("we are here now");
        const response = await fetch(url, options);
        if (!response.ok) {
          new Error(`HTTP error! status: ${response.status}`);
        }
        const data: any = await response.json();
        console.log("fetchAPI", data);
        // return data;
        resolve(data);
      } catch (error) {
        console.error("Fetch error:", error);
        reject({ error });
        throw error;
      }
    });
  };

  const openPaymentSheet = async () => {
    await initializePaymentSheet();
    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code === PaymentSheetError.Canceled) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        Alert.alert(`Error code: ${error.code}`, error.message);
      }
    } else {
      setSuccess(true);
    }
  };

  const initiateTrackRide = () => {
    router.replace("/(root)/track-ride");
  };
  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        // temporary once done uncomment this part back
        onPress={openPaymentSheet}
      />
      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View
          className="flex flex-col items-center justify-center
        bg-white p-7 rounded-2xl"
        >
          <Image source={images.check} className="w-28 h-28 mt-5" />
          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Ride booked!
          </Text>
          <Text className="text-md text-general-200 font-JakartaMedium text-center mt-3">
            Thank you for your booking, Your reservation has been placed. Please
            proceed with your trip!
          </Text>

          <CustomButton
            title="Track Ride"
            className="my-7"
            onPress={initiateTrackRide}
          />

          <CustomButton
            className="shadow-none"
            bgVariant="outline"
            textVariant="primary"
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.replace("/(root)/(tabs)/home");
            }}
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
