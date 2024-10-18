import { useState } from "react";
import { useClerk } from "@clerk/clerk-expo";

const usePasswordResetWithOTP = () => {
  const { client } = useClerk();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("idle"); // idle, sent, verified

  // Step 1: Start the password reset process by sending OTP
  const startPasswordReset = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create a password reset
      const firstFactor = await client.signIn.create({
        identifier: email,
        strategy: "reset_password_email_code",
      });

      // Prepare the first factor verification
      const { emailAddressId } = firstFactor.supportedFirstFactors!.find(
        (factor) => factor.strategy === "reset_password_email_code"
      ) as any;

      // Request the verification code (OTP)
      await firstFactor.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId,
      });

      setVerificationStatus("sent");
      setIsLoading(false);

      return {
        success: true,
        firstFactor, // We'll need this for verification
      };
    } catch (err: any) {
      setError(err.message || "Failed to start password reset");
      setIsLoading(false);
      return {
        success: false,
        error: err.message || "Failed to start password reset",
      };
    }
  };

  // Step 2: Verify the OTP code and update password
  const verifyOTPAndResetPassword = async (
    firstFactor: any,
    code: string,
    newPassword: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Attempt to verify the code
      await firstFactor.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });

      // If verification successful, reset the password
      await firstFactor.resetPassword({
        password: newPassword,
      });

      setVerificationStatus("verified");
      setIsLoading(false);

      return {
        success: true,
        message: "Password reset successful",
      };
    } catch (err: any) {
      setError(err.message || "Failed to verify code or reset password");
      setIsLoading(false);
      return {
        success: false,
        error: err.message || "Failed to verify code or reset password",
      };
    }
  };

  return {
    startPasswordReset,
    verifyOTPAndResetPassword,
    isLoading,
    error,
    verificationStatus,
  };
};

// Usage Example Component
const PasswordResetScreen = () => {
  return (
    // Your UI components here
    null
  );
};

export default usePasswordResetWithOTP;
