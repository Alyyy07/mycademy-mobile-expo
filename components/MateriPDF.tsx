import { images } from "@/constants/image";
import { useShowToast } from "@/lib/hooks";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Image, Linking, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";
import { SafeAreaView } from "react-native-safe-area-context";

const MateriPDF = ({ data }: { data: any }) => {
  const showToast = useShowToast();
  const pdfUrl = `${process.env.EXPO_PUBLIC_API_URL}/storage/${data.file_path}`;
  const fileName = pdfUrl.split("/").pop() || "file.pdf";

  const handleDownload = async () => {
    const permissions =
      await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
      showToast("Izin akses penyimpanan ditolak.", "error");
      return;
    }

    try {
      const tempUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.downloadAsync(pdfUrl, tempUri);
      const base64Data = await FileSystem.readAsStringAsync(tempUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const newUri = await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        "application/pdf"
      );
      await FileSystem.writeAsStringAsync(newUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      showToast("Berhasil menyimpan PDF ke penyimpanan.", "success");
    } catch (error: any) {
      console.log("Error:", error);
      showToast("Gagal menyimpan file: " + error.message, "error");
    }
  };

  return (
    <SafeAreaView className="p-5 gap-3">
      <View className="flex-row justify-between items-center w-full">
        <Text className="text-2xl font-montserratalternates-semibold text-white" style={{ maxWidth: '70%' }} numberOfLines={2} ellipsizeMode="tail">
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
        <Text className="text-gray-300 text-sm mb-3">
          Selesai pada:{" "}
          {format(new Date(data.tanggal_selesai), "EEEE, dd MMMM yyyy, HH:mm", {
            locale: id,
          })}
        </Text>
      ) : null}
      <View className="border-2 border-dashed border-gray-400 rounded-2xl p-6 items-center justify-center bg-gray-800">
        <Image source={images.pdf} className="object-fill size-[50px] mb-4" />
        <Text className="text-white text-base font-medium mb-2">
          {fileName.length > 25 ? fileName.substring(0, 25) + "..." : fileName}
        </Text>
        <TouchableOpacity onPress={handleDownload} className="mt-2 w-full">
          <View className="border border-primary-500 rounded-lg py-3 px-4 flex-row items-center justify-center">
            <Feather name="download" size={20} color="#2762ce" />
            <Text className="text-primary-700 text-sm font-semibold ml-2">
              Download PDF
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MateriPDF;
