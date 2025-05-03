import { images } from "@/constants/image";
import { Feather } from "@expo/vector-icons";
import { router, Slot } from "expo-router";
import { Image, Pressable, TouchableOpacity } from "react-native";
import { Text, View } from "react-native";

const ModulLayout = () => {
  return (
    <>
      <View className="relative flex flex-row justify-center items-center p-3 pb-5 bg-accent">
        <TouchableOpacity
          className="absolute left-5 z-10"
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <Pressable onPress={() => router.push("/(root)/(tabs)")}>
          <View className="flex flex-row justify-center items-center">
            <Image
              source={images.logonotext}
              className="object-fill size-[60px]"
            />
            <Text className="font-caveat-bold text-2xl w-24 text-white">
              MyCademy
            </Text>
          </View>
        </Pressable>
      </View>
      <Slot />
    </>
  );
};

export default ModulLayout;
