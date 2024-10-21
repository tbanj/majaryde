import {
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

import { InputFieldProps } from "@/types/type";

const InputField = ({
  label,
  icon,
  iconRight,
  iconOnly,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  textContentType,
  autoComplete,
  importantForAutofill,
  onEndEditing,
  errors,
  name,
  ...props
}: InputFieldProps) => {
  return (
    <View className="my-2 w-full">
      <Text className={`text-lg font-JakartaSemiBold mb-3 ${labelStyle}`}>
        {label}
      </Text>
      <View
        className={`flex flex-row justify-start items-center relative bg-neutral-100 rounded-full border border-neutral-100 focus:border-primary-500  ${containerStyle}`}
      >
        {icon && (
          <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />
        )}
        {iconOnly && iconOnly}
        <TextInput
          className={`rounded-full p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`}
          secureTextEntry={secureTextEntry}
          textContentType={textContentType}
          autoComplete={autoComplete}
          importantForAutofill={importantForAutofill}
          onEndEditing={onEndEditing}
          {...props}
        />
        {iconRight && iconRight}
      </View>
      {name && errors && errors[name!] && (
        <Text className={`text-red-500 text-sm px-5 my-1`}>
          {errors[name!]}
        </Text>
      )}
    </View>
  );
};

export default InputField;
