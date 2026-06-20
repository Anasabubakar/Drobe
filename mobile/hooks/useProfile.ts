import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getUserId } from '../lib/supabase';
import { Profile } from '../types';
import { uploadImageToSupabase } from '../lib/storage';

export function useProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<Profile | null> => {
      const uid = await getUserId();
      if (!uid) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (patch: Partial<Pick<Profile, 'full_name' | 'portrait_url'>>) => {
      const uid = await getUserId();
      if (!uid) throw new Error('Not authenticated');
      const { error } = await supabase.from('profiles').update(patch).eq('id', uid);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const uploadPortraitMutation = useMutation({
    mutationFn: async (localUri: string) => {
      const uid = await getUserId();
      if (!uid) throw new Error('Not authenticated');
      const url = await uploadImageToSupabase(localUri, 'portraits', uid, { maxWidth: 720 });
      const { error } = await supabase.from('profiles').update({ portrait_url: url }).eq('id', uid);
      if (error) throw error;
      return url;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  return {
    profile: data,
    isLoading,
    error,
    updateProfile: updateMutation.mutateAsync,
    uploadPortrait: uploadPortraitMutation.mutateAsync,
  };
}
