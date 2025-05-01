import NoResult from "@/components/NoResult";
import { fetchAPI } from "@/lib/app.constant";
import { useShowToast } from "@/lib/hooks";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";

const Materi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const params = useLocalSearchParams();
  const [materi, setMateri] = useState<any>(null);
  const showToast = useShowToast();

  useEffect(() => {
    const fetchMateri = async () => {
      setIsLoading(true);
      const userInfo = await SecureStore.getItemAsync("userInfo");
      if (!userInfo) {
        router.push("/sign-in");
        return;
      }
      const user = JSON.parse(userInfo);
      try {
        const result = await fetchAPI(
          `${process.env.EXPO_PUBLIC_API_URL}/api/auth/modul-pembelajaran/materi?id=${params.id}&email=${user.email}`,
          "GET",
          {},
          10000
        );
        if (result) {
          if (result.status === "success") {
            setMateri(result.data);
            console.log(result.data);
          } else {
            showToast(result.message, "error");
          }
        } else {
          showToast("Gagal mendapatkan data materi", "error");
        }
      } catch (error) {
        showToast("Terjadi kesalahan jaringan", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMateri();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-accent">
      {isLoading && (
        <ActivityIndicator size="large" className="text-primary-300 mt-5" />
      )}
      {!materi && !isLoading && (
        <NoResult message="Tidak ada materi yang ditemukan" />
      )}
      {!isLoading && materi ? (
        materi.tipe_materi === "video" ? (
          <MateriVideo data={materi} />
        ) : (
          <Text className="text-white text-center mt-4">
            Tipe materi tidak didukung
          </Text>
        )
      ) : null}
      {/* {materi.tipe_materi === "pdf" && <MateriPDF data={materi} />}
      {materi.tipe_materi === "teks" && <MateriTeks data={materi} />} */}
    </SafeAreaView>
  );
};

const MateriVideo = ({ data }: { data: any }) => {
  const videoId = data.video_path.split("v=")[1];
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  return (
    <View className="p-5 ">
      <Text className="text-2xl text-white font-montserrat-semibold mb-3">
        {data.title}
      </Text>
      <WebView source={{ uri: embedUrl }} className="w-full" allowsFullscreenVideo />
    </View>
  );
};

export default Materi;
