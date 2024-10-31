import { useState, useEffect, useCallback, useRef } from "react";
import useNetworkCheck from "../hooks/useNetworkCheck";
import { useOfflineData } from "../hooks/useOfflineData";
import { checkInternetConnection, NoInternetError } from "./internetClass";

interface ApiConfig {
  cacheKey: string;
  cacheExpiry?: number;
  endpoint: string;
  apiParams?: string;
}

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

export const useFetch = <T>(config: ApiConfig) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const {
    state: { isConnected },
  } = useNetworkCheck();
  const isMounted = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();
  const lastFetchTimeRef = useRef(0);

  const {
    data: offlineData,
    saveData: saveOfflineData,
    isOfflineData,
    clearCacheData,
  } = useOfflineData<T | null>(config.cacheKey, null, {
    expireTime: config.cacheExpiry,
    key: config.cacheKey,
  });

  const fetchData = useCallback(async () => {
    // Prevent fetching if offline or already loading
    if (!isConnected || loading) return;
    // Debounce fetch requests - minimum 1 seconds between calls
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000) {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      fetchTimeoutRef.current = setTimeout(() => {
        lastFetchTimeRef.current = Date.now();
        fetchData();
      }, 1000);
      return;
    }

    lastFetchTimeRef.current = now;
    setLoading(true);

    try {
      const ignoreAPI = config.endpoint.split("/");
      const notRidesRoute = ignoreAPI[ignoreAPI.length - 1];
      if (notRidesRoute === "undefined") {
        const api = ignoreAPI[ignoreAPI.length - 2];
        console.log("inside fetch", notRidesRoute, "table name", api);
        return;
      }
      const response = await fetch(config.endpoint);
      const data = await response.json();
      // Only update state if component is still mounted
      if (isMounted.current) {
        await saveOfflineData(data.data, data);
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err as Error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isConnected, config.endpoint, loading]);

  useEffect(() => {
    // Set up cleanup
    isMounted.current = true;

    // Only fetch if we have no data or we're back online
    if (!offlineData || isConnected) {
      fetchData();
    }

    // Cleanup function
    return () => {
      isMounted.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [isConnected, config.endpoint]);

  return {
    data: offlineData,
    loading,
    error,
    isOfflineData,
    refetch: fetchData,
    clearCacheData,
  };
};
