import { useLocationStore } from "@/store";
import React, { useMemo } from "react";
import Map from "../Map";
import useNetworkCheck from "@/app/hooks/useNetworkCheck";

const MapComponent = () => {
  const { state } = useNetworkCheck();
  const { showMap } = useLocationStore();
  const mapComponent = useMemo(() => {
    if (showMap) {
      return <Map isLogout="pending" isConnected={state.isConnected} />;
    }
    return null;
  }, [showMap, state.isConnected]);
  return <>{mapComponent}</>;
};

export default MapComponent;
