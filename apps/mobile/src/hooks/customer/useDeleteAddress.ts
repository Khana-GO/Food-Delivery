import { addressService } from '@/services/customer/address.service';
import { useAddressStore } from '@/stores/customer/addressStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  const { removeAddress, setLoading, setError } = useAddressStore();

  return useMutation({
    mutationFn: (id: string) => {
      setLoading(true);
      return addressService.delete(id);
    },
    onSuccess: (_, id) => {
      removeAddress(id);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setLoading(false);
      Alert.alert('Success', 'Address deleted');
    },
    onError: (error: any) => {
      setLoading(false);
      const msg = error?.response?.data?.message || 'Failed to delete address';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};