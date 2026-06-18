import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useWardrobe } from '../../hooks/useWardrobe';
import { ClothingItem } from '../../types';

const CATEGORIES = ["All", "Tops", "Bottoms", "Outerwear", "Shoes", "Accessories", "Dresses"];
const CATEGORY_MAP: Record<string, string> = {
  All: "all", Tops: "top", Bottoms: "bottom",
  Outerwear: "outerwear", Shoes: "shoes", Accessories: "accessory", Dresses: "dress",
};

export default function ClosetScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { items, isLoading, deleteItem } = useWardrobe(CATEGORY_MAP[activeCategory]);

  const filteredItems = search.trim()
    ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  const renderItem = ({ item }: { item: ClothingItem }) => (
    <TouchableOpacity 
      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container shadow-sm"
      onLongPress={() => deleteItem(item.id)}
    >
      <Image
        source={{ uri: item.clean_image_url || item.image_url }}
        className="w-full h-full object-cover"
      />
      <View className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 opacity-0 active:opacity-100 transition-opacity">
        <Text className="text-white text-xs font-semibold truncate">{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="pt-16 px-4 pb-4 border-b border-outline-variant/10 flex-row items-center gap-3">
        <View className="flex-1 relative">
          <TextInput
            className="w-full h-10 pl-10 pr-4 bg-surface-container-low rounded-xl border border-outline-variant/20 text-on-surface"
            placeholder="Search your closet..."
            value={search}
            onChangeText={setSearch}
          />
          {/* Search Icon would go here */}
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/wardrobe/add')}
          className="h-10 px-4 bg-primary rounded-xl flex-row items-center gap-1"
        >
          <Text className="text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View className="py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          <View className="flex-row gap-2">
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full border ${
                  activeCategory === cat 
                    ? "bg-primary border-primary" 
                    : "bg-transparent border-outline-variant/20"
                }`}
              >
                <Text className={`${activeCategory === cat ? "text-white" : "text-on-surface-variant"} text-xs font-semibold`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Items Grid */}
      <View className="flex-1 px-4 pb-24">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#e75a66" />
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-on-surface-variant text-lg text-center">
              {search ? "No matches found" : "Your closet is empty"}
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/wardrobe/add')}
              className="mt-4 px-8 py-3 bg-primary rounded-2xl"
            >
              <Text className="text-white font-bold">Add First Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
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
