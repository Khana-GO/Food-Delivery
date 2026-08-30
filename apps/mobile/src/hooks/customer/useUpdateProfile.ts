import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { userService, UpdateProfilePayload } from '@/services/owner/user/user.service';
import { Alert } from 'react-native';
import { router } from 'expo-router';

export const useUpdateProfile = () => {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // API returns { user? } or raw user depending on interceptor – handle both
      const user = (updatedUser as any)?.user ?? updatedUser;
      if (user) setUser(user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update profile. Please try again.';
      Alert.alert('Error', Array.isArray(message) ? message[0] : message);
    },
  });
};
