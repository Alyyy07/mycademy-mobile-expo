import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { images } from "@/constants/image";
import { OTPInput } from "@/components/OTPInput";
import { Button, ButtonText } from "@/components/ui/button";
import { useShowToast, useThrottle } from "@/lib/hooks";
import { fetchAPI } from "@/lib/app.constant";
import { router, useLocalSearchParams } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const TIMER_DURATION = 60;

const validateEmail = () => {
  const [codes, setCodes] = useState<string[]>(Array(6).fill(""));
  const params = useLocalSearchParams();
  const [timer, setTimer] = useState(0);
  const [verificationCode, setVerificationCode] = useState(
    params.verificationCode
  );
  const refs: RefObject<TextInput>[] = Array(6)
    .fill(null)
    .map(() => useRef<TextInput>(null));
  const config = {
    backgroundColor: "#F3F4F6",
    textColor: "#000000",
    borderColor: "#D1D5DB",
    errorColor: "#EF4444",
    focusColor: "#2563EB",
  };
  const [errorMessages, setErrorMessages] = useState<string>();
  const showToast = useShowToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!params.email) {
      router.push("/sign-in");
    } else {
      fetchVerificationCode();
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(
        () => setTimer((prevTimer) => prevTimer - 1),
        1000
      );
      return () => clearInterval(interval);
    }
  }, [timer]);

  const fetchVerificationCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAPI(
        `${API_URL}/api/verify-email?email=${params.email}`,
        "GET"
      );
      if (response.status === "success") {
        setVerificationCode(response.data.verificationCode);
        setTimer(TIMER_DURATION);
        showToast(response.message);
      } else {
        showToast(response.message);
        console.log(response.message);
        router.push("/sign-in");
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message,"error");
        console.log("error:"+error.message);
      }
      router.push("/sign-in");
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    try {
      const response = await fetchAPI(
        `${API_URL}/api/verification-code?email=${params.email}`,
        "GET"
      );
      if (response.status === "success") {
        showToast("Kode Verifikasi telah dikirim ulang");
        setVerificationCode(response.data.verificationCode);
        setTimer(TIMER_DURATION);
      } else {
        setErrorMessages(response.message);
      }
    } catch (error) {
      setErrorMessages("Terdapat kesalahan, silahkan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeCode = (text: string, index: number) => {
    setErrorMessages(undefined);
    const newCodes = [...codes];
    newCodes[index] = text;
    setCodes(newCodes);
    if (text !== "" && index < 5) {
      refs[index + 1]!.current?.focus();
    }
  };

  const handleSubmit = async () => {
    if (codes.length !== 6) {
      setErrorMessages("Masukkan Kode Verifikasi dengan benar");
      return;
    }
    const fullCode = codes.join("");
    if (typeof verificationCode === "string" && verificationCode.trim() !== fullCode.trim()) {
      setErrorMessages("Kode yang Anda masukkan salah");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchAPI(`${API_URL}/api/verify-email`, "POST", {
        email: params.email,
        verificationCode: fullCode,
      });
      if (response.status === "success") {
        showToast(response.message+", Silahkan login");
        router.push("/sign-in");
      } else {
        setErrorMessages(response.message);
      }
    } catch (error) {
      setErrorMessages(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  const throttledHandleSubmit = useThrottle(handleSubmit, 3000);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView className="bg-accent flex-1 px-10">
          <View className="flex justify-center items-center mt-10 gap-3 flex-col">
            <Image
              source={images.validateIcon}
              className="object-fill size-96"
            />
            <Text className="font-montserratalternates-bold text-2xl mt-5 text-white">
              Masukkan Kode Verifikasi
            </Text>
            <Text className="font-montserratalternates-light text-center mb-5 text-white">
              Kode verifikasi telah dikirim ke email Anda. Silahkan cek email
              Anda dan masukkan kode verifikasi di bawah ini.
            </Text>
            <OTPInput
              config={config}
              codes={codes}
              errorMessages={errorMessages}
              onChangeCode={onChangeCode}
              refs={refs}
            />
            <Text className="text-red-500 text-sm ">{errorMessages}</Text>
          </View>
          <Button
            action="primary"
            disabled={isLoading}
            className="rounded-3xl h-16 bg-primary py-3 shadow-lg mt-2 shadow-black"
            onPress={throttledHandleSubmit}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ButtonText className="text-white text-lg font-montserrat-semibold">
                Verifikasi Kode
              </ButtonText>
            )}
          </Button>
          <Text className="text-center color-white mt-4 font-montserrat">
            {timer > 0 ? (
              `Kirim ulang kode dalam ${timer} detik`
            ) : (
              <>
                Belum mendapatkan kode?{" "}
                <Text
                  className="font-montserrat-bold underline"
                  onPress={resendVerificationCode}
                >
                  Kirim Ulang Kode
                </Text>
              </>
            )}
          </Text>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default validateEmail;
