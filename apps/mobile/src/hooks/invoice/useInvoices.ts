import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoiceService, InvoiceListParams } from '@/services/invoice/invoice.service';

export const useInvoices = (params?: InvoiceListParams) => {
  const stableKey = useMemo(
    () => ['invoices', JSON.stringify(params || {})],
    [params],
  );

  return useQuery({
    queryKey: stableKey,
    queryFn: () => invoiceService.getUserInvoices(params),
    staleTime: 60 * 1000,
  });
};
