import { View, Text, Image, Touchable } from 'react-native'
import React from 'react'
import { images } from '@/constants/image'
import { Feather, Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import { RelativePathString, router, usePathname } from 'expo-router'

const NoResult = ({message}:{message?:string}) => {
  const pathname = usePathname();

  const handleReload = () => {
  router.replace(pathname as RelativePathString);
  }

  return (
    <View className='flex items-center my-5'>
      <Image source={images.noResult} style={{ width: '90%', height: 320 }} resizeMode='contain' />
      <Text className='text-2xl font-rubik-bold text-white mt-5'>Tidak ada hasil</Text>
      <Text className='text-base text-white mt-2 mb-3'>{message ?? "Tidak ada data yang ditemukan"}</Text>
      <TouchableOpacity className='pt-4 rounded-full' onPress={handleReload}>
        <Ionicons name="refresh" size={24} color="#ffff" />
      </TouchableOpacity>
    </View>
  )
}

export default NoResult