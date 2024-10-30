import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { checkInternetConnection } from "../lib/internetClass";

const useNetworkCheck = () => {
  const [state, setState] = useState<{ isConnected: boolean }>({
    isConnected: true,
  });

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
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
