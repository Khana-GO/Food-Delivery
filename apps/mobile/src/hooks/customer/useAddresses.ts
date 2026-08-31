import { addressService } from '@/services/customer/address.service';
import { useAddressStore } from '@/stores/customer/addressStore';
import { useQuery } from '@tanstack/react-query';

export const useAddresses = () => {
  const { setAddresses, setLoading, setError } = useAddressStore();

  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await addressService.getAddresses();
        setAddresses(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load addresses');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};