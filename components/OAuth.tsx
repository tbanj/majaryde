import { Alert, Image, Text, View } from "react-native";
import CustomButton from "./CustomButton";
import { icons, NativeModalState } from "@/constants";
import { useAuth, useOAuth } from "@clerk/clerk-expo";
import { useCallback, useState } from "react";
import { googleOAuth } from "@/app/lib/auth";
import { router } from "expo-router";

const OAuth = ({ isConnected }: { isConnected: boolean }) => {
  const [BTNDisabled, setBTNDisabled] = useState(false);
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { signOut } = useAuth();
  const handleGoogleSignIn = useCallback(async () => {
    try {
      setBTNDisabled(true);
      const result = await googleOAuth(startOAuthFlow);
      if (result.message === NativeModalState.dismiss) {
        return;
      } else if (
        (!result.success && result.code === "success") ||
        result.code === undefined
      ) {
        setBTNDisabled(false);
        await signOut();
        router.push("/(auth)/sign-up");
        // return;
        // Oauth {"code": undefined, "message": "You're currently in single session mode. You can only be signed into one account at a time.", "success": false}
      } else if (
        result.code === "session_exists" ||
        result.code === "success"
      ) {
        // Alert.alert("Success", result.message);
        setBTNDisabled(false);
        router.replace("/(root)/(tabs)/home");
      }
    } catch (err) {
      setBTNDisabled(false);
      console.error("OAuth error", err);
    }
  }, []);

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>
      <CustomButton
        disabled={!isConnected && BTNDisabled}
        title={`${isConnected ? "Log In with Google" : "Log In Unavailable"} `}
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
