import GoogleButton from "@/components/GoogleButton";
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
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { fetchAPI, validateEmail } from "@/lib/app.constant";
import { useForms, useToggle, useShowToast } from "@/lib/hooks";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const register = () => {
  const initialState = {
    fullName: "",
    email: "",
    password: "",
  };
  const validationRules = {
    fullName: (value: string) => ({
      isValid: value.length >= 3,
      message: "Nama Lengkap minimal 3 karakter",
    }),
    email: validateEmail,
    password: (value: string) => ({
      isValid: value.length >= 8,
      message: "Password minimal 8 karakter",
    }),
  };
  const showToast = useShowToast();
  const [isLoading, setIsLoading] = useState(false);
  const { formData, formDataErrors, handleInputChange } =
    useForms(initialState, validationRules);
  const { state: showPassword, handleState: setShowPassword } =
    useToggle(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    const result = await fetchAPI(
      `${process.env.EXPO_PUBLIC_API_URL}/api/register`,
      "POST",
      formData
    );

    if (result.status === "success") {
      try {
        showToast("Pendaftaran Berhasil");
        router.push({
          pathname: "/validate-email",
          params: { email: result.data.email },
        });
      } catch (error) {
        console.error("Error saving User Data", error);
        showToast("Terjadi kesalahan saat menyimpan data");
      }
    } else {
      showToast(result.message || "Terjadi kesalahan");
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView className="bg-accent flex-1 px-10">
      <Box className="flex justify-center items-center mt-20 gap-3 flex-col">
        <Text className="font-montserratalternates-medium text-5xl text-white">
          Mulai Belajar
        </Text>
        <Text className="font-montserratalternates-light text-white">
          dengan membuat akun baru
        </Text>
      </Box>
      <Box className="gap-8 mt-10">
        <Box className="rounded-3xl bg-white text-sm px-3 py-2">
          <FormControl isInvalid={formDataErrors.fullName.message}>
            <FormControlLabel className="-mb-2 mt-1">
              <FormControlLabelText className="font-montserrat">
                {"  "}Nama Lengkap
              </FormControlLabelText>
            </FormControlLabel>
            <Input variant="noBorder" size="md">
              <InputField
                placeholder="Masukkan Nama Lengkap Anda..."
                className="text-black font-montserratalternates-semibold"
                value={formData.fullName}
                onChangeText={handleInputChange("fullName")}
              />
            </Input>
            <FormControlError>
              <FormControlErrorText className="text-sm font-montserrat-semibold">
                {"   "}
                {formDataErrors.fullName.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </Box>
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
              />
              <InputSlot onPress={setShowPassword}>
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
          className="rounded-3xl h-16 bg-primary py-3 shadow-lg shadow-black"
          onPress={handleSubmit}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ButtonText className="text-white text-lg font-montserrat-semibold">
              Masuk
            </ButtonText>
          )}
        </Button>
        <Text className="text-center color-white font-montserrat">
          Sudah Punya Akun ?{" "}
          <Link href="/sign-in" className="font-montserrat-bold underline">
            Login Sekarang
          </Link>
        </Text>
      </Box>
      <Box className="flex justify-center items-center mt-10 flex-row gap-3">
        <Divider orientation="horizontal" className="w-36" />
        <Text className="text-center color-white font-montserrat">Atau</Text>
        <Divider orientation="horizontal" className="w-36" />
      </Box>
      <Box className="mt-10">
        <GoogleButton disabled={isLoading} />
      </Box>
      <Box className="flex justify-center items-center mt-10">
        <Text className="text-center font-montserrat text-sm text-white leading-6">
          Dengan melanjutkan saya setuju dengan Kebijakan Privasi dan Syarat &
          Ketentuan
        </Text>
      </Box>
    </SafeAreaView>
  );
};

export default register;
