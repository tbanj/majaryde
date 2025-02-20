import React, {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/app/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";
import { icons } from "@/constants";
import { useFetch } from "@/app/lib/fetch";
import MapViewDirections from "react-native-maps-directions";
import { useFocusEffect } from "expo-router";

interface MapProps {
  isLogout?: string;
  isConnected: boolean;
  /* setDebugInfo: Dispatch<
    React.SetStateAction<{
      apiKey: string;
      AndroidApiKey: string;
      region: any;
      markersCount: number;
      hasValidUserLocation: boolean;
      hasValidDestination: boolean;
      permissions: string[] | null;
      directionsError: string | null;
      userLat: number | null;
      userLong: number | null;
      destLat: number | null;
      destLong: number | null;
      error: any;
    }>
  >; */
}

const Map = ({ isLogout, isConnected }: MapProps) => {
  const {
    data: drivers,
    loading,
    error,
    isOfflineData,
  } = useFetch<Driver[]>({
    cacheKey: `aceeryde_drivers`,
    cacheExpiry: 24 * 60 * 60 * 1000,
    endpoint: `${process.env.EXPO_PUBLIC_LIVE_API}/driver`,
  });

  const { selectedDriver, setDrivers } = useDriverStore();
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [directionsError, setDirectionsError] = useState<string | null>(null);

  const {
    userLongitude,
    userLatitude,
    userAddress,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  // Memoize the region calculation
  const region = useMemo(
    () =>
      calculateRegion({
        userLatitude: userLatitude || 37.78825,
        userLongitude: userLongitude || -122.4324,
        destinationLatitude,
        destinationLongitude,
      }),
    [userLatitude, userLongitude, destinationLatitude, destinationLongitude]
  );

  // Memoize the user location check
  const isUserLocationValid = useMemo(
    () => userLatitude !== null && userLongitude !== null,
    [userLatitude, userLongitude]
  );

  // Memoize the destination location check
  const hasDestination = useMemo(
    () => destinationLatitude !== null && destinationLongitude !== null,
    [destinationLatitude, destinationLongitude]
  );

  // Callback for generating markers
  const generateMarkers = useCallback(() => {
    if (Array.isArray(drivers) && isUserLocationValid) {
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude: userLatitude!,
        userLongitude: userLongitude!,
      });
      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude, isUserLocationValid]);

  // Callback for calculating driver times
  const updateDriverTimes = useCallback(async () => {
    if (markers.length > 0 && hasDestination) {
      const updatedDrivers = await calculateDriverTimes({
        markers,
        userLongitude: userLongitude!,
        userLatitude: userLatitude!,
        destinationLatitude: destinationLatitude!,
        destinationLongitude: destinationLongitude!,
      });
      setDrivers(updatedDrivers as MarkerData[]);
    }
  }, [
    markers,
    hasDestination,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  ]);

  // Effect for generating markers
  useEffect(() => {
    generateMarkers();
  }, [generateMarkers]);

  // Separate effect for updating driver times
  useEffect(() => {
    updateDriverTimes();
  }, [updateDriverTimes]);

  // Memoized marker components
  const markerComponents = useMemo(
    () =>
      markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === marker.id ? icons.selectedMarker : icons.marker
          }
        />
      )),
    [markers, selectedDriver]
  );

  // Memoized destination marker and directions
  const destinationComponents = useMemo(
    () =>
      hasDestination ? (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude!,
              longitude: destinationLongitude!,
            }}
            title="Destination"
            image={icons.pin}
          />
          <MapViewDirections
            origin={{
              latitude: userLatitude!,
              longitude: userLongitude!,
            }}
            destination={{
              latitude: destinationLatitude!,
              longitude: destinationLongitude!,
            }}
            apikey={process.env.EXPO_PUBLIC_DEV_ANDROID_MAP_GOOGLE_API_KEY!}
            strokeColor="#0286ff"
            strokeWidth={3}
            onError={(errorMessage) => {
              console.error("MapViewDirections error:");
              setDirectionsError(errorMessage);
            }}
            onReady={(result) => {
              console.log("MapViewDirections ready:");
            }}
            resetOnChange={false}
            mode="DRIVING"
            precision="high"
            timePrecision="now"
          />
        </>
      ) : null,
    [
      hasDestination,
      destinationLatitude,
      destinationLongitude,
      userLatitude,
      userLongitude,
    ]
  );

  /* useFocusEffect(
    useCallback(() => {
      //  for debug
      if (isUserLocationValid || hasDestination) {
        setDebugInfo((prev: any) => ({
          ...prev,
          region,
          hasValidUserLocation: isUserLocationValid,
          userLat: userLatitude,
          userLong: userLongitude,
          markersCount: markers.length,
          hasValidDestination: hasDestination,
          destLat: destinationLatitude,
          destLong: destinationLongitude,
          directionsError,
        }));
      }
    }, [isUserLocationValid, hasDestination])
  ); */

  if (loading || !isUserLocationValid) {
    return (
      <View className="flex flex-1 h-auto  justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  if (error || directionsError) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>
          Error loading map data. Please try again later. {directionsError}
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* {isUserLocationValid && (
        
      )} */}
      <MapView
        // key={`${userLatitude}-${userLongitude}-${destinationLatitude}-${destinationLongitude}`}
        provider={PROVIDER_GOOGLE}
        className="w-full h-full rounded-2xl"
        tintColor="black"
        mapType="standard"
        showsPointsOfInterest={false}
        initialRegion={region}
        /* initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }} */
        showsUserLocation={true}
        userInterfaceStyle="light"
      >
        {markerComponents}
        {destinationComponents}
      </MapView>
    </>
  );
};

export default React.memo(Map);
