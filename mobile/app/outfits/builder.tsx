import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useOutfits } from '../../hooks/useOutfits';
import { ClothingItem } from '../../types';

const SLOTS = ["Top", "Bottom", "Outerwear", "Shoes"] as const;
type Slot = typeof SLOTS[number];

const SLOT_CATEGORY_MAP: Record<Slot, string[]> = {
  Top: ["top"],
  Bottom: ["bottom", "dress"],
  Outerwear: ["outerwear"],
  Shoes: ["shoes"],
};

const OCCASIONS = [
  { value: "casual", label: "Casual" },
  { value: "work", label: "Work" },
  { value: "formal", label: "Formal" },
  { value: "gym", label: "Gym" },
  { value: "date", label: "Date" },
  { value: "other", label: "Other" },
];

export default function OutfitBuilderScreen() {
  const router = useRouter();
  const { items: closet, isLoading: loadingCloset } = useWardrobe('all');
  const { saveOutfit } = useOutfits();
  
  const [canvas, setCanvas] = useState<Partial<Record<Slot, ClothingItem>>>({});
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState("casual");
  const [saving, setSaving] = useState(false);

  const assignItem = (item: ClothingItem) => {
    const slot = SLOTS.find(s => SLOT_CATEGORY_MAP[s].includes(item.category));
    if (slot) setCanvas(prev => ({ ...prev, [slot]: item }));
  };

  const removeSlot = (slot: Slot) => {
    setCanvas(prev => {
      const n = { ...prev };
      delete n[slot];
      return n;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please give your outfit a name");
      return;
    }
    setSaving(true);
    try {
      const item_ids = Object.values(canvas).map(i => i!.id);
      await saveOutfit({ name: name.trim(), occasion, item_ids });
      Alert.alert("Success", "Outfit saved!");
      router.replace('/(tabs)/outfits');
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-surface pt-16">
      <View className="px-4 pb-4 flex-row items-center justify-between border-b border-outline-variant/10">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-on-surface-variant text-lg">Back</Text>
        </TouchableOpacity>
        <Text className="text-on-surface text-xl font-bold">Outfit Builder</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={saving}
          className="h-10 px-4 bg-primary rounded-xl"
        >
          <Text className="text-white font-semibold">{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 flex-row">
        {/* Closet Sidebar */}
        <View className="w-1/3 bg-surface-container-low p-2">
          <Text className="text-on-surface-variant uppercase tracking-widest text-xs font-semibold mb-2 px-2">Closet</Text>
          {loadingCloset ? (
            <ActivityIndicator className="mt-4" />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-center gap-2">
                {closet.map(item => (
                  <TouchableOpacity 
                    key={item.id} 
                    onPress={() => assignItem(item)}
                    className="w-16 h-16 rounded-lg overflow-hidden bg-surface border border-outline-variant/20"
                  >
                    <Image source={{ uri: item.clean_image_url || item.image_url }} className="w-full h-full object-cover" />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Canvas Area */}
        <View className="flex-1 p-4">
          <View className="flex-row gap-2 mb-4">
            <TextInput
              className="flex-1 h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface"
              placeholder="Outfit name..."
              value={name}
              onChangeText={setName}
            />
            <View className="h-10 px-2 bg-surface-container-low border border-outline-variant/20 rounded-xl justify-center">
              <Text className="text-on-surface text-xs">{occasion}</Text>
              {/* Simplification: Occasion is hardcoded to casual for now or could be a modal */}
            </View>
          </View>

          <View className="space-y-3">
            {SLOTS.map(slot => {
              const item = canvas[slot];
              return (
                <View key={slot} className="flex-row items-center gap-3">
                  <Text className="text-on-surface-variant uppercase tracking-widest text-xs font-semibold w-20">{slot}</Text>
                  <View className={`flex-1 h-20 rounded-2xl border-2 border-dashed overflow-hidden ${item ? "border-transparent" : "border-outline-variant/25"}`}>
                    {item ? (
                      <View className="flex-1 relative">
                        <Image source={{ uri: item.clean_image_url || item.image_url }} className="w-full h-full object-cover" />
                        <TouchableOpacity 
                          onPress={() => removeSlot(slot)}
                          className="absolute top-1 right-1 w-6 h-6 bg-white/80 rounded-full items-center justify-center"
                        >
                          <Text className="text-on-surface font-bold">×</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Text className="text-on-surface-variant/50 text-xs">Tap an item</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
