import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoiceService, InvoiceListParams } from '@/services/invoice/invoice.service';

export const useAllInvoices = (params?: InvoiceListParams) => {
  const stableKey = useMemo(
    () => ['all-invoices', JSON.stringify(params || {})],
    [params],
  );

  return useQuery({
    queryKey: stableKey,
    queryFn: () => invoiceService.getAllInvoices(params),
    staleTime: 60 * 1000,
  });
};

export const useInvoiceStats = () => {
  return useQuery({
    queryKey: ['invoice-stats'],
    queryFn: () => invoiceService.getStats(),
    staleTime: 120 * 1000,
  });
};
