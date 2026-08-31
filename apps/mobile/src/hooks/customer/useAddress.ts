import { addressService } from '@/services/customer/address.service';
import { useQuery } from '@tanstack/react-query';

export const useAddress = (id?: string) => {
  return useQuery({
    queryKey: ['address', id],
    queryFn: () => addressService.getAddress(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
};
