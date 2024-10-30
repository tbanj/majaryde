import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useNetworkCheck from "./useNetworkCheck";

interface CacheConfig {
  expireTime?: number; // Time in milliseconds
  key: string;
}

export const useOfflineData = <T>(
  key: string,
  defaultValue: T,
  config?: CacheConfig
) => {
  const [data, setData] = useState<T>(defaultValue);
  const [completeData, setCompleteData] = useState<T>(defaultValue);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const {
    state: { isConnected },
  } = useNetworkCheck();

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedDataString = await AsyncStorage.getItem(key);
        const timestampString = await AsyncStorage.getItem(`${key}_timestamp`);

        // `${key}_full_data`,`${key}_full_data_timestamp`
        const savedCompleteDataString = await AsyncStorage.getItem(
          `${key}_full_data`
        );
        const timestampCompleteString = await AsyncStorage.getItem(
          `${key}_full_data_timestamp`
        );

        if (savedDataString) {
          const savedData = JSON.parse(savedDataString);
          const timestamp = timestampString ? parseInt(timestampString) : 0;

          // Check if cache is expired
          if (
            config?.expireTime &&
            Date.now() - timestamp > config.expireTime
          ) {
            // Cache expired, but we're offline - use it anyway
            if (!isConnected) {
              setData(savedData);
              setLastUpdated(timestamp);
            }
          } else {
            setData(savedData);
            setLastUpdated(timestamp);
          }
        }
      } catch (error) {
        console.log("Error loading offline data:", error);
      }
    };
    loadData();
  }, [key, isConnected]);

  //   temporary
  const saveData = async (newData: T, completeNewData: T) => {
    try {
      const timestamp = Date.now();
      await Promise.all([
        AsyncStorage.setItem(key, JSON.stringify(newData)),
        AsyncStorage.setItem(`${key}_timestamp`, timestamp.toString()),
        AsyncStorage.setItem(
          `${key}_full_data`,
          JSON.stringify(completeNewData)
        ),
        AsyncStorage.setItem(
          `${key}_full_data_timestamp`,
          timestamp.toString()
        ),
      ]);
      setData(newData);
      setLastUpdated(timestamp);
    } catch (error) {
      console.log("Error saving offline data:", error);
    }
  };

  const clearCacheData = async (keysRetrived: any) => {
    try {
      await Promise.all(
        keysRetrived.map((keyVal: string) => AsyncStorage.removeItem(keyVal))
      );
      setLastUpdated(0);
    } catch (error) {
      console.log("Error clearing cache:", error);
    }
  };

  const oldClearCache = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(key),
        AsyncStorage.removeItem(`${key}_timestamp`),
        AsyncStorage.removeItem(`${key}_full_data`),
        AsyncStorage.removeItem(`${key}_full_data_timestamp`),
        // _full_data
      ]);
      setData(defaultValue);
      setLastUpdated(0);
    } catch (error) {
      console.log("Error clearing cache:", error);
    }
  };

  return {
    data,
    saveData,
    clearCacheData,
    lastUpdated,
    isOfflineData: !isConnected,
  };
};
