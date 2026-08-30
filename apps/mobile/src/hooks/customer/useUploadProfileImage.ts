import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/owner/user/user.service';
import { Alert } from 'react-native';
import { toast } from '@/components/ui/toast';

export const useUploadProfileImage = () => {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (image: any) => userService.uploadProfileImage(image),
    onSuccess: (updatedUser) => {
      const user = (updatedUser as any)?.user ?? updatedUser;
      if (user) setUser(user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile image updated');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to upload image';
      Alert.alert('Upload failed', Array.isArray(message) ? message[0] : message);
    },
  });
};
