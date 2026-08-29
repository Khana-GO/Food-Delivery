import { userAdminService } from '@/services/admin/user/user.service';
import { useUserStore } from '@/stores/admin/userStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const useRestoreUser = () => {
  const queryClient = useQueryClient();
  const { updateUser, setError } = useUserStore();

  return useMutation({
    mutationFn: (id: string) => userAdminService.restore(id),
    onSuccess: (data) => {
      updateUser(data.id, data);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-deleted-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      Alert.alert('Success', 'User restored successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to restore user';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};