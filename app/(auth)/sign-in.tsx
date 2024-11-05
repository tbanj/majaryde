import { useSignIn } from "@clerk/clerk-expo";
import React, { Dispatch, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  View,
  NativeSyntheticEvent,
  TextInputEndEditingEventData,
  TouchableOpacity,
} from "react-native";
import InputField from "@/components/InputField";
import { formData, icons, images } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import OAuth from "@/components/OAuth";
import useNetworkCheck from "../hooks/useNetworkCheck";
import ISConnectedCard from "@/components/ISConnectedCard";
import ShowCatchError from "@/components/ShowCatchError";

interface FormState {
  email: string;
  password: {
    name: string;
    hidePassword: boolean;
  };
  formVerify: string;
}

interface FormErrors {
  email?: {
    text: string;
    showError: boolean;
  };
  password?: {
    text: string;
    showError: boolean;
  };
}

interface InserterIconProp {
  name: string;
  form: any | null;
  setForm: Dispatch<
    React.SetStateAction<{
      password: any;
      email: any;
      formVerify: string;
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

const SignIn = () => {
  const [form, setForm] = useState<FormState>({
    email: "",
    password: { name: "", hidePassword: true },
    formVerify: "",
  });
  const [signInBTN, setSignInBTN] = useState<boolean>(false);
  const [COMPState, setCOMPState] = useState({
    BTNDisabled: false,
    loadingState: false,
    showCatchError: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const { state } = useNetworkCheck();
  const { signIn, setActive, isLoaded } = useSignIn();

  // Enhanced validation function
  const validateForm = useCallback(() => {
    let newErrors: FormErrors = {};
    let showError = true;

    // Email validation
    if (!form.email.trim() || form.email.length === 0) {
      newErrors.email = { text: "Email is required.", showError: false };
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = {
        ...newErrors.email,
        text: "Email is invalid.",
        showError,
      };
    }

    // Password validation
    const password = form.password.name;
    if (!password || password.length === 0) {
      newErrors.password = { text: "Password is required.", showError: false };
    } else if (password.length < 6) {
      newErrors.password = {
        text: "Password must be at least 6 characters.",
        showError,
      };
    } else if (password.length > 20) {
      newErrors.password = {
        text: "Password length not accepted.",
        showError,
      };
    } else if (
      !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[-+_!@#$%^&*.,?]).{6,20}$/.test(password)
    ) {
      newErrors.password = {
        text: "Password must have uppercase, lowercase & special character",
        showError,
      };
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Handle autofill changes
  useEffect(() => {
    validateForm();
  }, [form.email, form.password.name, validateForm]);

  useEffect(() => {
    if (COMPState.showCatchError)
      setTimeout(() => {
        setCOMPState({ ...COMPState, showCatchError: false });
      }, 3000);

    return () => {};
  }, [COMPState.showCatchError]);

  // Enhanced input change handler
  const handleInputChange = (field: keyof FormState, value: string) => {
    if (field === "email") {
      setForm((prev) => ({ ...prev, email: value }));
    } else if (field === "password") {
      setForm((prev) => ({
        ...prev,
        password: { ...prev.password, name: value },
      }));
    }
  };

  // Handle text input end editing
  const handleEndEditing = (
    e: NativeSyntheticEvent<TextInputEndEditingEventData>
  ) => {
    validateForm();
  };

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      if (isFormValid) {
        if (form.formVerify) {
          console.log("Bot Detected");
          return;
        }
        setCOMPState((prev) => ({
          ...prev,
          BTNDisabled: true,
          loadingState: true,
        }));
        setCOMPState({ ...COMPState, BTNDisabled: true, loadingState: true });
        if (form.password && form.password) setSignInBTN(true);
        const signInAttempt = await signIn.create({
          identifier: form.email,
          password: form.password.name,
        });
        if (signInAttempt.status === "complete") {
          await setActive({ session: signInAttempt.createdSessionId });
          setSignInBTN(false);
          setCOMPState({
            ...COMPState,
            BTNDisabled: false,
            loadingState: false,
          });
          router.replace("/(root)/(tabs)/home");
        } else {
          // See https://clerk.com/docs/custom-flows/error-handling
          // for more info on error handling
          console.error(JSON.stringify(signInAttempt, null, 2));
          setSignInBTN(false);
          setCOMPState({
            ...COMPState,
            BTNDisabled: false,
            loadingState: false,
          });
        }
      } else {
        Alert.alert("Info", "Form One has errors. Please correct them.");
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        `${err?.errors?.[0]?.longMessage ?? "Invalid email or password"}`
      );
      setIsFormValid(false);
      setSignInBTN(false);
      setCOMPState((prev) => ({
        ...prev,
        BTNDisabled: false,
        loadingState: false,
      }));
    }
  }, [isLoaded, isFormValid, errors]);

  const handleCOMPState = (data: boolean) => (COMPState: any) => ({
    ...COMPState,
    showCatchError: data,
  });
  return (
    <ScrollView className="flex-1 bg-white dark:bg-custom-dark">
      {COMPState.showCatchError && (
        <ShowCatchError
          text="Error encounter during api call"
          setCOMPState={handleCOMPState}
          showCatchError={COMPState.showCatchError}
        />
      )}
      {!state.isConnected && <ISConnectedCard customClass="!z-10 !h-8" />}
      {COMPState.loadingState && (
        <View className="absolute top-0 bottom-0 right-0 left-0 z-10 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
      <View className="flex-1 bg-white dark:bg-custom-dark">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-10 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Sign In
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Email"
            textContentType="username"
            autoComplete="email"
            importantForAutofill="yes"
            onEndEditing={handleEndEditing}
            placeholder="Enter email"
            maxLength={formData.nameLen}
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => handleInputChange("email", value)}
            errors={errors}
            name="email"
          />

          <InputField
            label="Password"
            textContentType="password"
            autoComplete="password"
            importantForAutofill="yes"
            onEndEditing={handleEndEditing}
            placeholder="Enter password"
            icon={icons.lock}
            maxLength={formData.passwordLen}
            secureTextEntry={form.password.hidePassword}
            value={form.password.name}
            onChangeText={(value) => handleInputChange("password", value)}
            iconRight={
              <InserterIcon name="password" setForm={setForm} form={form} />
            }
            errors={errors}
            name="password"
          />

          <View className="hidden">
            <InputField
              id="formVerify"
              label="Form Verify"
              textContentType="none"
              autoComplete="off"
              importantForAutofill="no"
              maxLength={formData.passwordLen}
              value={form.formVerify}
              onChangeText={(value) => handleInputChange("formVerify", value)}
            />
          </View>

          <CustomButton
            title={`${COMPState.BTNDisabled ? "Please wait..." : state.isConnected && !COMPState.BTNDisabled ? "Sign In" : !state.isConnected && "Sign In Unavailable"} `}
            onPress={onSignInPress}
            className="mt-6"
            disabled={state.isConnected && (!isFormValid || signInBTN)}
          />
          <Link
            className="text-lg text-center text-general-200 dark:text-white mt-10"
            href={"/reset-password"}
          >
            <Text>Forgot your password? {""}</Text>
          </Link>
          <OAuth isConnected={state.isConnected} />
          <Link
            className="text-lg text-center text-general-200 dark:text-white mt-10"
            href={"/sign-up"}
          >
            <Text>Don't have an account? {""}</Text>
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
