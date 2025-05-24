import NoResult from "@/components/NoResult";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const ModulPembelajaran = () => {
  const [loading, setLoading] = useState(false);
  const [modul, setModul] = useState<any>();
  const params = useLocalSearchParams();
  const showToast = useShowToast();
  const { id, nama_matakuliah, deskripsi } = params as {
    id: string;
    nama_matakuliah: string;
    deskripsi: string;
  };

  const fetchMatakuliah = useCallback(async () => {
    setLoading(true);
    try {
      const userInfo = await SecureStore.getItemAsync("userInfo");
      if (!userInfo) return router.replace("/sign-in");
      const user = JSON.parse(userInfo);
      const result = await fetchAPI(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/modul-pembelajaran?id=${id}&email=${user.email}`,
        "GET",
        {},
        10000,
        user.token
      );
      if (result?.status === "success" && result.data?.rps_details) {
        setModul(result.data);
      } else {
        showToast(
          result?.message || "Gagal mendapatkan data matakuliah",
          "error"
        );
        setModul([]);
      }
    } catch {
      showToast("Terjadi kesalahan saat mengambil data", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchMatakuliah();
  }, [fetchMatakuliah]);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-accent">
      <FlatList
        data={modul?.rps_details || []}
        renderItem={({ item }) => (
          <Card item={item} onReload={fetchMatakuliah} />
        )}
        keyExtractor={(item) => item.id.toString()}
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
          <View className="p-5 py-0">
            <View className="w-full flex-row items-center justify-between">
              <View className="flex flex-col items-start justify-center mb-3">
                <Text
                  className="text-2xl font-montserratalternates-semibold text-white"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
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

const Card = ({
  item,
  onReload,
}: {
  item: any;
  onReload: () => Promise<void>;
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedScale, setSelectedScale] = useState<"1" | "2" | "3" | "4">(
    "4"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [counter, setCounter] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const showToast = useShowToast();

  useEffect(() => {
    if (!showDialog && timerId) {
      clearInterval(timerId);
      setTimerId(null);
      setCounter(0);
    }
  }, [showDialog]);

  useEffect(() => {
    if (showDialog) {
      setCounter(10);
      const id = setInterval(() => {
        setCounter((c) => {
          if (c <= 1) {
            clearInterval(id);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      setTimerId(id);
    }
  }, [showDialog]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const info = await SecureStore.getItemAsync("userInfo");
      if (!info) throw new Error("User tidak ditemukan");
      const user = JSON.parse(info);

      const payload = {
        rps_detail_id: item.id,
        email: user.email,
        skala_pemahaman: parseInt(selectedScale, 10),
      };
      console.log("Payload:", payload);

      const res = await fetchAPI(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/modul-pembelajaran/materi-selesai-all`,
        "POST",
        payload
      );

      if (res.status === "success") {
        showToast(res.message, "success");
        setShowDialog(false);
        await onReload();
      } else {
        showToast(res.message, "error");
      }
    } catch (err: any) {
      showToast(err.message || "Kesalahan jaringan", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="bg-gray-700 rounded-xl p-3 mx-5 mb-5 shadow-lg shadow-black">
      <View className="flex-row items-center mb-2">
        <Text className="text-md font-montserratalternates-semibold text-white">
          Pertemuan ke-{item.sesi_pertemuan}
        </Text>
        {item.tanggal_realisasi ? (
          <View className="bg-green-300 p-1 flex-row gap-1 rounded-lg ml-2">
            <Feather name="check-circle" size={15} color="#15803d" />
            <Text className="text-xs font-montserratalternates-semibold text-green-700">
              Sesi sudah berakhir
            </Text>
          </View>
        ) : new Date(item.tanggal_pertemuan) > new Date() ? (
          <View className="bg-gray-300 p-1 flex-row gap-1 rounded-lg ml-2">
            <Feather name="alert-circle" size={15} color="#374151" />
            <Text className="text-xs font-montserratalternates-semibold text-gray-700">
              Sesi belum dimulai
            </Text>
          </View>
        ) : (
          <View className="bg-primary-300 p-1 flex-row gap-1 rounded-lg ml-2">
            <Feather name="bell" size={15} color="#2762ce" />
            <Text className="text-xs font-montserratalternates-semibold text-primary-700">
              Sesi sedang berlangsung
            </Text>
          </View>
        )}
        {!item.materi_selesai_all && (
          <TouchableOpacity
            className="ml-auto bg-primary-900 p-2 rounded-lg"
            onPress={() => setShowDialog(true)}
          >
            <FontAwesome5 name="tasks" size={16} color="#F59E0B" />
          </TouchableOpacity>
        )}
      </View>

      <Text className="text-xs font-montserratalternates-semibold text-gray-300 mb-3">
        {format(new Date(item.tanggal_pertemuan), "EEEE, dd MMMM yyyy", {
          locale: id,
        })}
      </Text>

      {/* Daftar Materi */}
      {item.materi.length > 0
        ? item.materi.map((materi: any) => (
            <View
              key={materi.id}
              className="bg-primary p-3 flex-row items-center gap-3 rounded-lg shadow-lg shadow-black mt-3"
            >
              <Feather size={35} name="book-open" color="#F59E0B" />
              <View>
                <View className="flex-row items-center max-w-[70%] gap-2">
                  <Text
                    className="text-base font-montserratalternates-semibold text-white"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {materi.title}
                  </Text>
                  {materi.materi_selesai ? (
                    <View className="bg-green-300 p-1 flex-row gap-1 rounded-lg">
                      <Text className="text-xs font-montserratalternates-semibold text-green-700">
                        Selesai
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-primary-300 p-1 flex-row gap-1 rounded-lg">
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
                onPress={() =>
                  router.push(
                    `/(root)/(tabs)/modul-pembelajaran/materi?id=${materi.id}`
                  )
                }
              >
                <Feather size={20} name="eye" color="#dddd" />
              </TouchableOpacity>
            </View>
          ))
        : null}

      {/* Daftar Kuis */}
      {item.kuis.length > 0
        ? item.kuis.map((kuis: any) => (
            <View
              key={kuis.id}
              className="bg-primary p-3 flex-row items-center gap-3 rounded-lg shadow-lg shadow-black mt-3"
            >
              <MaterialCommunityIcons
                size={35}
                name="clipboard-text-outline"
                color="#F59E0B"
              />
              <View className="max-w-[70%]">
                <View className="flex-row items-center gap-2 max-w-[70%]">
                  <Text
                    className="text-base font-montserratalternates-semibold text-white"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {kuis.title}
                  </Text>
                  {kuis.kuis_selesai ? (
                    <View className="bg-green-300 p-1 flex-row gap-1 rounded-lg">
                      <Text className="text-xs font-montserratalternates-semibold text-green-700">
                        Selesai
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-primary-300 p-1 flex-row gap-1 rounded-lg">
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
                onPress={() =>
                  router.push(
                    `/(root)/(tabs)/modul-pembelajaran/kuis?id=${kuis.id}`
                  )
                }
              >
                <Feather size={20} name="eye" color="#dddd" />
              </TouchableOpacity>
            </View>
          ))
        : null}

      {/* Dialog Penilaian Pertemuan */}
      <AlertDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        closeOnOverlayClick={false}
        size="lg"
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className={"bg-primary-900 border-0"}>
          <AlertDialogHeader className="flex flex-col items-start">
            <Heading size="xl" className="font-semibold text-white">
              Seberapa paham Anda dengan seluruh materi di pertemuan ini?
            </Heading>
            <Text className="text-md text-gray-300 mt-1">
              Silakan beri penilaian Anda. (Jawaban tidak dapat diubah)
            </Text>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-3 mb-4 space-y-3">
            {[
              { label: "Sangat paham", value: "4" },
              { label: "Lumayan paham", value: "3" },
              { label: "Kurang paham", value: "2" },
              { label: "Tidak paham", value: "1" },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                className={`flex-row items-center p-2 mb-3 rounded ${
                  selectedScale === opt.value
                    ? "bg-primary-200"
                    : "bg-primary-500"
                }`}
                onPress={() => setSelectedScale(opt.value as any)}
              >
                <Text
                  className={
                    selectedScale === opt.value ? "text-primary" : "text-white"
                  }
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              action="secondary"
              size="sm"
              onPress={() => setShowDialog(false)}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              onPress={handleSubmit}
              disabled={isSubmitting || counter > 0}
              className="disabled:opacity-50"
            >
              <ButtonText>
                {isSubmitting
                  ? "Memproses..."
                  : counter > 0
                  ? `(${counter}) Simpan`
                  : "Simpan"}
              </ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
};

export default ModulPembelajaran;
