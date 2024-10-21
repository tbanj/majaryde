import { useSignUp } from "@clerk/clerk-expo";
import React, { Dispatch, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { Link, router } from "expo-router";
import InputField from "@/components/InputField";
import { formData, icons, images } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { fetchAPI } from "../lib/fetch";
import OAuth from "@/components/OAuth";

interface InserterIconProp {
  name: string;
  form: any | null;
  setForm: Dispatch<
    React.SetStateAction<{
      lastName: any;
      firstName: any;
      password: any;
      email: any;
    }>
  >;
}

const InserterIcon = ({ name, setForm, form }: InserterIconProp) => {
  const editInput = (name: string) => {
    setForm((prev: any) => ({
      ...prev,
      [name]: {
        ...prev[name],
        hidePassword: !prev[name].hidePassword,
      },
    }));
  };
  return (
    <TouchableOpacity
      onPress={() => editInput(name)}
      className="justify-center items-center w-10 h-10 rounded-full"
    >
      {form[name].hidePassword ? (
        <Image source={icons.eye_hidden} className={`w-6 h-6 mr-4 `} />
      ) : (
        <Image source={icons.eye_visible} className={`w-6 h-6 mr-4 `} />
      )}
    </TouchableOpacity>
  );
};

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [form, setForm] = useState({
    /* name: "", */
    firstName: "",
    lastName: "",
    email: "",
    password: { name: "", hidePassword: true },
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });
  const [COMPState, setCOMPState] = useState<any>({
    BTNDisabled: false,
    loadingState: false,
  });
  const [errors, setErrors] = useState<any>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const validateForm = () => {
    let errors: any = {};

    // Validate password field
    if (!form.lastName) {
      errors.lastName = "Last name is required.";
    } else if (form.lastName.length < 2) {
      errors.lastName = "Last name must be at least 3 characters.";
    } else if (form.lastName.length > 32) {
      errors.lastName = "Last name length not accepted.";
    }

    if (!form.firstName) {
      errors.firstName = "First name is required.";
    } else if (form.firstName.length < 2) {
      errors.firstName = "First name must be at least 3 characters.";
    } else if (form.firstName.length > 32) {
      errors.firstName = "First name length not accepted.";
    }

    // Validate email field
    if (!form.email) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid.";
    }

    if (form?.password?.name === null || form?.password?.name === undefined) {
      errors.password = "Password is required.";
    } else if (form.password.name.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    } else if (
      !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[-+_!@#$%^&*.,?]).{6,20}$/.test(
        form.password.name
      )
    )
      errors.password =
        "Password must have uppercase, lowercase & special character";
    else if (form.password.name.length > 20) {
      errors.password = "Password length not accepted.";
    }

    // Set the errors and update form validity
    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  useEffect(() => {
    // Trigger form validation when name,
    // email, or password changes
    validateForm();
  }, [form.email, form.password.name, form.firstName, form.lastName]);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      /* const name = form.name.split(" ");
      if (!name[0] || !name[1] || name[1].length < 2 || name[0].length < 2) {
        Alert.alert("Error", "first name and last name is required");
        return;
      } */

      if (isFormValid) {
        setCOMPState({ ...COMPState, BTNDisabled: true, loadingState: true });
        await signUp.create({
          emailAddress: form.email,
          password: form.password.name,
          firstName: form.firstName,
          lastName: form.lastName,
        });

        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setCOMPState({ ...COMPState, loadingState: false, BTNDisabled: false });
        setVerification({ ...verification, state: "pending" });
      } else {
        // Email Form is invalid, display error messages
        Alert.alert("Info", "Form has errors. Please correct them.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert(
        "Error",
        err?.errors?.[0].longMessage ?? "Error encounter during user creation"
      );
      setCOMPState({ ...COMPState, loadingState: false, BTNDisabled: false });
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      if (verification.code.length > 6 || verification.code.length < 6) {
        Alert.alert("Info", "code not accepted");
        return;
      }
      setCOMPState({ ...COMPState, BTNDisabled: true, loadingState: true });
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        await fetchAPI(`${process.env.EXPO_PUBLIC_LIVE_API}/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `${form.lastName} ${form.firstName}`,
            email: `${form.email}`,
            clerkId: `${completeSignUp.createdUserId}`,
          }),
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setCOMPState({ ...COMPState, BTNDisabled: false, loadingState: false });
        setVerification({ ...verification, state: "success" });
      } else {
        setCOMPState({ ...COMPState, BTNDisabled: false, loadingState: false });
        setVerification({
          ...verification,
          state: "failed",
          error: "Verification failed",
        });

        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setCOMPState({ ...COMPState, BTNDisabled: false, loadingState: false });
      if (err?.errors?.[0].code !== "form_code_incorrect")
        setVerification({
          ...verification,
          state: "failed",
          error:
            err?.errors?.[0].longMessage ??
            "Error encounter during user creation",
        });
      if (err?.errors?.[0].code === "form_code_incorrect") {
        setVerification({
          ...verification,
          error:
            err?.errors?.[0].longMessage ??
            "Error encounter during user creation",
        });
      }
      console.error("catch error onPressVerify", JSON.stringify(err, null, 2));
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {COMPState.loadingState && (
        <View className="absolute top-0 bottom-0 right-0 left-0  z-10 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-10 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Last Name"
            placeholder="Enter last Name"
            maxLength={formData.nameLen}
            icon={icons.person}
            value={form.lastName}
            onChangeText={(value: string) =>
              setForm({ ...form, lastName: value })
            }
          />
          {errors?.lastName && (
            <Text className="text-red-500 text-sm mt-1 px-5">
              {errors?.lastName}
            </Text>
          )}
          <InputField
            label="First Name"
            placeholder="Enter first name"
            maxLength={formData.nameLen}
            icon={icons.person}
            value={form.firstName}
            onChangeText={(value: string) =>
              setForm({ ...form, firstName: value })
            }
          />
          {errors?.firstName && (
            <Text className="text-red-500 text-sm mt-1 px-5">
              {errors?.firstName}
            </Text>
          )}
          <InputField
            label="Email"
            maxLength={formData.nameLen}
            placeholder="Enter email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value: string) => setForm({ ...form, email: value })}
          />
          {errors?.email && (
            <Text className="text-red-500 text-sm mt-1 px-5">
              {errors?.email}
            </Text>
          )}

          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            maxLength={formData.passwordLen}
            secureTextEntry={form.password.hidePassword}
            value={form.password.name}
            onChangeText={(value: string) =>
              setForm((form) => ({
                ...form,
                password: { ...form.password, name: value },
              }))
            }
            iconRight={
              <InserterIcon name="password" setForm={setForm} form={form} />
            }
          />
          {errors?.password && (
            <Text className="text-red-500 text-sm mt-1 px-5">
              {errors?.password}
            </Text>
          )}

          <CustomButton
            title={`${COMPState.BTNDisabled ? "Please wait..." : "Sign Up"} `}
            onPress={onSignUpPress}
            className="mt-6"
            disabled={!isFormValid || COMPState.BTNDisabled}
          />

          <OAuth />
          <Link
            className="text-lg text-center text-general-200 mt-10"
            href={"/sign-in"}
          >
            <Text>Already have an account {""}</Text>
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>

        <ReactNativeModal
          isVisible={verification.state === "pending"}
          // onModalHide={() => {}}
          /* () =>
            setVerification({ ...verification, state: "success" }) */
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="text-2xl font-JakartaExtraBold mb-2">
              Verification
            </Text>
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}
            </Text>

            <InputField
              label="Code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />

            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}

            <CustomButton
              title={`${COMPState.BTNDisabled ? "Please wait..." : "Verify Email"} `}
              disabled={COMPState.BTNDisabled}
              onPress={onPressVerify}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>

        {/* Verification model */}
        <ReactNativeModal isVisible={verification?.state === "success"}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Verified
            </Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              You have successfully verified your account.
            </Text>
            <CustomButton
              title="Book Ride"
              onPress={() => {
                setVerification({
                  ...verification,
                  state: "default",
                  error: "",
                  code: "",
                });
                router.push("/(root)/(tabs)/home");
              }}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
