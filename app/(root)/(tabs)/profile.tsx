import { useUser } from "@clerk/clerk-expo";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InputField from "@/components/InputField";
import { icons } from "@/constants";
import { useState } from "react";

const Profile = () => {
  const { user } = useUser();
  const [profileFormState, setProfileFormState] = useState<any>({
    firstName: { name: user?.firstName || "Not Found", editable: false },
    lastName: { name: user?.lastName || "Not Found", editable: false },
    email: {
      name: user?.primaryEmailAddress?.emailAddress || "Not Found",
      editable: false,
    },
    phoneNumber: user?.primaryPhoneNumber?.phoneNumber || "Not Found",
  });
  const editInput = (name: string) => {
    console.log(name);
    // console.log("updated", updated);
    setProfileFormState((prev: any) => ({
      ...prev,
      firstName: {
        ...profileFormState[name],
        editable: !profileFormState[name].editable,
      },
    }));
  };

  const InserterIcon = (name: string) => (
    <TouchableOpacity
      // disabled={locationPermissionState.BTNDisabled}
      onPress={() => editInput(name)}
      className="justify-center items-center w-10 h-10 rounded-full bg-white"
    >
      <Image source={icons.editInput} className={`w-6 h-6 mr-4`} />
    </TouchableOpacity>
  );

  const EmailStatusButton = (name: string) => (
    <TouchableOpacity
      // disabled={locationPermissionState.BTNDisabled}
      onPress={() => editInput(name)}
      className="justify-center items-center w-10 h-10 rounded-full bg-[#E7F9EF] border-[#0CC25F]"
    >
      <Image source={icons.checkmark} className={`w-6 h-6 mr-4`} />
      <Text>Verified</Text>
    </TouchableOpacity>
  );
  console.log("profile", profileFormState);
  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
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

        <View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3">
          <View className="flex flex-col items-start justify-start w-full">
            <InputField
              label="First name"
              icon={icons.person}
              placeholder={profileFormState.firstName.name}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={profileFormState.firstName.editable}
              iconRight={InserterIcon("firstName")}
            />

            <InputField
              label="Last name"
              placeholder={profileFormState.lastName.name}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={profileFormState.lastName.editable}
              iconRight={InserterIcon("lastName")}
            />

            <InputField
              label="Email"
              placeholder={profileFormState.email.name}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={profileFormState.email.editable}
              iconRight={InserterIcon("email")}
            />

            <InputField
              label="Email status"
              placeholder={profileFormState.emailStatus.name}
              containerStyle="w-full"
              inputStyle="p-3.5"
              iconOnly={EmailStatusButton}
              /* editable={profileFormState.email.editable}
              iconRight={InserterIcon("email")} */
            />

            <InputField
              label="Phone"
              placeholder={profileFormState.phoneNumber.name}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={profileFormState.phoneNumber.editable}
              iconRight={InserterIcon("phoneNumber")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
