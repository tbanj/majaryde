import { ReactNode } from "react";
import { Text, View } from "react-native";

const RideLayout = ({ children }: { children: ReactNode }) => {
  return (
    <View>
      <Text>TOP OF THE LAYOUT</Text>
      {children}
      <Text>BOTTOM OF THE LAYOUT</Text>
    </View>
  );
};

export default RideLayout;
