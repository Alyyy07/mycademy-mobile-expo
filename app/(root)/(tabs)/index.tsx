import { Text } from "@/components/ui/text";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShowToast } from "@/lib/hooks";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import NoResult from "@/components/NoResult";
import { fetchAPI } from "@/lib/app.constant";
import Search from "@/components/Search";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { Button, ButtonText } from "@/components/ui/button";

export default function Index() {
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [matakuliah, setMatakuliah] = useState<any>([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await SecureStore.getItemAsync("userInfo");
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } else {
        router.replace("/sign-in");
      }
    };

    fetchUserInfo();

    const fetchMatakuliah = async () => {
      setLoading(true);
      try {
        const userInfo = await SecureStore.getItemAsync("userInfo");
        if (userInfo) {
          const user = JSON.parse(userInfo);
          const result = await fetchAPI(
            `${process.env.EXPO_PUBLIC_API_URL}/api/auth/matakuliah?email=${user.email}`,
            "GET",
            {},
            10000,
            user.token
          );
          if (result) {
            if (result.status === "success") {
              setMatakuliah(result.data);
            } else {
              showToast(result.message, "error");
            }
          } else {
            showToast("Gagal mendapatkan data matakuliah", "error");
          }
        }
      } catch (error) {
        console.log("Error fetching matakuliah:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatakuliah();
  }, []);

  const logout = async () => {
    if (user !== null) {
      try {
        const result = await fetchAPI(
          `${process.env.EXPO_PUBLIC_API_URL}/api/auth/logout`,
          "POST",
          {
            email: user?.email,
          },
          10000,
          user.token
        );
        if (result) {
          await SecureStore.deleteItemAsync("userInfo");
          showToast(result.message);
          router.replace("/sign-in");
        }
      } catch (error) {
        console.log("Error resetting storage:", error);
      }
    } else{
      showToast("Gagal mendapatkan data user", "error");
      router.replace("/sign-in");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-accent">
      <FlatList
        data={matakuliah}
        renderItem={({ item }) => <Card item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={1}
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <NoResult />
          )
        }
        ListHeaderComponent={
          <View className="p-5 pt-0">
            <View className="flex w-full flex-row items-center justify-between mb-3">
              <View className="flex flex-col items-start justify-center">
                <Text className="text-2xl font-montserratalternates-semibold max-w-[240px] pt-10 text-white">
                  Hi,
                  {user?.name}
                </Text>
                <Text className="text-base font-montserratalternates-medium mt-2 text-white">
                  Ayo mulai belajar
                </Text>
              </View>
              <Image
                source={{ uri: user?.avatar }}
                className="size-16 rounded-full"
              />
            </View>
            <Search />
            <View className="flex flex-row items-center justify-between mt-6">
              <Text className="text-2xl font-montserratalternates-semibold text-white">
                Tahun Ajaran
              </Text>
              <Text className="text-2xl font-montserratalternates-semibold text-white">
                {user?.tahun_ajaran}
              </Text>
            </View>
          </View>
        }
      />
      <Button onPress={logout}>
        <ButtonText>Log Out</ButtonText>
      </Button>
    </SafeAreaView>
  );
}

const Card = ({ item }: { item: any }) => {
  const hitungPersentase = (item: any) => {
    const materiProgress = item.total_materi
      ? item.materi_selesai / item.total_materi
      : 0;
    const kuisProgress = item.total_kuis
      ? item.kuis_selesai / item.total_kuis
      : 0;
    return ((materiProgress + kuisProgress) * 50).toFixed(2);
  };

  const handleShowMatakuliah = (item: any) => {
    router.push({
      pathname: "/modul-pembelajaran",
      params: {
        id: item.id,
        nama_matakuliah: item.nama_matakuliah,
        deskripsi: item.deskripsi,
      },
    });
  };

  return (
    <TouchableOpacity
      onPress={() => handleShowMatakuliah(item)}
      activeOpacity={0.8}
    >
      <View className="bg-gray-800 rounded-xl shadow-sm p-4 gap-4 mx-5 mb-5">
        <View className="flex flex-row gap-4">
          <AntDesign name="book" size={100} color="#4DC0B5" />
          <View className="flex-col">
            <Text className=" text-gray-100 text-xl  font-montserrat-semibold">
              {item.nama_matakuliah}
            </Text>
            <View className="flex flex-row items-center mt-1">
              <Feather size={15} name="user" color="#3B82F6" />
              <Text className="ml-3 text-gray-100 text-md  font-montserrat-medium">
                {item.dosen}
              </Text>
            </View>
            <View className="flex flex-row items-center mt-1">
              <Feather size={15} name="book-open" color="#F59E0B" />
              <Text className="ml-3 text-gray-100 text-md  font-montserrat-medium">
                {item.materi_selesai} / {item.total_materi} Materi
              </Text>
            </View>
            <View className="flex flex-row items-center mt-1">
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={15}
                color="#FBBF24"
              />
              <Text className="ml-3 text-gray-100 text-md  font-montserrat-medium">
                {item.kuis_selesai} / {item.total_kuis} Kuis
              </Text>
            </View>
          </View>
        </View>
        <View className="p-4 flex gap-2 bg-gray-700 rounded-xl">
          <View className="flex flex-row items-center justify-between">
            <Text className="text-gray-100 text-md font-montserratalternates-semibold">
              Progress Matakuliah
            </Text>
            <Text className="text-gray-100 text-md font-montserratalternates-semibold">
              {hitungPersentase(item)}%
            </Text>
          </View>
          <Progress
            value={parseInt(hitungPersentase(item))}
            size="md"
            orientation="horizontal"
          >
            <ProgressFilledTrack />
          </Progress>
        </View>
      </View>
    </TouchableOpacity>
  );
};
