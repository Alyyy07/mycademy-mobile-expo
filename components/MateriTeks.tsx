import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fixUrls } from "@/lib/app.constant";
import RenderHtml from "react-native-render-html";
import { useWindowDimensions } from "react-native";
import { ScrollView } from "react-native";

const MateriTeks = ({ data }: { data: any }) => {
  const { width } = useWindowDimensions();
  return (
    // Make container flex so WebView can expand
    <SafeAreaView className="p-5 flex-1 gap-4">
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
          <View className="bg-primary-300 p-2 flex-row gap-1 rounded-lg">
            <Feather name="x-circle" size={16} color="#2762ce" />
            <Text className="text-primary-700 text-sm font-medium">
              Belum Selesai
            </Text>
          </View>
        )}
      </View>

      {data.materi_selesai && data.tanggal_selesai ? (
        <Text className="text-gray-300 text-sm mb-4">
          Selesai pada:{" "}
          {format(new Date(data.tanggal_selesai), "EEEE, dd MMMM yyyy, HH:mm", {
            locale: id,
          })}
        </Text>
      ) : null}

      {/* Container for WebView with explicit flex */}
      <ScrollView className="flex-1 w-full rounded-xl py-0 border bg-primary-900 overflow-hidden">
        <RenderHtml
          contentWidth={width - 40}
          source={{ html: fixUrls(data.text_content) }}
          ignoredStyles={["width", "height", "color"]}
          computeEmbeddedMaxWidth={(contentWidth) => contentWidth}
          renderersProps={{
            img: { enableExperimentalPercentWidth: true },
          }}
          baseStyle={{ color: "white", padding: 20}}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MateriTeks;
