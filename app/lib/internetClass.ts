import NetInfo from "@react-native-community/netinfo";

// Custom error for no internet connection

export class NoInternetError extends Error {
  constructor() {
    super("No internet connection available");
    this.name = "NoInternetError";
  }
}

// Check if there's an active internet connection
export const checkInternetConnection = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected === true && netInfo.isInternetReachable === true;
};
