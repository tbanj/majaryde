import { useUser } from "@clerk/clerk-expo";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InputField from "@/components/InputField";
import { formData, icons } from "@/constants";
import { Dispatch, useCallback, useEffect, useState } from "react";
import CustomButton from "@/components/CustomButton";
import { fetchAPI, useFetch } from "@/app/lib/fetch";
import { useFocusEffect, useNavigation } from "expo-router";

interface InserterIconProp {
  name: string;
  profileFormState: any | null;
  setProfileFormState: Dispatch<
    React.SetStateAction<{
      lastName: any;
      firstName: any;
      email: any;
      phoneNumber: any;
      emailStatus: any;
    }>
  >;
}
const InserterIcon = ({
  name,
  setProfileFormState,
  profileFormState,
}: InserterIconProp) => {
  const editInput = (name: string) => {
    setProfileFormState((prev: any) => ({
      ...prev,
      [name]: {
        ...prev[name],
        editable: !prev[name].editable,
      },
    }));
  };
  return (
    <TouchableOpacity
      onPress={() => editInput(name)}
      className="justify-center items-center w-10 h-10 rounded-full"
    >
      {profileFormState[name].editable ? (
        <Image source={icons.edited_input_icon} className={`w-6 h-6 mr-4 `} />
      ) : (
        <Image source={icons.editInput} className={`w-6 h-6 mr-4 `} />
      )}
    </TouchableOpacity>
  );
};

const EmailStatusButton = ({ profileFormState }: { profileFormState: any }) => (
  <TouchableOpacity
    disabled={true}
    className="justify-center items-center flex flex-row  px-4 py-2 ml-4 rounded-full bg-[#E7F9EF] border-[#0CC25F]"
  >
    <Image source={icons.checkmark} className={`w-6 h-6 `} />
    <Text>{profileFormState.emailStatus.name}</Text>
  </TouchableOpacity>
);

