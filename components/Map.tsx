import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, Platform } from "react-native";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
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

const Map = () => {
  const {
    data: drivers,
    loading,
    error,
  } = useFetch<Driver[]>(`${process.env.EXPO_PUBLIC_LIVE_API}/driver`);
  const { selectedDriver, setDrivers } = useDriverStore();
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  useEffect(() => {
    // TODO remove this later
    // setDrivers(drivers as MarkerData[]);
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) {
        console.log("User location is missing or undefined.");
        return;
      }

      const newMarkers = generateMarkersFromData({
        data: drivers!,
        userLatitude,
        userLongitude,
      });
      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (markers.length > 0 && destinationLatitude && destinationLongitude) {
      calculateDriverTimes({
        markers,
        userLongitude,
        userLatitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLatitude]);

  if (loading || !userLatitude || !userLongitude)
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error) {
    console.error("API Error:", error);
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error loading map data. Please try again later.</Text>
      </View>
    );
  }

  const region = calculateRegion({
    userLatitude: userLatitude || 37.78825, // fallback latitude
    userLongitude: userLongitude || -122.4324, // fallback longitude
    destinationLatitude,
    destinationLongitude,
  });

  /* if you want ur recent ride to show dont enable showUserLocation */
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType="standard"
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {markers.map((marker) => (
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
        ></Marker>
      ))}
      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            image={icons.pin}
          />

          <MapViewDirections
            origin={{
              latitude: userLatitude!,
              longitude: userLongitude,
            }}
            destination={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY!}
            strokeColor="#0286ff"
            strokeWidth={2}
          />
        </>
      )}
    </MapView>
  );
};

export default Map;
