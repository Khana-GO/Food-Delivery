import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@food_delivery/types';
import { Alert } from 'react-native';
import { useUserStore } from '@/stores/admin/userStore';
import { userAdminService } from '@/services/admin/user/user.service';

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();
  const { updateUser, setError } = useUserStore();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => userAdminService.changeRole(userId, role),
    onSuccess: (data) => {
      updateUser(data.id, { role: data.role });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      Alert.alert('Success', `Role updated to ${data.role}`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to change role';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};