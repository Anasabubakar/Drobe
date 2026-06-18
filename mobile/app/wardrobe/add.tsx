import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { uploadClothingItem } from '../../hooks/useWardrobe';

interface QueueFile {
  id: string;
  uri: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

export default function WardrobeAddScreen() {
  const [queue, setQueue] = useState<QueueFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newItems: QueueFile[] = result.assets.map(asset => ({
        id: Math.random().toString(36).substring(7),
        uri: asset.uri,
        status: 'pending',
      }));
      setQueue(prev => [...prev, ...newItems]);
    }
  };

  const processUploads = async () => {
    const pending = queue.filter(i => i.status === 'pending');
    if (pending.length === 0) return;

    setProcessing(true);

    for (const item of pending) {
      setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i));
      
      try {
        const formData = new FormData();
        formData.append('image', {
          uri: item.uri,
          name: `upload_${item.id}.jpg`,
          type: 'image/jpeg',
        } as any);

        await uploadClothingItem(formData);
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'done' } : i));
      } catch (e: any) {
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', errorMsg: e.message } : i));
      }
    }

    setProcessing(false);
    Alert.alert('Success', 'Items added to your wardrobe', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/closet') }
    ]);
  };

  const removeItem = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
  };

  return (
    <View className="flex-1 bg-surface px-6 py-16">
      <View className="flex-row items-center justify-between mb-8">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-on-surface-variant text-lg">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-on-surface text-xl font-bold">Add to Closet</Text>
        <View className="w-10" />
      </View>

      <TouchableOpacity 
        onPress={pickImages}
        className="w-full aspect-video rounded-3xl border-2 border-dashed border-outline-variant/30 items-center justify-center bg-surface-container mb-8"
      >
        <Text className="text-primary text-lg font-bold mb-2">Pick Photos</Text>
        <Text className="text-on-surface-variant text-center text-sm px-8">
          Select one or multiple photos from your gallery
        </Text>
      </TouchableOpacity>

      <View className="flex-1">
        <Text className="text-on-surface-variant uppercase tracking-widest text-xs font-semibold mb-4">
          Queue ({queue.length})
        </Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="space-y-3">
            {queue.map(item => (
              <View key={item.id} className="flex-row items-center gap-3 bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/10 shadow-sm">
                <Image source={{ uri: item.uri }} className="w-16 h-16 rounded-xl" />
                <View className="flex-1">
                  <Text className="text-on-surface font-medium truncate w-40">Image_{item.id}</Text>
                  <Text className={`text-xs ${item.status === 'error' ? 'text-error' : 'text-on-surface-variant'}`}>
                    {item.status === 'uploading' && 'Uploading...'}
                    {item.status === 'done' && 'Added'}
                    {item.status === 'error' && item.errorMsg}
                    {item.status === 'pending' && 'Ready'}
                  </Text>
                </View>
                {item.status === 'pending' && (
                  <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Text className="text-error font-bold">Remove</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'uploading' && <ActivityIndicator size="small" color="#e75a66" />}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {queue.length > 0 && (
        <TouchableOpacity 
          onPress={processUploads}
          disabled={processing}
          className={`w-full h-14 rounded-2xl items-center justify-center mt-4 ${processing ? 'bg-primary/50' : 'bg-primary shadow-lg'}`}
        >
          {processing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Add to Closet</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
