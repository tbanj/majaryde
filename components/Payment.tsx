import { Alert } from "react-native";
import { PaymentSheetError, useStripe } from "@stripe/stripe-react-native";
import CustomButton from "./CustomButton";
import { useState } from "react";

const Payment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [success, setSuccess] = useState<boolean>(false);

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      intentConfiguration: {
        mode: {
          amount: 1099,
          currencyCode: "USD",
        },
        // confirmHandler: confirmHandler,
        confirmHandler: () => {},
      },
    });
    if (error) {
      // handle error
    }
  };

  /* const confirmHandler = async (paymentMethod, shouldSavePaymentMethod, intentCreationCallback) => {
    // explained later
  } */

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

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />
    </>
  );
};

export default Payment;
