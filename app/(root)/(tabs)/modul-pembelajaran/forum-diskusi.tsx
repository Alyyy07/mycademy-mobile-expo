// app/(protected)/forum-diskusi/[id].tsx
import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { router, useLocalSearchParams } from "expo-router";
import { fetchAPI } from "@/lib/app.constant";
import { useShowToast } from "@/lib/hooks";
import NoResult from "@/components/NoResult";

interface Message {
  id: number;
  sender_id: string;
  name: string;
  photo: string;
  role: string;
  content: string;
  created_at: string;
}

interface DiscussionState {
  messages: Message[];
}

const ForumDiskusi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [discussion, setDiscussion] = useState<DiscussionState | null>(null);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [materiTitle, setMateriTitle] = useState<string | null>(null);
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isClosed, setIsClosed] = useState(true);
  const showToast = useShowToast();
  const params = useLocalSearchParams<{ id: string }>();
  const flatListRef = useRef<FlatList<Message>>(null);

  const fetchDiscussion = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetchAPI(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/modul-pembelajaran/forum-diskusi?id=${params.id}&email=${user.email}`,
        "GET"
      );
      if (res.status === "success") {
        const { materi_title, is_closed, author_id, ...rawMsgs } = res.data;
        const messages = Object.values(rawMsgs).filter(
          (v): v is Message => typeof v !== "string"
        );

        setIsClosed(is_closed);
        setAuthorId(author_id);
        setMateriTitle(materi_title);

        if (messages.length) {
          const lastMsg = messages[messages.length - 1];
          const isNewMessage = lastMsg.id !== lastMessageId;

          setDiscussion({ messages });

          if (isFirstLoad || isNewMessage) {
            flatListRef.current?.scrollToEnd({ animated: !isFirstLoad });
            setLastMessageId(lastMsg.id);
            setIsFirstLoad(false); // Pastikan tidak scroll otomatis lagi kecuali ada pesan baru
          }
        }
      } else {
        showToast(res?.message ?? "Gagal memuat diskusi", "error");
      }
    } catch {
      showToast("Kesalahan jaringan", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const info = await SecureStore.getItemAsync("userInfo");
      if (!info) return router.replace("/sign-in");
      setUser(JSON.parse(info));
    })();
  }, []);
  useEffect(() => {
    if (user) {
      fetchDiscussion();
      const iv = setInterval(fetchDiscussion, 5_000);
      return () => clearInterval(iv);
    }
  }, [user]);

  const handleSend = async () => {
    if (!newMsg.trim() || !user) return;
    console.log({ materi_id: params.id, email: user.email, message: newMsg });
    try {
      const res = await fetchAPI(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/modul-pembelajaran/forum-diskusi/send`,
        "POST",
        { materi_id: params.id, email: user.email, message: newMsg }
      );
      if (res.status === "success") {
        showToast(res.message, "success");
      }
      setNewMsg("");
      fetchDiscussion();
    } catch {
      showToast("Gagal mengirim pesan", "error");
    }
  };

  return (
    <SafeAreaView className="bg-accent p-4 flex-1">
      <View className="flex flex-row justify-between items-center">
        <Text className="text-white font-montserrat-semibold text-xl">
          Forum Diskusi
        </Text>
        {!!isClosed && (
          <View className="p-2 bg-red-900 rounded-full">
            <Text className="text-white font-montserrat-semibold text-xs">
              Diskusi Ditutup
            </Text>
          </View>
        )}
      </View>
      <Text className="text-gray-400 font-montserratalternates text-base mb-4">
        {materiTitle}
      </Text>
      {!isLoading && discussion?.messages.length === 0 && (
        <NoResult message="Belum ada pesan" />
      )}
      <FlatList
        ref={flatListRef}
        data={discussion?.messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isMe = item.sender_id === authorId; // atau sesuai id
          return (
            <View className="mb-3">
              {!isMe && (
                <View className="flex flex-row mb-1">
                  <Image
                    source={{ uri: item?.photo }}
                    className="size-10 rounded-full"
                  />
                  <View className="ml-2">
                    <View className="flex flex-row gap-2 items-center">
                      <Text className="text-sm font-montserrat-semibold text-gray-300">
                        {item.name}
                      </Text>
                      <View
                        className={`p-1 rounded-lg  ${
                          item.role === "dosen"
                            ? "bg-primary-700"
                            : "bg-gray-700"
                        }`}
                      >
                        <Text className="text-xs text-white font-montserrat-semibold">
                          {item.role}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs font-montserrat text-gray-400 mt-1">
                      {item.created_at}
                    </Text>
                  </View>
                </View>
              )}
              <View
                className={`my-1 px-3 py-2 rounded-lg ${
                  isMe ? "self-end bg-blue-600" : "self-start bg-gray-700"
                }`}
              >
                <Text className="text-white">{item.content}</Text>
              </View>
              {isMe && (
                <View className="flex flex-row mb-1 self-end">
                  <Text className="text-xs font-montserrat text-gray-400 mt-1">
                    {item.created_at}
                  </Text>
                </View>
              )}
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        className="flex-1 mb-2"
      />
      {!isClosed && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-row items-center bg-primary-800 rounded-full px-4 py-2"
        >
          <TextInput
            className="flex-1 bg-white rounded-full px-4 py-2"
            placeholder="Tulis pesan..."
            readOnly={isClosed}
            placeholderTextColor="#A1A1A1"
            multiline
            numberOfLines={2}
            style={{ maxHeight: 100 }}
            value={newMsg}
            onChangeText={setNewMsg}
          />
          <TouchableOpacity onPress={handleSend} className="ml-2">
            <Text className="text-white font-montserrat-semibold">Kirim</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

export default ForumDiskusi;
