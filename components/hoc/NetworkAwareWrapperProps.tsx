/// components/NetworkAwareWrapper.tsx
import React from "react";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@/app/lib/auth";
// import Bugsnag from "@bugsnag/expo";
// import ISConnectedCard from "../ISConnectedCard";

interface NetworkAwareWrapperProps {
  children: React.ReactNode;
  publishableKey: string;
}

const NetworkAwareWrapper: React.FC<NetworkAwareWrapperProps> = ({
  children,
  publishableKey,
}) => {
  //   const { state } = useNetworkCheck();

  /* useEffect(() => {
    if (state.isConnected) {
      Bugsnag.start();
    }
  }, [state.isConnected]); */

  /* if (!state.isConnected) {
    return (
      <View>
        {children}
      </View>
    );
  } */

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>{children}</ClerkLoaded>
    </ClerkProvider>
  );
};

export default NetworkAwareWrapper;
