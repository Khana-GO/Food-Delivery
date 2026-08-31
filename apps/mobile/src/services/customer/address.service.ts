import { api } from '@/lib/axios';
import { Address, CreateAddressPayload, UpdateAddressPayload } from '@food_delivery/types';

export const addressService = {
  // ─── GET ADDRESSES ───
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get('/addresses');
    return response.data;
  },

  // ─── GET SINGLE ADDRESS ───
  getAddress: async (id: string): Promise<Address> => {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  // ─── CREATE ADDRESS ───
  create: async (data: CreateAddressPayload): Promise<Address> => {
    const response = await api.post('/addresses', data);
    return response.data;
  },

  // ─── UPDATE ADDRESS ───
  update: async (id: string, data: UpdateAddressPayload): Promise<Address> => {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  // ─── DELETE ADDRESS ───
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  // ─── SET DEFAULT ───
  setDefault: async (id: string): Promise<Address> => {
    const response = await api.patch(`/addresses/${id}/default`);
    return response.data;
  },
};