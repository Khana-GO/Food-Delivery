import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/stores/admin/userStore';
import { userAdminService } from '@/services/admin/user/user.service';

export const usePermanentDeleteUser = () => {
  const queryClient = useQueryClient();
  const { removeUser, setError } = useUserStore();

  return useMutation({
    mutationFn: (id: string) => userAdminService.permanentDelete(id),
    onSuccess: (_, id) => {
      removeUser(id);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-deleted-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      Alert.alert('Success', 'User permanently deleted');
      router.back();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to permanently delete user';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};