import { useUser } from "@clerk/clerk-expo";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InputField from "@/components/InputField";
import { formData, icons } from "@/constants";
import { Dispatch, useCallback, useEffect, useState } from "react";
import CustomButton from "@/components/CustomButton";
import { fetchAPI, useFetch } from "@/app/lib/fetch";
import { useNavigation } from "expo-router";
import useNetworkCheck from "@/app/hooks/useNetworkCheck";
import ISConnectedCard from "@/components/ISConnectedCard";
import ShowCatchError from "@/components/ShowCatchError";

interface FormErrors {
  lastName?: {
    text: string;
    showError: boolean;
  };
  firstName?: {
    text: string;
    showError: boolean;
  };
  email?: {
    text: string;
    showError: boolean;
  };
  phoneNumber?: {
    text: string;
    showError: boolean;
  };
}

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
  const { state } = useNetworkCheck();
  const { user } = useUser();

  const {
    data: userData,
    loading: userDataLoading,
    isOfflineData,
  } = useFetch<any[]>({
    cacheKey: `aceeryde_users_${user?.id}`,
    cacheExpiry: 12 * 60 * 60 * 1000, // 12 hours
    endpoint: `${process.env.EXPO_PUBLIC_LIVE_API}/user/${user?.id}`,
  });

  const [profileFormState, setProfileFormState] = useState<any>(() => ({
    firstName: { name: user?.firstName || "", editable: false },
    lastName: { name: user?.lastName || "", editable: false },
    email: {
      name: user?.primaryEmailAddress?.emailAddress || "",
      editable: false,
      verified: true,
    },
    phoneNumber: {
      name: userData?.[0]?.primary_phone_number || "",
      editable: false,
      keyboard: false,
    },
    emailStatus: {
      state: false,
      editable: false,
      name: "Verified",
    },
  }));
  const [COMPState, setCOMPState] = useState<any>({
    BTNDisabled: false,
    loadingState: false,
  });
  const [errors, setErrors] = useState<any>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const navigation = useNavigation();
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
      };
    }, [])
  ); */

  /* useEffect(() => {
    if (state.isConnected && user) {
      setProfileFormState((prev: any) => ({
        ...prev,
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
      }));
    }

    return () => {};
  }, []); */

  // Update form when offline data is loaded
  useEffect(() => {
    if (userData?.[0]) {
      setProfileFormState((prev: any) => ({
        ...prev,
        phoneNumber: {
          ...prev.phoneNumber,
          name: userData[0].primary_phone_number,
        },
      }));
    }
  }, [userData]);
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

  const validateForm = () => {
    let errors: FormErrors = {};
    let showError = true;

    // Validate password field

    if (
      profileFormState.firstName.name.length === 0 ||
      !profileFormState.firstName.name
    ) {
      errors.firstName = {
        text: "First name is required.",
        showError: false,
      };
    } else if (
      profileFormState.firstName.name.length > 0 &&
      profileFormState.firstName.name.length < 3
    ) {
      errors.firstName = {
        text: "First name is required.",
        showError,
      };
    } else if (
      profileFormState.firstName.name.length > 0 &&
      profileFormState.firstName.name.length > 32
    ) {
      errors.firstName = {
        text: "First name length not accepted.",
        showError,
      };
    }

    if (
      !profileFormState.lastName.name ||
      profileFormState.lastName.name.length === 0
    ) {
      errors.lastName = { text: "Last name is required.", showError: false };
    } else if (profileFormState.lastName.name.length < 3) {
      errors.lastName = {
        text: "Last name must be at least 3 characters.",
        showError,
      };
    } else if (
      profileFormState.lastName.name.length > 0 &&
      profileFormState.lastName.name.length > 32
    ) {
      errors.lastName = {
        text: "Last name length not accepted.",
        showError,
      };
    }
    // Validate email field
    if (
      profileFormState.email.name.length === 0 ||
      !profileFormState.email.name
    ) {
      errors.email = {
        text: "Email is required.",
        showError: false,
      };
    } else if (
      profileFormState.email.name.length > 0 &&
      !/\S+@\S+\.\S+/.test(profileFormState.email.name)
    ) {
      errors.email = {
        text: "Email is invalid.",
        showError,
      };
    }

    if (
      !profileFormState.phoneNumber.name ||
      profileFormState.phoneNumber.name.length === 0
    ) {
      errors.phoneNumber = {
        text: "Phone number is required.",
        showError: false,
      };
    } else if (
      profileFormState.phoneNumber.name.length > 0 &&
      profileFormState?.phoneNumber?.name.length < 11
    ) {
      errors.phoneNumber = {
        text: "Phone number must be 11 characters.",
        showError,
      };
    } else if (
      profileFormState.phoneNumber.name.length > 0 &&
      profileFormState?.phoneNumber?.name.length > 11
    ) {
      errors.phoneNumber = {
        text: "Phone number must be 11 characters.",
        showError,
      };
    }

    // Set the errors and update form validity
    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  useEffect(() => {
    // Trigger form validation when name,
    // email, or password changes
    if (state.isConnected) validateForm();
  }, [
    profileFormState.email,
    profileFormState.firstName.name,
    profileFormState.lastName.name,
    profileFormState.phoneNumber.name,
  ]);

  useEffect(() => {
    if (COMPState.showCatchError)
      setTimeout(() => {
        setCOMPState({ ...COMPState, showCatchError: false });
      }, 3000);

    return () => {};
  }, [COMPState.showCatchError]);

  const updateUserDetails = async () => {
    if (!isFormValid || isOfflineData) {
      // Email Form is invalid, display error messages
      Alert.alert("Info", "Form has errors. Please correct them.");
      setIsFormValid(true);
      return;
    }
    try {
      if (isFormValid) {
        setCOMPState({ ...COMPState, loadingState: true });
        const { firstName, lastName, phoneNumber, email } = profileFormState;

        await user?.update({
          firstName: firstName?.name,
          lastName: lastName?.name,
        });

        if (
          profileFormState.phoneNumber.name !==
          userData?.[0].primary_phone_number
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
        setIsFormValid(false);
      }
    } catch (error) {
      setCOMPState({ ...COMPState, loadingState: false });
      setIsFormValid(true);
      console.error("Failed to update user details:", error);
      Alert.alert(
        "Error",
        "Error updating user details, try with another phone number"
      );
    }
  };

  const handleCOMPState = (data: boolean) => (COMPState: any) => ({
    ...COMPState,
    showCatchError: data,
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-custom-dark">
      {COMPState.showCatchError && (
        <ShowCatchError
          text="Error encounter during api call"
          setCOMPState={handleCOMPState}
          showCatchError={COMPState.showCatchError}
        />
      )}
      {!state.isConnected && <ISConnectedCard />}
      {state.isConnected && userDataLoading && (
        <View className="absolute top-0 bottom-0 right-0 left-0  z-10 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingBottom: profileFormState.phoneNumber.keyboard ? 0 : 100,
          }}
        >
          <View className=" pt-5">
            <Text className="text-2xl font-JakartaBold dark:text-white">
              My profile
            </Text>
          </View>

          <View className="flex items-center justify-center py-5">
            <Image
              source={{
                uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
              }}
              style={{ width: 110, height: 110, borderRadius: 55 }}
              className=" rounded-full border-[3px] border-white shadow-sm shadow-neutral-300"
            />
          </View>
          <View className="flex-1 bg-white dark:bg-custom-dark rounded-lg shadow-sm shadow-neutral-300 p-5 dark:shadow-white">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="flex-1">
                <View className={`space-y-2`}>
                  <InputField
                    label="First name"
                    icon={icons.person}
                    maxLength={formData.nameLen}
                    value={profileFormState.firstName.name}
                    onChangeText={(value: string) =>
                      setProfileFormState({
                        ...profileFormState,
                        firstName: {
                          ...profileFormState.firstName,
                          name: value,
                        },
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
                    errors={errors}
                    name="firstName"
                  />
                  <InputField
                    label="Last name"
                    icon={icons.person}
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
                    errors={errors}
                    name="lastName"
                  />
                  <InputField
                    label="Email"
                    icon={icons.email}
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
                    icon={icons.phoneCall}
                    keyboardType="numeric"
                    maxLength={formData.phoneNumberLen}
                    value={profileFormState?.phoneNumber?.name}
                    onChangeText={(value: string) =>
                      setProfileFormState({
                        ...profileFormState,
                        phoneNumber: {
                          ...profileFormState.phoneNumber,
                          name: value,
                        },
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
                    errors={errors}
                    name="phoneNumber"
                  />
                </View>
                {/* !isFormValid || !!COMPState.loadingState */}
                {/* "Update Profile" */}
                <CustomButton
                  disabled={!isFormValid || userDataLoading || isOfflineData}
                  title={
                    isOfflineData
                      ? "Update Unavailable Offline"
                      : "Update Profile"
                  }
                  className={`mt-6`}
                  onPress={updateUserDetails}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Profile;
