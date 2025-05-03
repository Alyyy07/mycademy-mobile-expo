import NoResult from "@/components/NoResult";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { fetchAPI } from "@/lib/app.constant";
import { useShowToast } from "@/lib/hooks";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Feather, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const ModulPembelajaran = () => {
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const [modul, setModul] = useState<any>();
  const showToast = useShowToast();
  const { id, nama_matakuliah, deskripsi } = params as {
    id: string;
    nama_matakuliah: string;
    deskripsi: string;
  };

  useEffect(() => {
    const fetchMatakuliah = async () => {
      setLoading(true);
      try {
        const userInfo = await SecureStore.getItemAsync("userInfo");
        if (userInfo) {
          const user = JSON.parse(userInfo);
          const result = await fetchAPI(
            `${process.env.EXPO_PUBLIC_API_URL}/api/auth/modul-pembelajaran?id=${id}&email=${user.email}`,
            "GET",
            {},
            10000,
            user.token
          );
          if (result) {
            if (result.status === "success" && result.data?.rps_details) {
              setModul(result.data);
            } else {
              showToast(result.message, "error");
              setModul([]);
              console.log(result.message);
            }
          } else {
            showToast("Gagal mendapatkan data matakuliah", "error");
          }
        } else{
          router.push("/sign-in");
        }
      } catch (error) {
        showToast("Terjadi kesalahan saat mengambil data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMatakuliah();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-accent">
      <FlatList
        data={modul?.rps_details || []}
        renderItem={({ item }) => <Card item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={1}
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <NoResult message="Tidak ada Modul yang ditemukan" />
          )
        }
        ListHeaderComponent={
          <View className=" p-5 py-0">
            <View className="w-full flex-row items-center justify-between">
              <View className="flex flex-col items-start justify-center mb-3">
                <Text className="text-2xl font-montserratalternates-semibold max-w-[240px] text-white">
                  {nama_matakuliah}
                </Text>
                <Text className="text-base font-montserratalternates-medium mt-2 text-white">
                  {deskripsi ?? "Tidak ada deskripsi"}
                </Text>
              </View>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const Card = ({ item }: { item: any }) => {
  return (
    <View className="bg-gray-700 rounded-xl p-3 mx-5 mb-5 shadow-lg shadow-black">
      <View className="flex flex-row items-center gap-3">
        <View className="flex flex-col items-start justify-center">
          <View className="flex flex-row items-center gap-2">
            <Text className="text-md font-montserratalternates-semibold text-white">
              Pertemuan ke-{item.sesi_pertemuan}
            </Text>
            {item.tanggal_realisasi !== null &&
            !isNaN(new Date(item.tanggal_realisasi).getTime()) ? (
              <View className="bg-green-300 p-1 flex flex-row gap-1 rounded-lg">
                <Feather size={15} name="check-circle" color="#15803d" />
                <Text className="text-xs font-montserratalternates-semibold text-green-700">
                  Sesi sudah berakhir
                </Text>
              </View>
            ) : new Date(item.tanggal_pertemuan) > new Date() ? (
              <View className="bg-gray-300 p-1 flex flex-row gap-1 rounded-lg">
                <Feather size={15} name="check-circle" color="#374151" />
                <Text className="text-xs font-montserratalternates-semibold text-gray-700">
                  Sesi belum dimulai
                </Text>
              </View>
            ) : (
              <View className="bg-primary-300 p-1 flex flex-row gap-1 rounded-lg">
                <Feather size={15} name="check-circle" color=" #2762ce" />
                <Text className="text-xs font-montserratalternates-semibold text-primary-700">
                  Sesi sedang berlangsung
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xs font-montserratalternates-medium text-gray-300">
            {format(new Date(item.tanggal_pertemuan), "EEEE, dd MMMM yyyy", {
              locale: id,
            })}
          </Text>
        </View>

        {item.tanggal_realisasi !== null &&
        !isNaN(new Date(item.tanggal_realisasi).getTime()) ? (
          <TouchableOpacity className="ml-auto flex flex-row items-center gap-3 bg-primary-900 p-3 rounded-lg">
            <Octicons size={15} name="comment-discussion" color="#dddd" />
          </TouchableOpacity>
        ) : null}
      </View>
      {item.materi.length > 0
        ? item.materi?.map((materi: any) => (
            <View
              key={materi.id}
              className="bg-primary p-3 flex flex-row items-center gap-3 rounded-lg shadow-lg shadow-black  mt-3"
            >
              <Feather size={35} name="book-open" color="#F59E0B" />
              <View className="max-w-[70%]">
                <View className="flex flex-row items-center gap-2 max-w-[80%]">
                  <Text className="text-base font-montserratalternates-semibold text-white" numberOfLines={1} ellipsizeMode="tail">
                    {materi.title}
                  </Text>
                  {materi.materi_selesai ? (
                    <View className="bg-green-300 p-1 flex flex-row gap-1 rounded-lg">
                      <Text className="text-xs font-montserratalternates-semibold text-green-700">
                        Selesai
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-primary-300 p-1 flex flex-row gap-1 rounded-lg">
                      <Text className="text-xs font-montserratalternates-semibold text-primary-700">
                        Belum Selesai
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm font-montserratalternates-medium text-gray-300">
                  {materi.tipe_materi}
                </Text>
              </View>

              <TouchableOpacity
                className="ml-auto bg-primary-900 p-2 rounded-lg"
                onPress={() => router.push(`/(root)/(tabs)/modul-pembelajaran/materi?id=${materi.id}`)}
              >
                <Feather size={20} name="eye" color="#dddd" />
              </TouchableOpacity>
            </View>
          ))
        : null}
      {item.kuis.length > 0
        ? item.kuis?.map((kuis: any) => (
            <View
              key={kuis.id}
              className="bg-primary p-3 flex flex-row items-center gap-3 rounded-lg shadow-lg shadow-black  mt-3"
            >
              <MaterialCommunityIcons
                size={35}
                name="clipboard-text-outline"
                color="#F59E0B"
              />
              <View className="max-w-[70%]">
              <View className="flex flex-row items-center gap-2 max-w-[80%]">
                <Text className="text-base font-montserratalternates-semibold text-white" numberOfLines={1} ellipsizeMode="tail">
                  {kuis.title}
                </Text>
                {kuis.kuis_selesai ? (
                    <View className="bg-green-300 p-1 flex flex-row gap-1 rounded-lg">
                      <Text className="text-xs font-montserratalternates-semibold text-green-700">
                        Selesai
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-primary-300 p-1 flex flex-row gap-1 rounded-lg">
                      <Text className="text-xs font-montserratalternates-semibold text-primary-700">
                        Belum Selesai
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  className="text-sm font-montserratalternates-medium text-gray-300"
                >
                  {kuis.description}
                </Text>
              </View>
              <TouchableOpacity
                className="ml-auto bg-primary-900 p-2 rounded-lg"
                onPress={() => router.push(kuis.link)}
              >
                <Feather size={20} name="eye" color="#dddd" />
              </TouchableOpacity>
            </View>
          ))
        : null}
      {item.materi.length === 0 && item.kuis.length === 0 ? (
        <Text className="text-sm text-center font-montserratalternates-medium text-gray-300 p-5 pb-0">
          Belum ada modul
        </Text>
      ) : null}
    </View>
  );
};

export default ModulPembelajaran;
