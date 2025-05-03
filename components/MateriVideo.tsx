import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Dimensions, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

const MateriVideo = ({ data }: { data: any }) => {
  const screenWidth = Dimensions.get("window").width;
  const videoHeight = (screenWidth * 9) / 12;
  let videoId: string | null = null;
  try {
    const url = new URL(data.video_path);
    videoId = url.searchParams.get("v");
  } catch (e) {
    console.warn("Invalid video URL:", data.video_path);
  }
  if (!videoId) return <Text className="text-white">Video tidak valid</Text>;

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  return (
    <SafeAreaView
      style={{ width: screenWidth, height: videoHeight }}
      className="p-5 gap-4"
    >
      <View className="flex-row justify-between items-center w-full">
        <Text className="text-2xl font-montserratalternates-semibold text-white">
          {data.title}
        </Text>
        {data.materi_selesai ? (
          <View className="bg-green-300 p-2 flex-row gap-1 rounded-lg">
            <Feather name="check-circle" size={16} color="#15803d" />
            <Text className="text-green-700 text-sm font-medium">Selesai</Text>
          </View>
        ) : (
          <View className="bg-primary-300 p-2 items-center flex-row gap-1 rounded-lg">
            <Feather name="x-circle" size={16} color="#2762ce" />
            <Text className="text-primary-700 text-sm font-medium">
              Belum Selesai
            </Text>
          </View>
        )}
      </View>
      {data.materi_selesai && data.tanggal_selesai ? (
        <Text className="text-gray-300 text-sm">
          Selesai pada:{" "}
          {format(new Date(data.tanggal_selesai), "EEEE, dd MMMM yyyy, HH:mm", {
            locale: id,
          })}
        </Text>
      ) : null}
      <WebView
        source={{ uri: embedUrl }}
        style={{ width: screenWidth, height: videoHeight }}
        javaScriptEnabled
        allowsFullscreenVideo
      />
    </SafeAreaView>
  );
};

export default MateriVideo;
