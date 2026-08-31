import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useAddressStore } from '@/stores/customer/addressStore';
import { addressService } from '@/services/customer/address.service';

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  const { updateAddress, setLoading, setError } = useAddressStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      setLoading(true);
      return addressService.update(id, data);
    },
    onSuccess: (data) => {
      updateAddress(data.id, data);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setLoading(false);
      Alert.alert('Success', 'Address updated successfully');
      router.back();
    },
    onError: (error: any) => {
      setLoading(false);
      const msg = error?.response?.data?.message || 'Failed to update address';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};