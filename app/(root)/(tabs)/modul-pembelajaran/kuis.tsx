import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useShowToast } from "@/lib/hooks";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import { fetchAPI, fixUrls } from "@/lib/app.constant";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import RenderHtml from "react-native-render-html";
import { Fab, FabIcon } from "@/components/ui/fab";
import { MenuIcon, MessageCircleIcon } from "@/components/ui/icon";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const Kuis = () => {
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [counter, setCounter] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const showToast = useShowToast();
  const params = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const { width } = useWindowDimensions();

  const handleClose = () => setShowActionsheet(false);
  const handleAlertClose = () => setShowSubmitDialog(false);

  useEffect(() => {
    (async () => {
      const info = await SecureStore.getItemAsync("userInfo");
      if (!info) return router.replace("/sign-in");
      setUser(JSON.parse(info));
    })();
  }, []);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const res = await fetchAPI(
          `${process.env.EXPO_PUBLIC_API_URL}/api/auth/modul-pembelajaran/kuis?id=${params.id}&email=${user.email}`,
          "GET"
        );
        if (res.status === "success") {
          const quiz = res.data;
          quiz.questions = quiz.questions.map((q: any) => ({
            ...q,
            question_text: fixUrls(q.question_text),
            options: q.options.map((o: any) => ({
              ...o,
              option_text: fixUrls(o.option_text),
            })),
          }));
          setQuiz(quiz);
          if (quiz.kuis_selesai && quiz.answers) {
            const prevAnswers: Record<number, number> = {};
            quiz.answers.forEach((a: any) => {
              prevAnswers[a.question_id] = a.option_id;
            });
            setAnswers(prevAnswers);
          }
          console.log("Quiz data:", quiz);
        } else showToast(res.message, "error");
      } catch {
        showToast("Kesalahan jaringan saat memuat kuis", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [user]);

  useEffect(() => {
    if (!showSubmitDialog) {
      setCounter(0);
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
    }
  }, [showSubmitDialog]);

  useEffect(() => {
    if (showSubmitDialog) {
      setCounter(5);
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
  }, [showSubmitDialog]);

  const selectOption = (qId: number, oId: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: oId }));
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    setIsLoading(true);

    // hitung jumlah jawaban benar
    const benar = quiz.questions.reduce((acc: number, q: any) => {
      const selected = answers[q.id];
      const opt = q.options.find((o: any) => o.id === selected);
      return acc + (opt?.is_correct ? 1 : 0);
    }, 0);

    const total = quiz.questions.length;

    const nilai = Math.round((benar / total) * 100);

    const detailJawaban = Object.entries(answers).map(([qid, oid]) => ({
      question_id: +qid,
      option_id: oid,
    }));

    try {
      const payload = {
        kuis_id: quiz.id,
        email: user.email,
        nilai,
        answers: detailJawaban, // kirim detail jawaban
      };
      console.log("Kirim payload:", payload);

      const res = await fetchAPI(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/modul-pembelajaran/kuis-selesai`,
        "POST",
        payload
      );

      if (res.status === "success") {
        showToast(`Kuis selesai! Nilai: ${nilai}%`, "success");

        // update state quiz supaya langsung tampak di UI
        setQuiz((q: any) => ({
          ...q,
          kuis_selesai: 1,
          nilai,
          tanggal_selesai: new Date().toISOString(),
          answers: detailJawaban, // simpan juga di state
        }));
        setShowQuiz(false);
        setShowHistory(false);
      } else {
        showToast(res.message, "error");
      }
    } catch (error) {
      showToast("Kesalahan jaringan saat submit kuis", "error");
      console.error("Error submitting quiz:", error);
    } finally {
      setIsLoading(false);
      setShowActionsheet(false);
      setShowSubmitDialog(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="p-5 bg-accent flex-1 justify-center items-center">
        <ActivityIndicator size="large" className="text-primary-300" />
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView className="p-5 bg-accent flex-1 justify-center">
        <Text className="text-white text-center">Kuis tidak ditemukan</Text>
      </SafeAreaView>
    );
  }

  const question = quiz.questions[currentIndex];
  const maxImageWidth = width - 150;

  return (
    <SafeAreaView className="p-5 bg-accent flex-1">
      <View className="flex-row justify-between items-center mb-4">
        <Heading size="lg" className="mb-2 text-white">
          {quiz.title}
        </Heading>
        {quiz.kuis_selesai ? (
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
      <Text className="text-gray-200 mb-3">{quiz.description}</Text>
      {quiz.kuis_selesai && quiz.tanggal_selesai ? (
        <View className="mb-4 flex flex-row justify-between items-center">
          <Text className="text-gray-300 text-sm">
            Selesai pada:{" "}
            {format(
              new Date(quiz.tanggal_selesai),
              "EEEE, dd MMMM yyyy, HH:mm",
              {
                locale: id,
              }
            )}
          </Text>
        </View>
      ) : null}

      {!quiz.kuis_selesai && !showQuiz ? (
        <Button
          action="primary"
          className="m-5 mt-auto rounded-3xl h-16 bg-primary py-3 shadow-lg shadow-black disabled:opacity-50"
          onPress={() => setShowQuizDialog(true)}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ButtonText className="text-white text-lg font-montserrat-semibold">
              Mulai Kuis
            </ButtonText>
          )}
        </Button>
      ) : !quiz.kuis_selesai && showQuiz ? (
        <ScrollView
          className="flex-1 h-full"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-gray-200 mb-2 font-montserrat-semibold">
            Soal {currentIndex + 1} dari {quiz.questions.length}
          </Text>
          <View className="bg-primary p-3 rounded-xl mb-6">
            <RenderHtml
              contentWidth={maxImageWidth}
              source={{ html: question.question_text }}
              ignoredStyles={["width", "height", "color"]}
              baseStyle={{ color: "white" }}
              computeEmbeddedMaxWidth={() => maxImageWidth}
              renderersProps={{
                img: {
                  enableExperimentalPercentWidth: true,
                },
              }}
            />
          </View>

          {question.options.map((opt: any) => {
            const isSelected = answers[question.id] === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                className={`flex flex-row items-center gap-2 p-3 mb-2 w-full rounded border ${
                  isSelected ? "bg-primary" : ""
                }`}
                onPress={() => selectOption(question.id, opt.id)}
              >
                <Text className={isSelected ? "text-white" : "text-gray-200"}>
                  {String.fromCharCode(65 + question.options.indexOf(opt))}.
                </Text>
                <RenderHtml
                  contentWidth={maxImageWidth}
                  source={{ html: opt.option_text }}
                  ignoredStyles={["width", "height", "color"]}
                  baseStyle={{ color: "white" }}
                  computeEmbeddedMaxWidth={() => maxImageWidth}
                  renderersProps={{
                    img: { enableExperimentalPercentWidth: true },
                  }}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : quiz.kuis_selesai && showHistory ? (
        <ScrollView
          className="flex-1 h-full"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-gray-200 mb-2 font-montserrat-semibold">
            Soal {currentIndex + 1} dari {quiz.questions.length}
          </Text>
          <View className="bg-primary p-3 rounded-xl mb-6">
            <RenderHtml
              contentWidth={maxImageWidth}
              source={{ html: question.question_text }}
              ignoredStyles={["width", "height", "color"]}
              baseStyle={{ color: "white" }}
              computeEmbeddedMaxWidth={() => maxImageWidth}
              renderersProps={{
                img: {
                  enableExperimentalPercentWidth: true,
                },
              }}
            />
          </View>

          {question.options.map((opt: any) => {
            const isSelected = answers[question.id] === opt.id;
            const isCorrect = opt.is_correct === 1;
            return (
              <TouchableOpacity
                key={opt.id}
                className={`flex flex-row items-center gap-2 p-3 mb-2 w-full rounded border ${
                  isSelected && !quiz.kuis_selesai ? "bg-primary" : ""
                }
            ${quiz.kuis_selesai && isCorrect ? "bg-green-600" : ""}
            ${
              quiz.kuis_selesai && isSelected && !isCorrect ? "bg-red-600" : ""
            }`}
                disabled={!!quiz.kuis_selesai}
              >
                <Text
                  className={
                    answers[question.id] === opt.id
                      ? "text-white"
                      : "text-gray-200"
                  }
                >
                  {String.fromCharCode(65 + question.options.indexOf(opt))}.
                </Text>
                <RenderHtml
                  contentWidth={maxImageWidth}
                  source={{ html: opt.option_text }}
                  ignoredStyles={["width", "height", "color"]}
                  baseStyle={{ color: "white" }}
                  computeEmbeddedMaxWidth={() => maxImageWidth}
                  renderersProps={{
                    img: { enableExperimentalPercentWidth: true },
                  }}
                />
              </TouchableOpacity>
            );
          })}
          <View className="pt-6 flex gap-14">
            {quiz?.kuis_selesai && showHistory ? (
              <View
                className={`flex-row justify-between mt-2 ${
                  currentIndex > 0 ? "" : "ml-auto"
                }`}
              >
                {currentIndex > 0 ? (
                  <Button
                    action="secondary"
                    disabled={currentIndex === 0}
                    onPress={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                  >
                    <ButtonText>Prev</ButtonText>
                  </Button>
                ) : null}
                {currentIndex < quiz.questions.length - 1 ? (
                  <Button
                    action="secondary"
                    onPress={() =>
                      setCurrentIndex((i) =>
                        Math.min(i + 1, quiz.questions.length - 1)
                      )
                    }
                  >
                    <ButtonText>Next</ButtonText>
                  </Button>
                ) : null}
              </View>
            ) : null}
            <Button
              action="primary"
              className="m-5 mt-auto rounded-3xl h-16 bg-primary py-3 shadow-lg shadow-black disabled:opacity-50"
              onPress={() => setShowHistory(false)}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ButtonText className="text-white text-lg font-montserrat-semibold">
                  Kembali
                </ButtonText>
              )}
            </Button>
          </View>
        </ScrollView>
      ) : quiz.kuis_selesai && !showHistory ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-300 text-center mb-6 text-7xl">
            {quiz.nilai}
          </Text>
          {quiz.can_view_history ? (
          <Button
            action="primary"
            className=" rounded-3xl h-16 bg-primary py-3 shadow-lg shadow-black disabled:opacity-50"
            onPress={() => setShowHistory(true)}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ButtonText className="text-white text-lg font-montserrat-semibold">
                Lihat Riwayat Jawaban
              </ButtonText>
            )}
          </Button>
          ) : (
            <Text className="text-gray-400 text-sm mt-2">
              Riwayat jawaban tidak tersedia
            </Text>
          )}
        </View>
      ) : null}

      {!quiz?.kuis_selesai && showQuiz ? (
        <Fab
          size="lg"
          className="bg-primary-800 h-16 w-16 border-0 shadow-lg shadow-black"
          onPress={() => setShowActionsheet(true)}
          isDisabled={isLoading}
          placement="bottom right"
          isHovered={false}
          isPressed={false}
        >
          <FabIcon as={MenuIcon} />
        </Fab>
      ) : null}
      <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="m-0 p-0 bg-primary-900 border-0 rounded-t-3xl">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View className="flex flex-row flex-wrap justify-center -mx-2 gap-x-3 p-4">
            {quiz.questions.map((q: any, index: number) => {
              const isAnswered = answers[q.id] !== undefined;
              return (
                <TouchableOpacity
                  key={q.id}
                  className={` w-1/5 mb-4 rounded-lg justify-center items-center h-14 ${
                    isAnswered ? "bg-green-600" : "bg-gray-400"
                  }
          `}
                  onPress={() => {
                    setCurrentIndex(index);
                    handleClose();
                  }}
                >
                  <Text className="text-white font-bold">{index + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="px-4 pt-2 pb-4">
            <Button
              action="primary"
              disabled={Object.keys(answers).length !== quiz.questions.length}
              className={`
        m-5 mt-auto 
        rounded-3xl h-16 bg-primary 
        ${
          Object.keys(answers).length !== quiz.questions.length
            ? "opacity-50"
            : ""
        }
        py-3 shadow-lg shadow-black disabled:opacity-50
      `}
              onPress={() => {
                setShowSubmitDialog(true);
              }}
            >
              <ButtonText className="text-white text-lg font-montserrat-semibold">
                Submit Kuis
              </ButtonText>
            </Button>
          </View>
        </ActionsheetContent>
      </Actionsheet>
      <AlertDialog
        isOpen={showSubmitDialog}
        onClose={handleAlertClose}
        closeOnOverlayClick={false}
        size="md"
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className={"bg-primary-900 border-0"}>
          <AlertDialogHeader className="flex flex-col items-start mb-3">
            <Heading size="lg" className="font-semibold text-white">
              Apakah anda yakin ingin mengakhiri kuis?
            </Heading>
            <Text className="text-md text-gray-300 mt-1">
              Jawaban tidak dapat diubah setelah disubmit.
            </Text>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              action="secondary"
              size="sm"
              onPress={handleAlertClose}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              onPress={submitQuiz}
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
      <AlertDialog
        isOpen={showQuizDialog}
        onClose={() => setShowQuizDialog(false)}
        closeOnOverlayClick={false}
        size="md"
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className={"bg-primary-900 border-0"}>
          <AlertDialogHeader className="flex flex-col items-start mb-3">
            <Heading size="lg" className="font-semibold text-white">
              Apakah anda yakin ingin memulai kuis?
            </Heading>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              action="secondary"
              size="sm"
              onPress={() => setShowQuizDialog(false)}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              onPress={() => {
                setShowQuiz(true);
                setShowQuizDialog(false);
              }}
            >
              <ButtonText>Mulai</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
};

export default Kuis;
