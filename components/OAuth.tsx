import { Alert, Image, Text, View } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import CustomButton from "./CustomButton";
import { icons, NativeModalState } from "@/constants";
import { useAuth, useOAuth, useUser } from "@clerk/clerk-expo";
import { useCallback, useState } from "react";
import { googleOAuth } from "@/app/lib/auth";
import { router, usePathname } from "expo-router";
import React, { Dispatch } from "react";

interface Iresult {
  success: boolean;
  code: string;
  message: string;
  type: string;
}

interface IOAuth {
  isConnected: boolean;
  setLoading: Dispatch<React.SetStateAction<boolean>>;
}

const OAuth = ({ isConnected, setLoading }: IOAuth) => {
  const [BTNDisabled, setBTNDisabled] = useState(false);
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { signOut } = useAuth();
  const { user } = useUser();

  const path = usePathname();
  const handleGoogleSignIn = useCallback(async () => {
    try {
      setBTNDisabled(true);
      const result: Iresult = (await googleOAuth(startOAuthFlow, path)) as any;
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (result.message === NativeModalState.dismiss) {
        return;
      } else if (
        (!result.success && result.code === "success") ||
        result.code === undefined
      ) {
        setBTNDisabled(false);
        await signOut();
        if (!user?.id) {
          router.replace("/(auth)/sign-up");
          return;
        }
        // if (logoutCompleted) router.push("/(auth)/sign-up");

        // Oauth {"code": undefined, "message": "You're currently in single session mode. You can only be signed into one account at a time.", "success": false}
      } else if (
        result.code === "session_exists" ||
        (result.code === "success" && result.success)
      ) {
        // Alert.alert("Success", result.message);
        setBTNDisabled(false);
        router.replace("/(root)/(tabs)/home");
      }
      setLoading(false);
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
