import NoResult from "@/components/NoResult";
import { fetchAPI } from "@/lib/app.constant";
import { useShowToast } from "@/lib/hooks";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ButtonText } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Heading } from "@/components/ui/heading";
import MateriVideo from "@/components/MateriVideo";
import MateriPDF from "@/components/MateriPDF";
import MateriTeks from "@/components/MateriTeks";

const Materi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [materi, setMateri] = useState<any>(null);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [counter, setCounter] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [selectedScale, setSelectedScale] = useState<"1" | "2" | "3" | "4">(
    "1"
  );
  const commentRef = useRef<string>("");
  const showToast = useShowToast();
  const params = useLocalSearchParams();

  useEffect(() => {
    const fetchMateri = async () => {
      setIsLoading(true);
      const info = await SecureStore.getItemAsync("userInfo");
      if (!info) return router.replace("/sign-in");
      const user = JSON.parse(info);
      setUser(user);
      try {
        const res = await fetchAPI(
          `${process.env.EXPO_PUBLIC_API_URL}/api/auth/modul-pembelajaran/materi?id=${params.id}&email=${user.email}`,
          "GET"
        );
        if (res?.status === "success") setMateri(res.data);
        else showToast(res?.message ?? "Gagal memuat materi", "error");
      } catch {
        showToast("Kesalahan jaringan", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMateri();
  }, []);

  useEffect(() => {
    if (!showAlertDialog) {
      setCounter(0);
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
    }
  }, [showAlertDialog]);

  useEffect(() => {
    if (showAlertDialog) {
      setCounter(10);
      const id = setInterval(() => {
        setCounter((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerId(id);
    }
  }, [showAlertDialog]);

  const handleClose = () => setShowAlertDialog(false);

  const handleSubmit = async () => {
    if (!materi) return;
    setIsLoading(true);
    try {
      const payload = {
        materi_id: materi.id,
        email: user?.email,
        skala_pemahaman: selectedScale,
        komentar: commentRef.current || null,
      };
      const res = await fetchAPI(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/modul-pembelajaran/materi-selesai`,
        "POST",
        payload
      );
      if (res?.status === "success") {
        showToast(res.message, "success");
        // Update UI lokal tanpa reload
        setMateri({
          ...materi,
          materi_selesai: true,
          tanggal_selesai: new Date().toISOString(),
        });
      } else {
        showToast(res?.message ?? "Gagal menandai selesai", "error");
        console.log(res.message);
      }
    } catch {
      showToast("Kesalahan jaringan", "error");
    } finally {
      setIsLoading(false);
      setShowAlertDialog(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-accent">
      {isLoading && (
        <ActivityIndicator size="large" className="text-primary-300 mt-5" />
      )}
      {!materi && !isLoading && (
        <NoResult message="Tidak ada materi yang ditemukan" />
      )}
      {materi && materi.tipe_materi === "video" && (
        <MateriVideo data={materi} />
      )}
      {materi && materi.tipe_materi === "pdf" && (
        <MateriPDF data={materi} />
      )}
      {materi && materi.tipe_materi === "teks" && (
        <MateriTeks data={materi} />
      )}

      {materi && !isLoading && (<Button
        action="primary"
        disabled={!!isLoading || !!materi?.materi_selesai}
        className="m-5 mt-auto rounded-3xl h-16 bg-primary py-3 shadow-lg shadow-black disabled:opacity-50"
        onPress={() => setShowAlertDialog(true)}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ButtonText className="text-white text-lg font-montserrat-semibold">
            Tandai sudah selesai
          </ButtonText>
        )}
      </Button>)}

      <AlertDialog
        isOpen={showAlertDialog}
        onClose={handleClose}
        closeOnOverlayClick={false}
        size="lg"
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className={"bg-primary-900 border-0"}>
          <AlertDialogHeader className="flex flex-col items-start">
            <Heading size="xl" className="font-semibold text-white">
              Seberapa paham Anda dengan materi ini?
            </Heading>
            <Text className="text-md text-gray-300 mt-1">
              Silakan beri penilaian dan komentar Anda. (Jawaban tidak dapat
              diubah)
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

            <TextInput
              defaultValue={commentRef.current}
              onChangeText={(text) => {
                commentRef.current = text;
              }}
              placeholder="Komentar (opsional)"
              placeholderTextColor="#ccc"
              className="border border-gray-500 rounded px-3 py-2 mt-3 text-white"
            />
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              action="secondary"
              size="sm"
              onPress={handleClose}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              onPress={handleSubmit}
              disabled={isLoading || counter > 0}
              className="disabled:opacity-50"
            >
              <ButtonText>
                {isLoading
                  ? "Memproses..."
                  : counter > 0
                  ? `(${counter}) Simpan`
                  : "Simpan"}
              </ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
};

export default Materi;
