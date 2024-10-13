import { useSignUp } from "@clerk/clerk-expo";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { Link, router } from "expo-router";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { fetchAPI } from "../lib/fetch";
import OAuth from "@/components/OAuth";
// import OAuth from "@/components/OAuth";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });
  const [COMPState, setCOMPState] = useState<any>({
    BTNDisabled: false,
    loadingState: false,
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      const name = form.name.split(" ");
      if (!name[0] || !name[1] || name[1].length < 2 || name[0].length < 2) {
        Alert.alert("Error", "first name and last name is required");
        return;
      }
      if (
        !form.email ||
        !form.password ||
        form.email.length < 5 ||
        form.password.length < 5
      ) {
        Alert.alert("Error", "All fields are required");
        return;
      }
      setCOMPState({ ...COMPState, BTNDisabled: true, loadingState: true });
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
        firstName: form.name.split(" ")[0],
        lastName: form.name.split(" ")[1] || undefined,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCOMPState({ ...COMPState, loadingState: false, BTNDisabled: false });
      setVerification({ ...verification, state: "pending" });
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert(
        "Error",
        err?.errors?.[0].longMessage ?? "Error encounter during user creation"
      );
      setCOMPState({ ...COMPState, loadingState: false, BTNDisabled: false });
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      setCOMPState({ ...COMPState, BTNDisabled: true, loadingState: true });
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status === "complete") {
        await fetchAPI(`${process.env.EXPO_PUBLIC_LIVE_API}/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `${form.name}`,
            email: `${form.email}`,
            clerkId: `${completeSignUp.createdUserId}`,
          }),
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setCOMPState({ ...COMPState, BTNDisabled: false, loadingState: false });
        setVerification({ ...verification, state: "success" });
      } else {
        setCOMPState({ ...COMPState, BTNDisabled: false, loadingState: false });
        setVerification({
          ...verification,
          state: "failed",
          error: "Verification failed",
        });

        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setCOMPState({ ...COMPState, BTNDisabled: false, loadingState: false });
      setVerification({
        ...verification,
        state: "failed",
        error:
          err?.errors?.[0].longMessage ??
          "Error encounter during user creation",
      });

      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {COMPState.loadingState && (
        <View className="absolute top-0 bottom-0 right-0 left-0  z-10 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-10 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value: string) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value: string) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value: string) =>
              setForm({ ...form, password: value })
            }
          />

          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
            disabled={COMPState.BTNDisabled}
          />

          <OAuth />
          <Link
            className="text-lg text-center text-general-200 mt-10"
            href={"/sign-in"}
          >
            <Text>Already have an account {""}</Text>
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>

        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={() =>
            setVerification({ ...verification, state: "success" })
          }
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
              title={`${COMPState.BTNDisabled ? "Please wait..." : "Verify Email"} `}
              disabled={COMPState.BTNDisabled}
              onPress={onPressVerify}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>

        {/* Verification model */}
        <ReactNativeModal isVisible={verification.state === "success"}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Verified
            </Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              You have successfully verified your account.
            </Text>
            <CustomButton
              title="Book Ride"
              onPress={() => {
                setVerification({
                  ...verification,
                  state: "default",
                  error: "",
                  code: "",
                });
                router.push("/(root)/(tabs)/home");
              }}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
