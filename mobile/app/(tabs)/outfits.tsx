import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOutfits, OutfitWithItems } from '../../hooks/useOutfits';

const OCCASION_FILTERS = [
  { label: "All", value: "all" },
  { label: "Casual", value: "casual" },
  { label: "Work", value: "work" },
  { label: "Formal", value: "formal" },
  { label: "Gym", value: "gym" },
  { label: "Date", value: "date" },
];

export default function OutfitsScreen() {
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();
  const { outfits, isLoading, deleteOutfit } = useOutfits();

  const filteredOutfits = activeFilter === "all"
    ? outfits
    : outfits.filter(o => o.occasion === activeFilter);

  const renderItem = ({ item }: { item: OutfitWithItems }) => {
    const previewImg = item.ai_preview_url || item.items?.[0]?.clean_image_url || item.items?.[0]?.image_url;

    return (
      <TouchableOpacity 
        className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container shadow-sm border border-outline-variant/10"
      >
        {previewImg ? (
          <Image source={{ uri: previewImg }} className="w-full h-full object-cover" />
        ) : (
          <View className="flex-1 items-center justify-center bg-surface-container-low">
            <Text className="text-on-surface-variant">No Preview</Text>
          </View>
        )}
        <View className="absolute bottom-0 left-0 right-0 p-3 bg-black/40">
          <Text className="text-white font-semibold truncate">{item.name}</Text>
          <Text className="text-white/70 text-xs uppercase">{item.occasion}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => deleteOutfit(item.id)}
          className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full items-center justify-center"
        >
          <Text className="text-error font-bold">×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-surface">
      <View className="pt-16 px-4 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-on-surface text-2xl font-bold">Outfits</Text>
          <Text className="text-on-surface-variant">{outfits.length} saved looks</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/outfits/builder')}
          className="h-10 px-4 bg-primary rounded-xl flex-row items-center gap-1"
        >
          <Text className="text-white font-semibold">Build</Text>
        </TouchableOpacity>
      </View>

      <View className="py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          <View className="flex-row gap-2">
            {OCCASION_FILTERS.map(f => (
              <TouchableOpacity
                key={f.value}
                onPress={() => setActiveFilter(f.value)}
                className={`px-4 py-2 rounded-full border ${
                  activeFilter === f.value 
                    ? "bg-primary border-primary" 
                    : "bg-transparent border-outline-variant/20"
                }`}
              >
                <Text className={`${activeFilter === f.value ? "text-white" : "text-on-surface-variant"} text-xs font-semibold`}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="flex-1 px-4 pb-24">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#e75a66" />
          </View>
        ) : filteredOutfits.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-on-surface-variant text-lg text-center">No outfits found</Text>
            <TouchableOpacity 
              onPress={() => router.push('/outfits/builder')}
              className="mt-4 px-8 py-3 bg-primary rounded-2xl"
            >
              <Text className="text-white font-bold">Build an Outfit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredOutfits}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 12, justifyContent: 'space-between' }}
            contentContainerStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}
