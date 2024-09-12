import { LocationStore } from "@/types/type";
import { create } from "zustand";

const useLocationStore = create<LocationStore>((set) => ({
  userAddress: null,
  userLongitude: null,
  destinationAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  userLatitude: null,
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));
  },
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));
  },
}));