// import { Alert, Image, Text, View } from "react-native";
// import { PaymentSheetError, useStripe } from "@stripe/stripe-react-native";
// import CustomButton from "./CustomButton";
// import { useCallback, useState } from "react";
// import { fetchAPI } from "@/app/lib/fetch";
// import { PaymentProps } from "@/types/type";
// import { useLocationStore } from "@/store";
// import { useAuth } from "@clerk/clerk-expo";
// import ReactNativeModal from "react-native-modal";
// import { images } from "@/constants";
// import { router, useFocusEffect } from "expo-router";
// import React from "react";

// const Payment = ({
//   fullName,
//   email,
//   amount,
//   driverId,
//   rideTime,
//   isConnected,
// }: PaymentProps) => {
//   const { initPaymentSheet, presentPaymentSheet } = useStripe();
//   const { userId } = useAuth();
//   const [success, setSuccess] = useState<boolean>(false);
//   const {
//     userAddress,
//     userLongitude,
//     userLatitude,
//     destinationLatitude,
//     destinationLongitude,
//     destinationAddress,
//   } = useLocationStore();

//   const initializePaymentSheet = async () => {
//     const { error } = await initPaymentSheet({
//       merchantDisplayName: "Aceeryde Inc.",
//       intentConfiguration: {
//         mode: {
//           amount: parseFloat(amount) * 100,
//           currencyCode: "USD",
//         },
//         confirmHandler: confirmHandler,
//       },
//       returnURL: "myapp://book-ride",
//     });
//     if (error) {
//       // handle error
//       console.log(error);
//     }
//   };

//   async function confirmHandler(
//     paymentMethod: any,
//     _: boolean,
//     intentCreationCallback: any
//   ) {
//     console.log("step 1 create a payment intent");

//     // { paymentIntent, customer }
//     const data: any = await fetchAPI(
//       // `${process.env.EXPO_PUBLIC_LIVE_API_STRIPE}/create`,
//       "https://majaryde-backend.netlify.app/.netlify/functions/api/stripe/create",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: fullName || email.split("@")[0],
//           email,
//           amount,
//           paymentMethodId: paymentMethod.id,
//         }),
//       }
//     );
//     const datt: any = await data;
//     console.log("stripe create", JSON.stringify(datt, null, 2));

//     // await new Promise((resolve) => setTimeout(resolve, 500));
//     const { paymentIntent, customer } = data;
//     console.log("paymentIntent", JSON.stringify(paymentIntent, null, 2));
//     console.log("customer", JSON.stringify(customer, null, 2));
//     if (paymentIntent.client_secret) {
//       console.log("step 2 make payment");
//       console.log(
//         "step 2 make payment paymentMethod.id",
//         paymentMethod.id,
//         "paymentIntent.id",
//         paymentIntent.id,
//         "customer",
//         customer
//       );
//       const { result } = await fetchAPI(
//         `${process.env.EXPO_PUBLIC_LIVE_API_STRIPE}/pay`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             payment_method_id: paymentMethod.id,
//             payment_intent_id: paymentIntent.id,
//             customer_id: customer,
//           }),
//         }
//       );
//       // await new Promise((resolve) => setTimeout(resolve, 500));
//       if (result.client_secret) {
//         console.log("step 3 create ride");
//         await fetchAPI(`${process.env.EXPO_PUBLIC_LIVE_API}/ride/create`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             origin_address: userAddress,
//             destination_address: destinationAddress,
//             origin_latitude: userLatitude,
//             origin_longitude: userLongitude,
//             destination_latitude: destinationLatitude,
//             destination_longitude: destinationLongitude,
//             ride_time: rideTime.toFixed(0),
//             fare_price: parseInt(amount) * 100,
//             payment_status: "paid",
//             driver_id: driverId,
//             user_id: userId,
//           }),
//         });

//         intentCreationCallback({
//           clientSecret: result.client_secret,
//         });
//       }
//     }
//   }

//   const openPaymentSheet = async () => {
//     // await initializePaymentSheet();
//     /*  await await fetchAPI(
//       "https://majaryde-backend.netlify.app/.netlify/functions/api/stripe/create",
//       {
//         body: '{"name":"Alabi Temitope","email":"engr.temitope@gmail.com","amount":"12.92","paymentMethodId":"pm_1QsIDDIDgz7vUa9s8Ki38fLJ"}',
//         headers: { "Content-Type": "application/json" },
//         method: "POST",
//       }
//     ); */
//     const { error } = await presentPaymentSheet();

//     if (error) {
//       if (error.code === PaymentSheetError.Canceled) {
//         Alert.alert(`Error code: ${error.code}`, error.message);
//       } else {
//         Alert.alert(
//           `Network error, try again later. Error code: ${error.code}`,
//           error.message
//         );
//         return;
//       }
//     } else {
//       setSuccess(true);
//     }
//   };

//   const initiateTrackRide = () => {
//     router.replace("/(root)/track-ride");
//   };

//   useFocusEffect(
//     useCallback(() => {
//       initializePaymentSheet();
//     }, [])
//   );

//   return (
//     <>
//       <CustomButton
//         disabled={!isConnected ? true : false}
//         title={!isConnected ? "Confirm Ride Unavailable" : "Confirm Ride"}
//         className="my-10"
//         // temporary once done uncomment this part back
//         onPress={openPaymentSheet}
//       />
//       <ReactNativeModal
//         isVisible={success}
//         onBackdropPress={() => setSuccess(false)}
//       >
//         <View
//           className="flex flex-col items-center justify-center
//         bg-white dark:bg-custom-dark p-7 rounded-2xl"
//         >
//           <Image source={images.check} className="w-28 h-28 mt-5" />
//           <Text className="text-2xl text-center font-JakartaBold mt-5 dark:text-white">
//             Ride booked!
//           </Text>
//           <Text
//             className="text-md text-general-200 dark:text-gray-200 (condition) {

//           } font-JakartaMedium text-center mt-3"
//           >
//             Thank you for your booking, Your reservation has been placed. Please
//             proceed with your trip!
//           </Text>

//           <CustomButton
//             title="Track Ride"
//             className="my-7"
//             onPress={initiateTrackRide}
//           />

//           <CustomButton
//             className="shadow-none"
//             bgVariant="outline"
//             textVariant="primary"
//             title="Back Home"
//             onPress={() => {
//               setSuccess(false);
//               router.replace("/(root)/(tabs)/home");
//             }}
//           />
//         </View>
//       </ReactNativeModal>
//     </>
//   );
// };

// export default Payment;
