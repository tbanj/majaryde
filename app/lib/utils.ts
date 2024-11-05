import { Ride } from "@/types/type";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const sortRides = (rides: Ride[]): Ride[] => {
  const result = rides.sort((a, b) => {
    const dateA = new Date(`${a.created_at}T${a.ride_time}`);
    const dateB = new Date(`${b.created_at}T${b.ride_time}`);
    return dateB.getTime() - dateA.getTime();
  });

  return result.reverse();
};

export function formatTime(minutes: number): string {
  const formattedMinutes = +minutes?.toFixed(0) || 0;

  if (formattedMinutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(formattedMinutes / 60);
    const remainingMinutes = formattedMinutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day < 10 ? "0" + day : day} ${month} ${year}`;
}

const getAllKeys = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys;
  } catch (error) {
    console.error("Error retrieving keys from AsyncStorage", error);
  }
};

export const handleClearStoredData = async () => {
  const derivedDataKeys = await getAllKeys();
  if (derivedDataKeys && derivedDataKeys.length > 0) {
    const userKeys = derivedDataKeys.filter((asyncKeys: string) =>
      asyncKeys.startsWith("aceeryde_")
    );
    return userKeys;
  }
  return null;
};

export const clearCacheData = async (keysRetrived: any) => {
  try {
    await Promise.all(
      keysRetrived.map((keyVal: string) => AsyncStorage.removeItem(keyVal))
    );
  } catch (error) {
    console.log("Error clearing cache:", error);
  }
};
