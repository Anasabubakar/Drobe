import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function InsightsScreen() {
  return (
    <ScrollView className="flex-1 bg-surface px-6 pt-16">
      <View className="mb-8">
        <Text className="text-on-surface text-2xl font-bold">Wardrobe Insights</Text>
        <Text className="text-on-surface-variant">Data-driven styling for your collection.</Text>
      </View>

      <View className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 mb-6 shadow-sm">
        <Text className="text-on-surface-variant uppercase tracking-widest text-xs font-semibold mb-1">Total Wardrobe Value</Text>
        <Text className="text-primary text-3xl font-bold">$12,450.00</Text>
        <View className="mt-4 h-32 bg-surface-container rounded-xl items-end justify-end p-2 gap-1 flex-row">
          {[40, 70, 45, 80, 60, 100].map((h, i) => (
            <View key={i} style={{ height: `${h}%` }} className="w-4 bg-primary rounded-t-sm" />
          ))}
        </View>
        <View className="flex-row justify-between mt-2">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
            <Text key={m} className="text-on-surface-variant text-[10px]">{m}</Text>
          ))}
        </View>
      </View>

      <View className="bg-primary p-6 rounded-3xl mb-6">
        <Text className="text-white text-xl font-bold mb-2">Cost Per Wear Leader</Text>
        <Text className="text-white/90 mb-4">Your "Classic Silk Shirt" has reached an incredible $0.45 per wear.</Text>
        <TouchableOpacity className="bg-white px-6 py-2 rounded-xl self-start">
          <Text className="text-primary font-bold">View Item</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-on-surface text-xl font-bold mb-4">Most Worn Items</Text>
      <View className="flex-row flex-wrap gap-4 mb-12">
        {[1, 2, 3, 4].map(i => (
          <View key={i} className="w-[45%] aspect-[3/4] bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10">
            <View className="flex-1 items-center justify-center">
              <Text className="text-on-surface-variant">Item {i}</Text>
            </View>
            <View className="p-2 bg-white">
              <Text className="text-on-surface font-semibold text-xs">Item Name {i}</Text>
              <View className="w-full h-1 bg-surface-container-highest rounded-full mt-1 overflow-hidden">
                <View style={{ width: `${Math.random() * 100}%` }} className="h-full bg-primary" />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
