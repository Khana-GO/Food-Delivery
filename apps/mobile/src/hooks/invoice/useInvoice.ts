import { useQuery } from '@tanstack/react-query';
import { invoiceService } from '@/services/invoice/invoice.service';

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getInvoice(id),
    enabled: !!id,
    staleTime: 60 * 1000,
    retry: 1,
  });
};
