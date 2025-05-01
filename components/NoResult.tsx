import { View, Text, Image } from 'react-native'
import React from 'react'
import { images } from '@/constants/image'

const NoResult = ({message}:{message?:string}) => {
  return (
    <View className='flex items-center my-5'>
      <Image source={images.noResult} style={{ width: '90%', height: 320 }} resizeMode='contain' />
      <Text className='text-2xl font-rubik-bold text-white mt-5'>Tidak ada hasil</Text>
      <Text className='text-base text-white mt-2'>{message ?? "Tidak ada data yang ditemukan"}</Text>
    </View>
  )
}

export default NoResult