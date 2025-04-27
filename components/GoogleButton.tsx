import {
  View,
  Text,
  Platform,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React, { useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Button, ButtonText } from "./ui/button";
import { images } from "@/constants/image";
import { useShowToast } from "@/lib/hooks";
import { fetchAPI } from "@/lib/app.constant";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const GoogleButton = ({ disabled }: { disabled: boolean }) => {
  const showToast = useShowToast();
  const configureGoogleSignIn = () => {
    if (Platform.OS === "ios") {
      GoogleSignin.configure({
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      });
    } else {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      });
    }
  };

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log("User Info:", userInfo);

      
      // const result = await fetchAPI(
      //   `${process.env.EXPO_PUBLIC_API_URL}/api/login-with-google`,
      //   "POST",
      //   { email: userInfo.email },
      // );

      // if (result.status === "success") {
      //   await SecureStore.setItemAsync("userInfo", JSON.stringify(result.data));
      //   router.push("/(root)/(tabs)");
      //   showToast(result.message);
      // } else {
      //   showToast(result.message);
      // }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      showToast("Terjadi kesalahan saat login dengan Google");
    }
  };
  return (
    <Button
      action="secondary"
      disabled={disabled}
      className="rounded-3xl h-16 bg-white py-3 shadow-lg shadow-black"
      onPress={googleSignIn}
    >
      {disabled ? (
        <ActivityIndicator color="black" />
      ) : (
        <>
          <Image source={images.google} style={styles.image} />
          <ButtonText className="text-black font-montserrat-semibold">
            Masuk Dengan Google
          </ButtonText>
        </>
      )}
    </Button>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 32,
    height: 32,
    resizeMode: "cover",
  },
});

export default GoogleButton;