const Profile = () => {
  const [step, setStep] = useState(1);
  const { user } = useUser();

  const [profileFormState, setProfileFormState] = useState<any>({
    firstName: { name: user?.firstName || "Not Found", editable: false },
    lastName: { name: user?.lastName || "Not Found", editable: false },
    email: {
      name: user?.primaryEmailAddress?.emailAddress || "Not Found",
      editable: false,
      verified: true,
    },
    phoneNumber: {
      name: user?.primaryPhoneNumber?.phoneNumber,
      editable: false,
      keyboard: false,
    },
    emailStatus: {
      state: false,
      editable: false,
      name: "Verified",
    },
  });
  const [COMPState, setCOMPState] = useState<any>({
    BTNDisabled: false,
    loadingState: false,
  });

  const navigation = useNavigation();
  const {
    data: userData,
    loading,
    error,
  } = useFetch<any[]>(`${process.env.EXPO_PUBLIC_LIVE_API}/user/${user?.id}`);

  /* useFocusEffect(
    useCallback(() => {
      const fetchUserPhone = async () => {
        try {
          setCOMPState({...COMPState, loadingState: true});
          const res = await fetchAPI(
            `${process.env.EXPO_PUBLIC_LIVE_API}/user/${user?.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          setProfileFormState((prev: any) => ({
            ...prev,
            phoneNumber: {
              ...prev.phoneNumber,
              name: res.data[0].primary_phone_number,
            },
          }));
          setCOMPState({...COMPState, loadingState: false});
        } catch (error) {
         setCOMPState({...COMPState, loadingState: false});
          console.error(error);
        }
      };
      fetchUserPhone();
      return () => {
        console.log("profile route is now unfocused.");
      };
    }, [])
  ); */

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      navigation.setOptions({
        tabBarStyle: { display: "none" },
      });
      setProfileFormState((prev: any) => ({
        ...prev,
        phoneNumber: {
          ...prev.phoneNumber,
          keyboard: true,
        },
      }));
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      navigation.setOptions({
        tabBarStyle: {
          backgroundColor: "#333333",
          borderRadius: 50,
          paddingBottom: 0,
          overflow: "hidden",
          marginHorizontal: 20,
          marginBottom: 20,
          height: 78,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          position: "absolute",
        },
      });
      setProfileFormState((prev: any) => ({
        ...prev,
        phoneNumber: {
          ...prev.phoneNumber,
          editable: false,
          keyboard: false,
        },
      }));
    });

    // Clean up listeners on unmount
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [navigation]);

  const updateUserDetails = async () => {
    try {
      setCOMPState({ ...COMPState, loadingState: true });
      const { firstName, lastName, phoneNumber, email } = profileFormState;
      if (
        phoneNumber.name.length === 0 ||
        phoneNumber.name.length < 11 ||
        phoneNumber.name.length > 11
      ) {
        Alert.alert("Update Profile", "Valid mobile number is required");
        return;
      }
      if (
        firstName?.name.length === 0 ||
        firstName?.name.length < 3 ||
        lastName?.name.length === 0 ||
        lastName?.name.length < 3 ||
        email?.name.length === 0 ||
        email?.name.length < 3
      ) {
        Alert.alert("Update Profile", "Valid data are required in all fields");
        return;
      }

      await user?.update({
        firstName: firstName?.name,
        lastName: lastName?.name,
      });

      if (
        profileFormState.phoneNumber.name !== userData?.[0].primary_phone_number
      ) {
        const res = await fetchAPI(
          `${process.env.EXPO_PUBLIC_LIVE_API}/user/update`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: `${firstName.name} ${lastName.name}`,
              clerkId: `${user?.id}`,
              email: email.name,
              primary_phone_number: phoneNumber.name,
            }),
          }
        );
        Alert.alert("Success", res?.message ?? "User detail updated");
      }

      setCOMPState({ ...COMPState, loadingState: false });
    } catch (error) {
      setCOMPState({ ...COMPState, loadingState: false });
      console.error("Failed to update user details:", error);
      Alert.alert("Error", "Error updating user details");
    }
  };

  return (
    <SafeAreaView className="flex-1">
      {COMPState.loadingState && (
        <View className="absolute top-0 bottom-0 right-0 left-0  z-10 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
      <ScrollView
        className="px-5 flex-1"
        contentContainerStyle={
          !profileFormState.phoneNumber.keyboard && {
            paddingBottom: 100,
          }
        }
      >
        <Text className="text-2xl font-JakartaBold my-5">My profile</Text>

        <View className="flex items-center justify-center my-5">
          <Image
            source={{
              uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
            }}
            style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
            className=" rounded-full h-[110px] w-[110px] border-[3px] border-white shadow-sm shadow-neutral-300"
          />
        </View>

        <View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-5">
          <View
            className={`flex flex-col items-start justify-start w-full  ${profileFormState.phoneNumber.keyboard ? "mb-12" : ""}`}
          >
            <InputField
              label="First name"
              icon={icons.person}
              maxLength={formData.nameLen}
              value={profileFormState.firstName.name}
              onChangeText={(value: string) =>
                setProfileFormState({
                  ...profileFormState,
                  firstName: { ...profileFormState.firstName, name: value },
                })
              }
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={profileFormState.firstName.editable}
              iconRight={
                <InserterIcon
                  name="firstName"
                  setProfileFormState={setProfileFormState}
                  profileFormState={profileFormState}
                />
              }
            />

            <InputField
              label="Last name"
              value={profileFormState.lastName.name}
              onChangeText={(value: string) =>
                setProfileFormState({
                  ...profileFormState,
                  lastName: { ...profileFormState.lastName, name: value },
                })
              }
              containerStyle="w-full"
              inputStyle="p-3.5"
              maxLength={formData.nameLen}
              editable={profileFormState.lastName.editable}
              iconRight={
                <InserterIcon
                  name="lastName"
                  setProfileFormState={setProfileFormState}
                  profileFormState={profileFormState}
                />
              }
            />

            <InputField
              label="Email"
              value={profileFormState.email.name}
              maxLength={formData.nameLen}
              onChangeText={(value: string) =>
                setProfileFormState({
                  ...profileFormState,
                  email: { ...profileFormState.email, name: value },
                })
              }
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={profileFormState.email.editable}
            />

            <InputField
              label="Email status"
              containerStyle="w-full"
              inputStyle="p-3.5"
              iconOnly={
                <EmailStatusButton profileFormState={profileFormState} />
              }
              editable={profileFormState.emailStatus.editable}
            />

            <InputField
              label="Phone"
              keyboardType="numeric"
              maxLength={formData.phoneNumberLen}
              value={
                profileFormState?.phoneNumber?.name ||
                (Array.isArray(userData) && userData.length > 0
                  ? userData?.[0].primary_phone_number
                  : null)
              }
              onChangeText={(value: string) =>
                setProfileFormState({
                  ...profileFormState,
                  phoneNumber: { ...profileFormState.phoneNumber, name: value },
                })
              }
              containerStyle={`w-full `}
              inputStyle="p-3.5"
              editable={profileFormState.phoneNumber.editable}
              iconRight={
                <InserterIcon
                  name="phoneNumber"
                  setProfileFormState={setProfileFormState}
                  profileFormState={profileFormState}
                />
              }
            />
          </View>
          <CustomButton
            disabled={!!COMPState.loadingState}
            title="Update Profile"
            className={`${profileFormState.phoneNumber.keyboard ? "mt-10" : "mt-5"}`}
            onPress={updateUserDetails}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
