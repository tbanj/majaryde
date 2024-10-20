import { useAuth, useSignIn } from "@clerk/clerk-expo";
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
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "@/components/InputField";
import { formData, icons, images } from "@/constants";
import CustomButton from "@/components/CustomButton";
import ReactNativeModal from "react-native-modal";
import { Link, router } from "expo-router";
import OAuth from "@/components/OAuth";
import usePasswordResetWithOTP from "../hooks/usePasswordResetWithOTP";

interface InserterIconProp {
  name: string;
  formPass: any | null;
  setFormPass: Dispatch<
    React.SetStateAction<{
      password: any;
      confirmPassword: any;
    }>
  >;
}

const InserterIcon = ({ name, setFormPass, formPass }: InserterIconProp) => {
  const editInput = (name: string) => {
    setFormPass((prev: any) => ({
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
      {formPass[name].hidePassword ? (
        <Image source={icons.eye_hidden} className={`w-6 h-6 mr-4 `} />
      ) : (
        <Image source={icons.eye_visible} className={`w-6 h-6 mr-4 `} />
      )}
    </TouchableOpacity>
  );
};

const ResetPassword = () => {
  const [form, setForm] = useState({
    email: "",
  });
  const [COMPState, setCOMPState] = useState<any>({
    BTNDisabled: false,
    loadingState: false,
  });

  const [formPass, setFormPass] = useState({
    password: { name: "", hidePassword: true },
    confirmPassword: { name: "", hidePassword: true },
  });
  // const { signIn, setActive, isLoaded } = useSignIn();
  const [otpCode, setOtpCode] = useState("");
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });
  const [step, setStep] = useState<string>("1");
  const [errors, setErrors] = useState({});
  const [errorsPass, setErrorsPass] = useState({});
  const [errorsOTP, setErrorsOTP] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFormValidPass, setIsFormValidPass] = useState(false);
  const [isFormValidOTP, setIsFormValidOTP] = useState(false);
  const [firstFactorRef, setFirstFactorRef] = useState<any>(null);
  const [verificationCodeFunc, setVerificationCodeFunc] = useState<any>({
    attemptFirstFactor: null,
    resetPassword: null,
  });

  const {
    startPasswordReset,
    verifyOTPAndResetPassword,
    isLoading,
    error,
    verificationStatus,
  } = usePasswordResetWithOTP();

  const { signOut } = useAuth();

  const validateForm = () => {
    let errors: any = {};

    // Validate password field
    // Validate email field
    if (!form.email) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid.";
    }

    // Set the errors and update form validity
    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  useEffect(() => {
    // Trigger form validation when name,
    // email, or password changes
    if (step === "1") validateForm();
  }, [form.email]);

  useEffect(() => {
    // Trigger form validation when name,
    // email, or password changes
    if (step === "2") validateFormPass();
  }, [formPass.password.name, formPass.confirmPassword.name]);

  const validateFormPass = () => {
    let errors: any = {};
    // Validate password field
    if (!formPass.password.name) {
      errors.password = "Password is required.";
    } else if (formPass.password.name.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    } else if (
      !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[-+_!@#$%^&*.,?]).{6,20}$/.test(
        formPass.password.name
      )
    )
      errors.password =
        "Password must have uppercase, lowercase & special character";
    else if (formPass.password.name.length > 20) {
      errors.password = "Password length not accepted.";
    }

    if (!formPass.confirmPassword.name) {
      errors.confirmPassword = "Confirm Password is required.";
    } else if (formPass.confirmPassword.name.length < 6) {
      errors.confirmPassword =
        "Confirm Password must be at least 6 characters.";
    } else if (
      !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[-+_!@#$%^&*.,?]).{6,20}$/.test(
        formPass.confirmPassword.name
      )
    )
      errors.confirmPassword =
        "Confirm Password must have uppercase, lowercase & special character";
    else if (formPass.confirmPassword.name.length > 20) {
      errors.confirmPassword = "Confirm Password length not accepted.";
    }
    // Set the errors and update form validity
    setErrorsPass(errors);
    setIsFormValidPass(Object.keys(errors).length === 0);
  };

  useEffect(() => {
    // Trigger form validation when name,
    // email, or password changes
    if (step === "3") validateFormOTP();
  }, [verification.code]);

  const validateFormOTP = () => {
    let errors: any = {};

    // Validate OTP modal
    if (!verification.code) {
      errors.code = "OTP is required.";
    } else if (verification.code.length < 6 || verification.code.length > 6) {
      errors.code = "OTP must be 6 characters.";
    }

    // Set the errors and update form validity
    setErrorsOTP(errors);
    setIsFormValidOTP(Object.keys(errors).length === 0);
  };

  const handleStartReset = async () => {
    if (isFormValid) {
      setCOMPState((COMPState: any) => ({
        ...COMPState,
        loadingState: true,
        BTNDisabled: true,
      }));
      const result = await startPasswordReset(form.email);
      //
      if (result.error) {
        setCOMPState((COMPState: any) => ({
          ...COMPState,
          loadingState: false,
          BTNDisabled: false,
        }));
        if (result.error === "Failed to start password reset") {
          Alert.alert(
            "Info",
            "You cant change password of account you created through social auth"
          );
          return;
        }
        Alert.alert("Info", `${result.error}`);
        return;
      }
      if (result.success) {
        setCOMPState((COMPState: any) => ({
          ...COMPState,
          loadingState: false,
          BTNDisabled: false,
        }));
        Alert.alert("Success", "OTP has been sent to your email");
        setFirstFactorRef(result.firstFactor);
        const { attemptFirstFactor, resetPassword } = result.firstFactor!;
        setVerificationCodeFunc((prev: any) => ({
          ...prev,
          attemptFirstFactor,
          resetPassword,
        }));
        // Show password change interface
        setIsFormValid(false);
        setErrors({});
        setStep("2");
      }
    } else {
      // Email Form is invalid, display error messages
      console.log("Email Form has errors. Please correct them.");
    }
  };

  const resetAllForms = () => {
    setVerification((verification) => ({
      ...verification,
      code: "",
      error: "",
      state: "default",
    }));

    setFormPass({
      password: { name: "", hidePassword: true },
      confirmPassword: { name: "", hidePassword: true },
    });
  };
  // step 2
  const handleVerify = () => {
    if (isFormValidPass) {
      setCOMPState((COMPState: any) => ({
        ...COMPState,
        loadingState: true,
        BTNDisabled: true,
      }));
      if (
        formPass.confirmPassword.name.trim() !== formPass.password.name.trim()
      ) {
        Alert.alert("Info", "Password need to match");
        return;
      }
      // show modal to input code and validate code
      setIsFormValidPass(false);
      setErrorsPass({});

      setVerification((verification) => ({
        ...verification,
        state: "pending",
      }));
      setStep("3");
      setCOMPState((COMPState: any) => ({
        ...COMPState,
        loadingState: false,
        BTNDisabled: false,
      }));
    } else {
      // Email Form is invalid, display error messages
      console.log("New Password Form has errors. Please correct them.");
    }
  };

  const handleVerifyAndReset = async () => {
    if (isFormValidOTP) {
      setCOMPState((COMPState: any) => ({
        ...COMPState,
        BTNDisabled: true,
        loadingState: true,
      }));
      if (!firstFactorRef) {
        console.error("No first factor reference found");
        Alert.alert("Info", "Unable to validate OTP, try again later");
        return;
      }

      const result = await verifyOTPAndResetPassword(
        verification.code,
        formPass.password.name
      );

      if (result.success) {
        // reset OTP Modal form
        resetAllForms();
        setIsFormValidOTP(false);
        await signOut();
        Alert.alert("Success", `${result?.message}`);
        router.push("/(auth)/sign-in");
      } else if (!result.success) {
        Alert.alert("Error", `${result?.error}`);
        setIsFormValidOTP(false);
      }

      setCOMPState((COMPState: any) => ({
        ...COMPState,
        BTNDisabled: false,
        loadingState: false,
      }));
    } else {
      // Email Form is invalid, display error messages
      // Alert.alert("Error", "OTP Form has errors. Please correct them.");
      console.log("OTP Form has errors. Please correct them.");
    }
  };

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
            Reset Password 👏
          </Text>
        </View>

        <View className="p-5">
          {step === "1" && (
            <View>
              <InputField
                label="Reset Password"
                placeholder="Enter email"
                maxLength={formData.nameLen}
                icon={icons.email}
                value={form.email}
                onChangeText={(value: string) =>
                  setForm({ ...form, email: value })
                }
              />

              {Object.values(errors).map((errorData: any, index: number) => (
                <Text key={index} className="text-red-500 text-sm mt-1 px-5">
                  {errorData}
                </Text>
              ))}
              <CustomButton
                title={`${COMPState.BTNDisabled ? "Please wait..." : "Send Instructions"} `}
                onPress={handleStartReset}
                className={`mt-6 ${isFormValid ? "opacity-100" : "opacity-50"}}`}
                disabled={!isFormValid || COMPState.BTNDisabled}
              />
            </View>
          )}

          {step === "2" && (
            <View>
              <InputField
                label="Enter Password"
                placeholder="Enter password"
                maxLength={formData.passwordLen}
                icon={icons.lock}
                secureTextEntry={formPass.password.hidePassword}
                value={formPass.password.name}
                onChangeText={(value: string) =>
                  setFormPass({
                    ...formPass,
                    password: { ...formPass.password, name: value },
                  })
                }
                iconRight={
                  <InserterIcon
                    name="password"
                    setFormPass={setFormPass}
                    formPass={formPass}
                  />
                }
              />

              <InputField
                label="Confirm Password"
                placeholder="Enter confirm password"
                icon={icons.lock}
                maxLength={formData.passwordLen}
                secureTextEntry={formPass.confirmPassword.hidePassword}
                value={formPass.confirmPassword.name}
                onChangeText={(value: string) =>
                  setFormPass({
                    ...formPass,
                    confirmPassword: {
                      ...formPass.confirmPassword,
                      name: value,
                    },
                  })
                }
                iconRight={
                  <InserterIcon
                    name="confirmPassword"
                    setFormPass={setFormPass}
                    formPass={formPass}
                  />
                }
              />

              {Object.values(errorsPass).map(
                (errorData: any, index: number) => (
                  <Text key={index} className="text-red-500 text-sm mt-1 px-5">
                    {errorData}
                  </Text>
                )
              )}
              <CustomButton
                title={`${COMPState.BTNDisabled ? "Please wait..." : "Proceed"} `}
                onPress={handleVerify}
                className={`mt-6 ${isFormValidPass ? "opacity-100" : "opacity-50"}}`}
                disabled={!isFormValidPass || COMPState.BTNDisabled}
              />
            </View>
          )}
          <View className="flex flex-row justify-center mt-6 gap-x-3">
            <View className="flex flex-row">
              <TouchableOpacity
                onPress={() =>
                  step === "1" ? router.push("/(auth)/sign-in") : setStep("1")
                }
                className=" flex flex-row"
              >
                <Image source={icons.lessThan} className={`w-8 h-8 `} />
                <Text className="text-lg">Back</Text>
              </TouchableOpacity>
            </View>
            <View className=" h-[25px] w-[3px] bg-general-100" />
            <Link
              className="text-lg text-center text-general-200 "
              href={"/sign-up"}
            >
              <Text className="text-primary-500">Sign Up</Text>
            </Link>
            <View className=" h-[25px] w-[3px] bg-general-100" />
            <Link
              className="text-lg text-center text-general-200"
              href={"/sign-in"}
            >
              <Text className="text-primary-500">Log In</Text>
            </Link>
          </View>
        </View>

        {/* Verification model */}
        <ReactNativeModal
          onBackdropPress={() =>
            setVerification((prev: any) => ({ ...prev, state: "default" }))
          }
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
              maxLength={6}
              label="Code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />

            {/* {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )} */}
            {/* Display error messages */}
            {/* color: 'red',
        fontSize: 20,
        marginBottom: 12, */}
            {Object.values(errorsOTP).map((errorData: any, index: number) => (
              <Text key={index} className="text-red-500 text-sm mt-1 px-5">
                {errorData}
              </Text>
            ))}

            <CustomButton
              title={`${COMPState.BTNDisabled ? "Please wait..." : "Verify OTP"} `}
              disabled={!isFormValidOTP || COMPState.BTNDisabled}
              onPress={handleVerifyAndReset}
              className={`mt-5 bg-success-500 ${isFormValidOTP ? "opacity-100" : "opacity-50"}}`}
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default ResetPassword;
