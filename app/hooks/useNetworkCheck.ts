import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { checkInternetConnection } from "../lib/fetch";

const useNetworkCheck = () => {
  const [state, setState] = useState<{ isConnected: boolean }>({
    isConnected: true,
  });

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkInternetConnection();
      console.log("outside 1, no connection", isConnected);
      if (!isConnected) {
        console.log("inside 1, no connection");
        setState((prev) => ({
          ...prev,
          isConnected: false,
        }));
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      setState((prev) => ({
        ...prev,
        isConnected: Boolean(state.isConnected && state.isInternetReachable),
      }));
    });
    checkConnection();
    return () => unsubscribe();
  }, []);

  return {
    state,
  };
};

export default useNetworkCheck;
