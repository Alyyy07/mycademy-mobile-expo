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
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { images } from "@/constants/image";
import { validateEmail } from "@/lib/utility";
import { Link } from "expo-router";
import { useState } from "react";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formDataErrors, setFormDataErrors] = useState({
    email: {
      message: "",
      isInvalid: false,
    },
    password: {
      message: "",
      isInvalid: false,
    },
  });

  const handleState = () => {
    setShowPassword((showState) => !showState);
  };

  const handleSubmit = async () => {
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = formData.password.length >= 8;

    setFormDataErrors({
      email: {
        message: isEmailValid ? "" : "Masukkan Email yang valid",
        isInvalid: !isEmailValid,
      },
      password: {
        message: isPasswordValid ? "" : "Password minimal 8 karakter",
        isInvalid: !isPasswordValid,
      },
    });

    if (!isEmailValid || !isPasswordValid) return;

    console.log("Form data:", formData);
    // Uncomment and update the following lines to enable API call
    // try {
    //   const response = await fetch("https://example.com/api/login", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(formData),
    //   });

    //   const data = await response.json();
    //   if (response.ok) {
    //     // Handle successful login
    //     console.log("Login successful", data);
    //   } else {
    //     // Handle login error
    //     console.error("Login failed", data);
    //   }
    // } catch (error) {
    //   console.error("Error:", error);
    // }
  };

  const handleInputChange =
    (
      name: keyof typeof formData
    ) =>
    (text: string) => {
      setFormData({
        ...formData,
        [name]: text,
      });
      setFormDataErrors({
        ...formDataErrors,
        [name]: {
          message: "",
          isInvalid: false,
        },
      });
    };

  return (
    <SafeAreaView className="bg-accent flex-1 px-10">
      <Box className="flex justify-between items-center mt-20 flex-row">
        <Text className="font-caveat-bold w-44 text-[38px] text-white">
          MyCademy
        </Text>
        <Image
          source={images.logonotext}
          className="object-fill size-[180px]"
        />
      </Box>
      <Box className="gap-8 mt-5">
        <Box className="rounded-3xl bg-white px-3 py-2">
          <FormControl isInvalid={formDataErrors.email.isInvalid}>
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
            {formDataErrors.email.isInvalid && (
              <FormControlError>
                <FormControlErrorText className="text-sm font-montserrat-semibold">
                  {"   "}
                  {formDataErrors.email.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
        </Box>
        <Box className="rounded-3xl bg-white px-3 py-2">
          <FormControl isInvalid={formDataErrors.password.isInvalid}>
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
              <InputSlot onPress={handleState}>
                <Image
                  source={showPassword ? images.eyeIcon : images.eyeSlashIcon}
                  className="size-8 object-fill"
                />
              </InputSlot>
            </Input>
            {formDataErrors.password.isInvalid && (
              <FormControlError>
                <FormControlErrorText className="text-sm font-montserrat-semibold">
                  {"   "}
                  {formDataErrors.password.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
        </Box>
        <Button
          action="primary"
          className="rounded-3xl h-16 bg-primary py-3 shadow-lg shadow-black"
          onPress={handleSubmit}
        >
          <ButtonText className="text-white text-lg font-montserrat-semibold">
            Masuk
          </ButtonText>
        </Button>
        <Text className="text-center color-white font-montserrat">
          Belum Punya Akun ?{" "}
          <Link href="/register" className="font-montserrat-bold underline">
            Daftar Sekarang
          </Link>
        </Text>
      </Box>
      <Box className="flex justify-center items-center mt-10 flex-row gap-3">
        <Divider orientation="horizontal" className="w-36" />
        <Text className="text-center color-white font-montserrat">Atau</Text>
        <Divider orientation="horizontal" className="w-36" />
      </Box>
      <Box className="mt-10">
        <Button
          action="secondary"
          className="rounded-3xl h-16 bg-white py-3 shadow-lg shadow-black"
        >
          <Image source={images.google} className="size-8 object-fill" />
          <ButtonText className="text-black font-montserrat-semibold">
            Masuk Dengan Google
          </ButtonText>
        </Button>
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

export default SignIn;
