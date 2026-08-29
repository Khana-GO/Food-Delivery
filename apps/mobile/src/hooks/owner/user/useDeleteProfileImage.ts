import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/owner/user/user.service';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';

export const useDeleteProfileImage = () => {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.deleteProfileImage(),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      Alert.alert('Success', 'Profile image removed');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete image';
      Alert.alert('Error', message);
    },
  });
};