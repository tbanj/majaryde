import { ReactNode } from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const RideLayout = ({ children }: { children: ReactNode }) => {
  return <GestureHandlerRootView>{children}</GestureHandlerRootView>;
};

export default RideLayout;
