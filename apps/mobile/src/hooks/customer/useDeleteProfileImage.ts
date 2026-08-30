import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/owner/user/user.service';
import { Alert } from 'react-native';
import { toast } from '@/components/ui/toast';

export const useDeleteProfileImage = () => {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.deleteProfileImage(),
    onSuccess: (updatedUser) => {
      const user = (updatedUser as any)?.user ?? updatedUser;
      if (user) setUser(user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile photo removed');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to remove image';
      Alert.alert('Error', Array.isArray(message) ? message[0] : message);
    },
  });
};
