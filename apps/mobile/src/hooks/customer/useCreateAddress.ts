import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { addressService } from '@/services/customer/address.service';
import { useAddressStore } from '@/stores/customer/addressStore';

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  const { addAddress, setLoading, setError } = useAddressStore();

  return useMutation({
    mutationFn: (data: any) => {
      setLoading(true);
      return addressService.create(data);
    },
    onSuccess: (data) => {
      addAddress(data);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setLoading(false);
      Alert.alert('Success', 'Address added successfully');
      router.back();
    },
    onError: (error: any) => {
      setLoading(false);
      const msg = error?.response?.data?.message || 'Failed to add address';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};