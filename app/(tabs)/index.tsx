import { Text, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView
      // style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      className="flex-1 items-center justify-center bg-blue"
    >
      <Text>ame</Text>
    </SafeAreaView>
  );
}
