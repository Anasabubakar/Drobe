import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOutfits, OutfitWithItems } from '../../hooks/useOutfits';

export default function DashboardScreen() {
  const router = useRouter();
  const { outfits, isLoading } = useOutfits();

  const renderOutfit = ({ item }: { item: OutfitWithItems }) => {
    const previewImg = item.ai_preview_url || item.items?.[0]?.clean_image_url || item.items?.[0]?.image_url;
    return (
      <TouchableOpacity 
        onPress={() => router.push('/(tabs)/outfits')}
        className="w-64 bg-surface-container-lowest rounded-3xl p-2 mr-4 shadow-sm border border-outline-variant/10"
      >
        <View className="aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container mb-3">
          {previewImg ? (
            <Image source={{ uri: previewImg }} className="w-full h-full object-cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-on-surface-variant">No Preview</Text>
            </View>
          )}
        </View>
        <View className="flex-row justify-between items-center px-1">
          <View>
            <Text className="text-on-surface-variant uppercase tracking-wider text-xs font-semibold">{item.name}</Text>
            {item.occasion && <Text className="text-on-surface-variant/50 text-[10px] capitalize">{item.occasion}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-surface">
      <View className="pt-16 px-6 pb-8">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-primary text-3xl font-black tracking-tighter">DROBE</Text>
          <TouchableOpacity className="p-2 bg-surface-container rounded-full">
            <Text className="text-on-surface-variant">🔔</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center mb-12">
          <View className="w-full aspect-[3/4] rounded-3xl overflow-hidden mb-6 shadow-lg">
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU_76Iz-L-CRP_sPLAlqJxJ0MMHT1xt09lBq6h0Oxu8J_9ylFM8oy9j9FIhmSu6rpLdB6ux3be0zhGbxpYad7UH3pAZoGZ770DVGQJ4dowyTZfZh55Qud4pi5YVYBSZBvsOkJE_ejJ_kpDYbnDhWpxQST6xwI8DdllfkcbdmxMkLsiZOWl5FfSRK5S0So2t5_Pwqnc9oGtmjf3QsvUis3Xg1s5P28wKSbVPZinju1uXJsh7Hiz4CrJCsMbVL0nKYgxabKDJ0a8Gnag' }} 
              className="w-full h-full object-cover" 
            />
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/outfits/builder')}
            className="w-full h-14 bg-primary rounded-2xl items-center justify-center shadow-lg"
          >
            <Text className="text-white font-bold text-lg">Get Dressed Now</Text>
          </TouchableOpacity>
        </View>

        <View>
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-on-surface text-2xl font-bold">Quick Picks</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/outfits')}>
              <Text className="text-primary font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#e75a66" />
          ) : outfits.length === 0 ? (
            <View className="bg-surface-container-lowest rounded-2xl p-8 items-center border border-outline-variant/10">
              <Text className="text-on-surface-variant text-center mb-4">No outfits yet — build your first look</Text>
              <TouchableOpacity 
                onPress={() => router.push('/outfits/builder')}
                className="px-6 py-2 bg-primary rounded-xl"
              >
                <Text className="text-white font-bold">Build Outfit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={outfits.slice(0, 6)}
              renderItem={renderOutfit}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
