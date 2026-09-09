import { api } from "../../lib/axios";

export type Invoice = {
  id: string;
  orderId: string;
  customerId: string;
  restaurantId: string;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  issuedAt: string;
  paidAt: string | null;
  createdAt: string;
  orderStatus?: string;
  restaurantName?: string;
  customerName?: string;
};

export type InvoiceListResponse = {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type InvoiceListParams = {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  paymentStatus?: string;
};

export const invoiceService = {
  getUserInvoices: async (params?: InvoiceListParams): Promise<InvoiceListResponse> => {
    const response = await api.get('/invoices/user', { params });
    return response.data;
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  getAllInvoices: async (params?: InvoiceListParams): Promise<InvoiceListResponse> => {
    const response = await api.get('/invoices/admin', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/invoices/stats/admin');
    return response.data;
  },
};
