import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user/user.service';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';

export const useUploadProfileImage = () => {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (image: any) => userService.uploadProfileImage(image),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      Alert.alert('Success', 'Profile image updated');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to upload image';
      Alert.alert('Error', message);
    },
  });
};