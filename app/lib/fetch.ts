import { useState, useEffect, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";

// Custom error for no internet connection
class NoInternetError extends Error {
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

export const fetchAPI = async (url: string, options?: RequestInit) => {
  // First check internet connectivity
  const isConnected = await checkInternetConnection();

  if (!isConnected) {
    throw new NoInternetError();
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof NoInternetError) {
      console.error("No internet connection");
    } else {
      console.error("Fetch error:", error);
    }
    throw error;
  }
};

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
}

export const useFetch = <T>(url: string, options?: RequestInit) => {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
    isConnected: true,
  });

  // Subscribe to network state changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setState((prev) => ({
        ...prev,
        isConnected: Boolean(state.isConnected && state.isInternetReachable),
      }));
    });

    return () => unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchAPI(url, options);
      setState((prev) => ({
        ...prev,
        data: result.data,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "An error occurred",
        loading: false,
      }));
    }
  }, [url, options]);

  useEffect(() => {
    if (state.isConnected) {
      fetchData();
    }
  }, [fetchData, state.isConnected]);

  return {
    ...state,
    refetch: fetchData,
  };
};
