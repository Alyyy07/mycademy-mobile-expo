import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Modal,
  Easing,
  Animated,
} from "react-native";
import { Defs, RadialGradient, Rect, Stop, Svg } from "react-native-svg";
import { HEIGHT, WIDTH } from "@/constants/onboarding";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import {
  fontSizes,
  SCREEN_WIDTH,
  windowHeight,
  windowWidth,
} from "@/lib/app.constant";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";

export default function Slide({
  slide,
  index,
  setIndex,
  totalSlides,
}:{
  slide: onBoardingSlidesTypes;
  index: number;
  setIndex: (value: number) => void;
  totalSlides: number;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const bounceValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: -10,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceValue]);

  const handlePress = (index:number, setIndex : (value:number) => void) => {
    if (index === 2) {
      router.push("/sign-in");
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="gradient" cx="50%" cy="35%">
            <Stop offset="0%" stopColor={slide.color} />
            <Stop offset="100%" stopColor={slide.color} />
          </RadialGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={WIDTH}
          height={HEIGHT}
          fill={"url(#gradient)"}
        />
      </Svg>
      <View style={styles.container}>
        <View>{slide.image}</View>
        <View className="mt-20">
          <View
            style={{
              width: SCREEN_WIDTH * 1,
              paddingHorizontal: verticalScale(25),
            }}
          >
            <Text
              style={{
                fontSize: 32,
                color: "white",
                fontFamily: "MontserratAlternates-Bold",
              }}
            >
              {slide.title}
            </Text>
            <Text
              style={{
                paddingVertical: verticalScale(4),
                fontSize: 20,
                color: "white",
                fontFamily: "MontserratAlternates-Regular",
              }}
            >
              {slide.subTitle}
            </Text>
          </View>
        </View>
      </View>
      {index === slide.index && (
        <View style={styles.indicatorContainer}>
        {Array.from({ length: totalSlides }).map((_, i) => (
          <TouchableOpacity
          key={i}
          style={[styles.indicator, i === index && styles.activeIndicator]}
          />
        ))}
      </View>
      )}
      {/* Next Button */}
      {index <= totalSlides - 1 && index === slide.index && (
        <LinearGradient
          colors={["#6D55FE", "#8976FC"]}
          style={styles.nextButton}
        >
          <Pressable
            style={styles.nextButtonPressable}
            onPress={() => handlePress(index, setIndex)}
          >
            <Text style={styles.nextButtonText}>{index === 2 ? "Masuk" : "Next" }</Text>
          </Pressable>
        </LinearGradient>
      )}
      {index < totalSlides - 1 && index === slide.index && (
        <Animated.View
          style={[
            styles.arrowButton,
            { transform: [{ translateX: bounceValue }] },
          ]}
        >
          <TouchableOpacity onPress={() => handlePress(index, setIndex)}>
            <Ionicons name="menu" size={scale(18)} color="white" style={{ transform: [{ rotate: "90deg" }] }} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    padding: scale(60),
    paddingTop: verticalScale(100),
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    marginTop: verticalScale(35),
    position: "absolute",
    bottom: verticalScale(55),
    left: scale(22),
  },
  indicator: {
    height: verticalScale(7),
    width: scale(18),
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: scale(4),
    borderRadius: scale(4),
  },
  activeIndicator: {
    height: verticalScale(7),
    width: scale(35),
    backgroundColor: "white",
  },
  nextButton: {
    position: "absolute",
    zIndex: 999999999,
    right: windowWidth(25),
    bottom: windowHeight(42),
    marginTop: windowHeight(30),
    alignItems: "center",
    justifyContent: "center",
    width: windowWidth(140),
    height: windowHeight(37),
    borderRadius: windowWidth(20),
  },
  nextButtonPressable: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  nextButtonText: {
    color: "white",
    fontSize: fontSizes.FONT22,
    fontWeight: "bold",
  },
  arrowButton: {
    position: "absolute",
    width: scale(30),
    height: scale(30),
    borderRadius: scale(20),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    right: windowWidth(5),
    top: windowHeight(342),
    transform: [{ translateY: -30 }],
  },
});
