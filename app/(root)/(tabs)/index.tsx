import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShowToast } from "@/lib/hooks";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import NoResult from "@/components/NoResult";
import { images } from "@/constants/image";
import { fetchAPI } from "@/lib/app.constant";

export default function Index() {
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await SecureStore.getItemAsync("userInfo");
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } else {
        router.push("/sign-in");
      }
    };

    fetchUserInfo();
  }, []);

  const logout = async () => {
    if (user !== null) {
      try {
        const result = await fetchAPI(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/logout`, "POST", {
          email: user.email,
        },5000, user.token);
        if (result) {
          await SecureStore.deleteItemAsync("userInfo");
          showToast(result.message);
          router.push("/sign-in");
        }
      } catch (error) {
        console.log("Error resetting storage:", error);
      }
    }
  };

  const properties = [
    { id: "1", name: "Property 1" },
    { id: "2", name: "Property 2" },
    { id: "3", name: "Property 3" },
    { id: "4", name: "Property 4" },
    { id: "5", name: "Property 5" },
    { id: "6", name: "Property 6" },
  ];

  return (
    <View
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      className="bg-accent"
    >
      <FlatList
        data={properties}
        renderItem={({ item }) => <Card item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <NoResult />
          )
        }
        ListHeaderComponent={
          <View className="px-5">
            <View className="flex flex-row items-center justify-between mt-5">
              <View className="flex flex-row items-center">
                <Image
                  source={{ uri: user?.avatar }}
                  className="size-12 rounded-full"
                />
                <View className="flex flex-col items-start ml-2 justify-center">
                  <Text className="font-rubik text-white">Good Morning</Text>
                  <Text className="text-base font-rubik-medium text-white">
                    {user?.name}
                  </Text>
                </View>
              </View>
              <Image source={images.bell} className="size-6" />
            </View>
          </View>
        }
      />
      <Text>Welcome to the App!</Text>
      <Button onPress={() => showToast("Hello World!")}>
        <ButtonText>Show Toast</ButtonText>
      </Button>

      <Button onPress={logout}>
        <ButtonText>Log Out</ButtonText>
      </Button>
    </View>
  );
}

const Card = ({ item }: { item: any }) => {
  return (
    <Text className="text-black-300 font-rubik-medium text-lg bg-white rounded-lg p-5 shadow-md w-full h-24 flex items-center justify-center">
      {item.name}
    </Text>
  );
};
