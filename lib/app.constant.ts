import { DimensionValue, Dimensions, PixelRatio, Platform } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";

export const SCREEN_HEIGHT = Dimensions.get("window").height;
export const SCREEN_WIDTH = Dimensions.get("window").width;

export const IsIOS = Platform.OS === "ios";
export const IsIPAD = IsIOS && SCREEN_HEIGHT / SCREEN_WIDTH < 1.6;
export const IsAndroid = Platform.OS === "android";

export const IsHaveNotch = IsIOS && SCREEN_HEIGHT > 750;

export const hasNotch = Platform.OS === "ios" && getStatusBarHeight() > 20;

export const Isiphone12promax = IsIOS && SCREEN_HEIGHT > 2778;

export const windowHeight = (height: DimensionValue): number => {
  if (!height) {
    return 0;
  }
  let tempHeight = SCREEN_HEIGHT * (parseFloat(height.toString()) / 667);
  return PixelRatio.roundToNearestPixel(tempHeight);
};

export const windowWidth = (width: DimensionValue): number => {
  if (!width) {
    return 0;
  }
  let tempWidth = SCREEN_WIDTH * (parseFloat(width.toString()) / 480);
  return PixelRatio.roundToNearestPixel(tempWidth);
};

export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = re.test(String(email).toLowerCase());
  return {
    isValid,
    message: "Masukkan Email yang valid",
  };
};

export const fontSizes = {
  FONT6: windowWidth(6),
  FONT7: windowWidth(7),
  FONT8: windowWidth(8),
  FONT9: windowWidth(9),
  FONT10: windowWidth(10),
  FONT11: windowWidth(11),
  FONT12: windowWidth(12),
  FONT13: windowWidth(13),
  FONT14: windowWidth(14),
  FONT15: windowWidth(15),
  FONT16: windowWidth(16),
  FONT17: windowWidth(17),
  FONT18: windowWidth(18),
  FONT19: windowWidth(19),
  FONT20: windowWidth(20),
  FONT21: windowWidth(21),
  FONT22: windowWidth(22),
  FONT23: windowWidth(23),
  FONT24: windowWidth(24),
  FONT25: windowWidth(25),
  FONT26: windowWidth(26),
  FONT27: windowWidth(27),
  FONT28: windowWidth(28),
  FONT30: windowWidth(30),
  FONT32: windowWidth(32),
  FONT35: windowWidth(35),
};

export const fetchAPI = async (
  url: string,
  method?: string,
  body?: any,
  timeout: number = 30000,
  token?: string
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CLIENT-ID": process.env.EXPO_PUBLIC_API_KEY!,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const init: {
      method: string;
      headers: Record<string, string>;
      signal: AbortSignal;
      body?: string;
    } = {
      method: method ?? "GET",
      headers: headers,
      signal: controller.signal,
    };

    if (body && method !== "GET" && method !== "HEAD") {
      init["body"] = JSON.stringify(body);
    }
    const response = await fetch(url, init);

    clearTimeout(timeoutId);
    const data = await response.json();
    if (response.status !== 200) {
      console.log("Error:", data);
      return {
        status: "error",
        message: data.message,
      };
    }
    return data;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      console.log("Error: Request timed out");
    } else {
      console.log("Error:", error);
    }
    return {
      status: "error",
      message: "Terjadi kesalahan saat menghubungi server",
    };
  }
};

export const fixUrls = (html: string) =>
  html.replace(
    /https?:\/\/project-skripsi\.test/g,
    "http://192.168.92.100:8000"
  );
