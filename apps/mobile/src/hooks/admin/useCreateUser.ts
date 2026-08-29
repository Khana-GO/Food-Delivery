import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/stores/admin/userStore';
import { userAdminService } from '@/services/admin/user/user.service';

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { addUser, setError } = useUserStore();

  return useMutation({
    mutationFn: (data: any) => userAdminService.create(data),
    onSuccess: (data) => {
      addUser(data);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      Alert.alert('Success', 'User created successfully');
      router.back();
    },
    onError: (error: any) => {
      const msg = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join(', ')
        : error?.response?.data?.message || 'Failed to create user';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};