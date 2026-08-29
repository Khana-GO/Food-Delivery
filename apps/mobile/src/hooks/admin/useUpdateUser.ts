import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/stores/admin/userStore';
import { userAdminService } from '@/services/admin/user/user.service';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { updateUser, setError } = useUserStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userAdminService.update(id, data),
    onSuccess: (data) => {
      updateUser(data.id, data);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      Alert.alert('Success', 'User updated successfully');
      if (router.canGoBack()) router.back();
      setTimeout(() => {
        // Ensure we are on users list, not dashboard
        try { router.replace('/(admin)/(tabs)/users' as any); } catch {}
      }, 100);
    },
    onError: (error: any) => {
      const msg = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join(', ')
        : error?.response?.data?.message || 'Failed to update user';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};