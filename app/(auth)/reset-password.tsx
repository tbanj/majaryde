import { useSignIn } from "@clerk/clerk-expo";
import React, { Dispatch, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import CustomButton from "@/components/CustomButton";
import ReactNativeModal from "react-native-modal";
import { Link, router } from "expo-router";
import OAuth from "@/components/OAuth";
import usePasswordResetWithOTP from "../hooks/usePasswordResetWithOTP";

interface InserterIconProp {
  name: string;
  formPass: any | null;
  setFormPass: Dispatch<
    React.SetStateAction<{
      password: any;
      confirmPassword: any;
    }>
  >;
}

const InserterIcon = ({ name, setFormPass, formPass }: InserterIconProp) => {
  const editInput = (name: string) => {
    setFormPass((prev: any) => ({
      ...prev,
      [name]: {
        ...prev[name],
        hidePassword: !prev[name].hidePassword,
      },
    }));
  };
  return (
    <TouchableOpacity
      onPress={() => editInput(name)}
      className="justify-center items-center w-10 h-10 rounded-full"
    >
      {formPass[name].hidePassword ? (
        <Image source={icons.eye_hidden} className={`w-6 h-6 mr-4 `} />
      ) : (
        <Image source={icons.eye_visible} className={`w-6 h-6 mr-4 `} />
      )}
    </TouchableOpacity>
  );
};

const ResetPassword = () => {
  const [form, setForm] = useState({
    email: "",
  });
  const [signInBTN, setSignInBTN] = useState<boolean>(false);
  const [COMPState, setCOMPState] = useState<any>({
    BTNDisabled: false,
    loadingState: false,
  });

  const [formPass, setFormPass] = useState({
    password: { name: "", hidePassword: true },
    confirmPassword: { name: "", hidePassword: true },
  });
  // const { signIn, setActive, isLoaded } = useSignIn();
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });
  const [step, setStep] = useState<string>("1");
  const [firstFactorRef, setFirstFactorRef] = useState<any>(null);

  const {
    startPasswordReset,
    verifyOTPAndResetPassword,
    isLoading,
    error,
    verificationStatus,
  } = usePasswordResetWithOTP();

  const handleStartReset = async () => {
    // const result = await startPasswordReset(form.email);
    // if (result.success) {
    //   setFirstFactorRef(result.firstFactor);
    //   // Show OTP input field
    // }
    setStep("2");
  };

  // step 2
  const handleVerify = () => {
    // show modal to input code and validate code
    setVerification((verification) => ({
      ...verification,
      state: "pending",
    }));
  };

  const handleVerifyAndReset = async () => {
    if (!firstFactorRef) {
      console.error("No first factor reference found");
      return;
    }

    const result = await verifyOTPAndResetPassword(
      firstFactorRef,
      otpCode,
      newPassword
    );

    if (result.success) {
      // Handle successful password reset (e.g., navigate to login)
      console.log("Password reset successful");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {/* {COMPState.loadingState && (
          <View className="absolute top-0 bottom-0 right-0 left-0  z-10 items-center justify-center">
            <ActivityIndicator size="large" color="#000" />
          </View>
        )} */}

        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-10 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Reset Password 👏
          </Text>
        </View>

        <View className="p-5">
          {step === "1" && (
            <View>
              <InputField
                label="Reset Password"
                placeholder="Enter email"
                icon={icons.email}
                value={form.email}
                onChangeText={(value: string) =>
                  setForm({ ...form, email: value })
                }
              />

              <CustomButton
                title="Send Instructions"
                onPress={handleStartReset}
                className="mt-6"
                disabled={signInBTN}
              />
            </View>
          )}

          {step === "2" && (
            <View>
              <InputField
                label="Enter Password"
                placeholder="Enter password"
                icon={icons.lock}
                secureTextEntry={formPass.password.hidePassword}
                value={formPass.password.name}
                onChangeText={(value: string) =>
                  setFormPass({
                    ...formPass,
                    password: { ...formPass.password, name: value },
                  })
                }
                iconRight={
                  <InserterIcon
                    name="password"
                    setFormPass={setFormPass}
                    formPass={formPass}
                  />
                }
              />

              <InputField
                label="Confirm Password"
                placeholder="Enter password"
                icon={icons.lock}
                secureTextEntry={formPass.password.hidePassword}
                value={formPass.password.name}
                onChangeText={(value: string) =>
                  setFormPass({
                    ...formPass,
                    confirmPassword: {
                      ...formPass.confirmPassword,
                      name: value,
                    },
                  })
                }
                iconRight={
                  <InserterIcon
                    name="confirmPassword"
                    setFormPass={setFormPass}
                    formPass={formPass}
                  />
                }
              />

              <CustomButton
                title="Proceed"
                onPress={handleVerify}
                className="mt-6"
                disabled={signInBTN}
              />
            </View>
          )}
          <View className="flex flex-row justify-center mt-6 gap-x-3">
            <View className="flex flex-row">
              <TouchableOpacity
                onPress={() =>
                  step === "1" ? router.push("/(auth)/sign-in") : setStep("1")
                }
                className=" flex flex-row"
              >
                <Image source={icons.lessThan} className={`w-8 h-8 `} />
                <Text className="text-lg">Back</Text>
              </TouchableOpacity>
            </View>
            <View className=" h-[25px] w-[3px] bg-general-100" />
            <Link
              className="text-lg text-center text-general-200 "
              href={"/sign-up"}
            >
              <Text className="text-primary-500">Sign Up</Text>
            </Link>
            <View className=" h-[25px] w-[3px] bg-general-100" />
            <Link
              className="text-lg text-center text-general-200"
              href={"/sign-in"}
            >
              <Text className="text-primary-500">Log In</Text>
            </Link>
          </View>
        </View>

        {/* Verification model */}
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          // onModalHide={() => {}}
          /* () =>
            setVerification({ ...verification, state: "success" }) */
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="text-2xl font-JakartaExtraBold mb-2">
              Verification
            </Text>
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}
            </Text>

            <InputField
              label="Code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />

            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}

            <CustomButton
              title={`${COMPState.BTNDisabled ? "Please wait..." : "Verify OTP"} `}
              disabled={COMPState.BTNDisabled}
              onPress={handleVerifyAndReset}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>
      </View>
    </SafeAreaView>
  );
};

export default ResetPassword;
