import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";
import React, { useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import InputField from "./InputField";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const ref = useRef<GooglePlacesAutocompleteRef>(null);

  const handleClearText = () => {
    ref?.current?.setAddressText("");
  };

  return (
    <View
      className={` flex flex-row items-center justify-center relative z-50
    rounded-xl ${containerStyle} mb-5`}
    >
      <GooglePlacesAutocomplete
        // keyboardShouldPersistTaps={"handled"}
        ref={ref}
        fetchDetails={true}
        placeholder="where you want to go"
        debounce={200}
        styles={{
          textInputContainer: {
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            marginHorizontal: 20,
            position: "relative",
            shadowColor: "#d4d4d4",
          },
          textInput: {
            backgroundColor: textInputBackgroundColor || "white",
            fontSize: 16,
            fontWeight: "600",
            marginTop: 5,
            width: "100%",
            borderRadius: 200,
          },
          listView: {
            backgroundColor: textInputBackgroundColor || "white",
            position: "relative",
            top: 0,
            width: "100%",
            borderRadius: 10,
            shadowColor: "#d4d4d4",
            zIndex: 99,
          },
        }}
        onPress={(data, details = null) =>
          handlePress({
            latitude: details?.geometry.location.lat!,
            longitude: details?.geometry.location.lng!,
            address: data.description,
          })
        }
        query={{
          key: googlePlacesApiKey,
          language: "en",
        }}
        renderLeftButton={() => (
          <View className="justify-center items-center w-6 h-6">
            <Image
              source={icon ? icon : icons.search}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </View>
        )}
        renderRightButton={() => (
          <TouchableOpacity
            onPress={handleClearText}
            className="justify-center items-center w-10 h-10 rounded-full bg-white"
          >
            <Image source={icons.close} className="w-4 h-4" />
          </TouchableOpacity>
        )}
        textInputProps={{
          placeholderTextColor: "gray",
          placeholder: initialLocation ?? "where do you want to go?",
        }}
      />
    </View>
  );
};

export default GoogleTextInput;
