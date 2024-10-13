import { Alert, Image, Text, View } from "react-native";
import CustomButton from "./CustomButton";
import { icons } from "@/constants";
import { useOAuth } from "@clerk/clerk-expo";
import { useCallback, useState } from "react";
import { googleOAuth } from "@/app/lib/auth";
import { router } from "expo-router";

const OAuth = () => {
  const [BTNDisabled, setBTNDisabled] = useState(false);
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  // const handleGoogleSignIn = useCallback(async () => {
  //   try {
  //     setBTNDisabled(true);
  //     const result = await googleOAuth(startOAuthFlow);
  //     /* result.success === false..when the Google login is cancelled */
  //     if (!result.success) {
  //       setBTNDisabled(false);
  //       return;
  //     } else if (
  //       result.code === "session_exists" ||
  //       result.code === "success"
  //     ) {
  //       Alert.alert("Success", result.message);
  //       setBTNDisabled(false);
  //       router.replace("/(root)/(tabs)/home");
  //     }
  //   } catch (err) {
  //     setBTNDisabled(false);
  //     console.error("OAuth error", err);
  //   }
  // }, []);

  const handleGoogleSignIn = async () => {
    const result = await googleOAuth(startOAuthFlow);

    if (result.code === "session_exists") {
      Alert.alert("Success", "Session exists. Redirecting to home screen.");
      router.replace("/(root)/(tabs)/home");
    }

    Alert.alert(result.success ? "Success" : "Error", result.message);
  };

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>
      <CustomButton
        disabled={BTNDisabled}
        title="Log In with Google"
        className="mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default OAuth;
