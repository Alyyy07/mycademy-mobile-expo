import { View, Image } from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { useDebouncedCallback } from "use-debounce";

import { images } from "@/constants/image";
import { Input, InputField, InputIcon, InputSlot } from "./ui/input";
import { SearchIcon } from "./ui/icon";

const Search = () => {
  const path = usePathname();
  const params = useLocalSearchParams<{ query?: string }>();
  const [search, setSearch] = useState(params.query || "");

  const debounceSearch = useDebouncedCallback(
    (text: string) => router.setParams({ query: text }),
    500
  );

  const handleSearch = (text: string) => {
    setSearch(text);
    debounceSearch(text);
  };

  return (
    <View className="flex flex-row items-center justify-between w-full px-4 rounded-lg bg-primary mt-5">
      <View className="flex-1 flex flex-row items-center text-white justify-start">
        <Input variant="noBorder" size="xl" className="w-full h-16 rounded-lg">
          <InputSlot className="pr-3">
            <InputIcon as={SearchIcon} size="xl" />
          </InputSlot>
          <InputField
            placeholder="Cari di sini..."
            value={search}
            onChangeText={handleSearch}
            className="text-white text-md font-montserratalternates-semibold"
            returnKeyType="next"
          />
        </Input>
      </View>
    </View>
  );
};

export default Search;
