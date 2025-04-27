import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { images } from "@/constants/image";
import { fetchAPI, validateEmail } from "@/lib/app.constant";
import { Link, router } from "expo-router";
import { ActivityIndicator, Image, Platform, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import GoogleButton from "@/components/GoogleButton";
import { useForms, useShowToast, useThrottle, useToggle } from "@/lib/hooks";
import * as SecureStore from "expo-secure-store";
import { useRef, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon";

const SignIn = () => {
  const initialState = {
    email: "",
    password: "",
  };
  const validationRules = {
    email: validateEmail,
    password: (value: string) => ({
      isValid: value.length >= 5,
      message: "Password minimal 5 karakter",
    }),
  };
  const showToast = useShowToast();
  const [isLoading, setIsLoading] = useState(false);
  const passwordInputRef = useRef<React.ComponentRef<typeof InputField>>(null);
  const { formData, formDataErrors, handleInputChange } = useForms(
    initialState,
    validationRules
  );

  const { state: showPassword, handleState: setShowPassword } =
    useToggle(false);

  const handleSubmit = async () => {
    if (
      formDataErrors.email.message ||
      formDataErrors.password.message ||
      formData.email === "" ||
      formData.password === ""
    ) {
      showToast("Silahkan isi semua data dengan benar", "error");
      return;
    }

    setIsLoading(true);

    const result = await fetchAPI(
      `${process.env.EXPO_PUBLIC_API_URL}/api/login`,
      "POST",
      formData
    );

    if (result.status === "success") {
      try {
        await SecureStore.setItemAsync("userInfo", JSON.stringify(result.data));
        router.push("/(root)/(tabs)");
        showToast(result.message);
      } catch (error) {
        console.error("Error saving User Data", error);
        showToast("Terjadi kesalahan saat menyimpan data");
      }
    } else {
      if (result.status === "verify") {
        showToast(result.message);
        router.push({
          pathname: "/validate-email",
          params: { email: result.data.email },
        });
      }
      showToast(result.message, "error");
    }
    setIsLoading(false);
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === "ios" ? 0 : 20}
      keyboardOpeningTime={0}
      keyboardShouldPersistTaps="handled"
    >
      <SafeAreaView className="bg-accent flex-1 px-10">
        <Box className="flex justify-between items-center mt-36 flex-row">
          <Text className="font-caveat-bold w-44 text-[38px] text-white">
            MyCademy
          </Text>
          <Image
            source={images.logonotext}
            className="object-fill size-[200px]"
          />
        </Box>
        <Box className="gap-10 mt-20 flex-col">
          <Box className="rounded-3xl bg-white px-3 py-2">
            <FormControl isInvalid={formDataErrors.email.message}>
              <FormControlLabel className="-mb-2 mt-1">
                <FormControlLabelText className="font-montserrat">
                  {"  "}Email
                </FormControlLabelText>
              </FormControlLabel>
              <Input variant="noBorder" size="md">
                <InputField
                  placeholder="Masukkan Email Anda..."
                  className="text-black text-md font-montserratalternates-semibold"
                  value={formData.email}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    (passwordInputRef.current as TextInput)?.focus()
                  }
                  onChangeText={handleInputChange("email")}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText className="text-sm font-montserrat-semibold">
                  {"   "}
                  {formDataErrors.email.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </Box>
          <Box className="rounded-3xl bg-white px-3 py-2">
            <FormControl isInvalid={formDataErrors.password.message}>
              <FormControlLabel className="-mb-2 mt-1">
                <FormControlLabelText className="font-montserrat">
                  {"  "}Password
                </FormControlLabelText>
              </FormControlLabel>
              <Input variant="noBorder" size="md">
                <InputField
                  placeholder="Masukkan Password Anda..."
                  className="text-black text-md font-montserratalternates-semibold"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={handleInputChange("password")}
                  returnKeyType="done"
                  ref={passwordInputRef}
                  onSubmitEditing={handleSubmit}
                />
                <InputSlot onPress={setShowPassword} className="pr-3">
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
              <FormControlError>
                <FormControlErrorText className="text-sm font-montserrat-semibold">
                  {"   "}
                  {formDataErrors.password.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </Box>
          <Button
            action="primary"
            disabled={isLoading}
            className="rounded-3xl h-16 bg-primary py-3 shadow-lg shadow-black"
            onPress={useThrottle(handleSubmit, 3000)}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ButtonText className="text-white text-lg font-montserrat-semibold">
                Masuk
              </ButtonText>
            )}
          </Button>
          {/* <Text className="text-center color-white font-montserrat">
          Belum Punya Akun ?{" "}
          <Link href="/register" className="font-montserrat-bold underline">
            Daftar Sekarang
          </Link>
        </Text> */}
        </Box>
        {/* <Box className="flex justify-center items-center mt-10 flex-row gap-3">
        <Divider orientation="horizontal" className="w-36" />
        <Text className="text-center color-white font-montserrat">Atau</Text>
        <Divider orientation="horizontal" className="w-36" />
      </Box>
      <Box className="mt-10">
        <GoogleButton disabled={isLoading} />
      </Box> */}
        <Box className="flex justify-center items-center mb-[120px] flex-col gap-3">
          <Divider orientation="horizontal" className="w-36 mt-10" />
          <Text className="text-center font-montserrat text-sm text-white leading-6">
            Dengan melanjutkan saya setuju dengan Kebijakan Privasi dan Syarat &
            Ketentuan
          </Text>
        </Box>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

export default SignIn;
