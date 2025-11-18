import { SplashScreen, Stack } from "expo-router";
import "./global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useFonts } from "expo-font";
import { useEffect } from "react";

export default function RootLayout() {
  const [fontLoaded] = useFonts({
    "Caveat-Regular": require("../assets/fonts/Caveat-Regular.ttf"),
    "Caveat-Bold": require("../assets/fonts/Caveat-Bold.ttf"),
    "Caveat-Medium": require("../assets/fonts/Caveat-Medium.ttf"),
    "Caveat-SemiBold": require("../assets/fonts/Caveat-SemiBold.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-ExtraLight": require("../assets/fonts/Montserrat-ExtraLight.ttf"),
    "Montserrat-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-Italic": require("../assets/fonts/Montserrat-Italic.ttf"),
    "MontserratAlternates-Regular": require("../assets/fonts/MontserratAlternates-Regular.ttf"),
    "MontserratAlternates-Bold": require("../assets/fonts/MontserratAlternates-Bold.ttf"),
    "MontserratAlternates-Medium": require("../assets/fonts/MontserratAlternates-Medium.ttf"),
    "MontserratAlternates-SemiBold": require("../assets/fonts/MontserratAlternates-SemiBold.ttf"),
    "MontserratAlternates-Light": require("../assets/fonts/MontserratAlternates-Light.ttf"),
    "MontserratAlternates-ExtraLight": require("../assets/fonts/MontserratAlternates-ExtraLight.ttf"),
    "MontserratAlternates-ExtraBold": require("../assets/fonts/MontserratAlternates-ExtraBold.ttf"),
    "MontserratAlternates-Italic": require("../assets/fonts/MontserratAlternates-Italic.ttf"),
  });

  useEffect(() => {
    if (fontLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded]);

  if (!fontLoaded) return null;

  return (
      <GluestackUIProvider>
        <Stack screenOptions={{ headerShown:false, }}/>
      </GluestackUIProvider>
  );
}
