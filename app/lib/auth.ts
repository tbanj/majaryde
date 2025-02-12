import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import { fetchAPI } from "./fetch";
export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => void;
}

export const clearCacheToken = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
  return null;
};

export const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.log(err);
      return;
    }
  },
};

export const googleOAuth = async (startOAuthFlow: any, path: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await startOAuthFlow({
        redirectUrl: Linking.createURL(`${path}`, {
          scheme: "myapp",
        }),
      });

      const { createdSessionId, signUp, setActive, authSessionResult } = res;
      if (createdSessionId) {
        if (setActive) {
          await setActive({ session: createdSessionId });
          if (signUp.createdUserId) {
            await fetchAPI(`${process.env.EXPO_PUBLIC_LIVE_API}/user`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: `${signUp?.firstName ?? "Not Found"} ${signUp?.lastName ?? "Not Found"}`,
                email: signUp.emailAddress,
                clerkId: `${signUp.createdUserId}`,
              }),
            });
          }

          resolve({
            success: true,
            code: "success",
            message: "You have successfully authenticated",
            type: authSessionResult?.type,
          });
        }
      }
      resolve({
        success: false,
        code: "success",
        message: "An error occurred",
        type: authSessionResult?.type,
      });
    } catch (error: any) {
      console.log(error);

      reject({
        success: false,
        code: error.code,
        message: error?.errors[0]?.longMessage || "An error occurred",
        type: "error",
      });
    }
  });
};

export default {};
