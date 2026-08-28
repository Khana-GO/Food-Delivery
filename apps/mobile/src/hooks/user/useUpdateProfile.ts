import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, UpdateProfilePayload } from '@/services/user/user.service';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';
import { router } from 'expo-router';

export const useUpdateProfile = () => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update the user in AuthContext
      setUser(updatedUser);
      // Invalidate any queries that might depend on user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update profile';
      Alert.alert('Error', message);
    },
  });
};