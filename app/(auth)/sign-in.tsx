import { useSignIn } from "@clerk/clerk-expo";
import React, { useCallback, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import OAuth from "@/components/OAuth";
// import OAuth from "@/components/OAuth";

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [signInBTN, setSignInBTN] = useState<boolean>(false);

  const { signIn, setActive, isLoaded } = useSignIn();

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) {
      return;
    }

    try {
      if (form.password && form.password) setSignInBTN(true);
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        setSignInBTN(true);
        router.replace("/(root)/(tabs)/home");
      } else {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        console.error(JSON.stringify(signInAttempt, null, 2));
        setSignInBTN(false);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setSignInBTN(false);
    }
  }, [isLoaded, form.email, form.password]);
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-10 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Welcome 👏
          </Text>
        </View>
        <View className="p-5">
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
            title="Sign In"
            onPress={onSignInPress}
            className="mt-6"
            disabled={signInBTN}
          />

          <OAuth />
          <Link
            className="text-lg text-center text-general-200 mt-10"
            href={"/sign-up"}
          >
            <Text>Don't have an account? {""}</Text>
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>

        {/* Verification model */}
      </View>
    </ScrollView>
  );
};

export default SignIn;
