import { useSignIn } from "@clerk/clerk-expo";
import React, { Dispatch, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import InputField from "@/components/InputField";
import { formData, icons, images } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import OAuth from "@/components/OAuth";

interface InserterIconProp {
  name: string;
  form: any | null;
  setForm: Dispatch<
    React.SetStateAction<{
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

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: { name: "", hidePassword: true },
  });
  const [signInBTN, setSignInBTN] = useState<boolean>(false);
  const [COMPState, setCOMPState] = useState<any>({
    BTNDisabled: false,
    loadingState: false,
  });
  const [errors, setErrors] = useState<any>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const { signIn, setActive, isLoaded } = useSignIn();

  const validateForm = () => {
    let errors: any = {};

    // Validate password field
    // Validate email field
    if (!form.email) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid.";
    }

    if (!form.password.name) {
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
  }, [form.email, form.password.name]);

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) {
      return;
    }

    try {
      if (isFormValid) {
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
        // Email Form is invalid, display error messages
        Alert.alert("Info", "Form has errors. Please correct them.");
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        `${err?.errors?.[0].longMessage ?? "invalid email or password"}`
      );
      setIsFormValid(false);
      setSignInBTN(false);
      setCOMPState({ ...COMPState, BTNDisabled: false, loadingState: false });
    }
  }, [isLoaded, form.email, form.password.name]);
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {COMPState.loadingState && (
          <View className="absolute top-0 bottom-0 right-0 left-0  z-10 items-center justify-center">
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-10 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Welcome 👏
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Email"
            placeholder="Enter email"
            maxLength={formData.nameLen}
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
              setForm({ ...form, password: { ...form.password, name: value } })
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
            title={`${COMPState.BTNDisabled ? "Please wait..." : "Sign In"} `}
            onPress={onSignInPress}
            className="mt-6"
            disabled={!isFormValid || signInBTN}
          />
          <Link
            className="text-lg text-center text-general-200 mt-10"
            href={"/reset-password"}
          >
            <Text>Forgot your password? {""}</Text>
          </Link>
          <OAuth />
          <Link
            className="text-lg text-center text-general-200 mt-10"
            href={"/sign-up"}
          >
            <Text>Don't have an account? {""}</Text>
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>

        {/* Verification model */}
      </View>
    </ScrollView>
  );
};

export default SignIn;
