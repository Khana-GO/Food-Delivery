import { Address } from '@food_delivery/types';
import { create } from 'zustand';
interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  isLoading: boolean;
  error: string | null;

  setAddresses: (addresses: Address[]) => void;
  addAddress: (address: Address) => void;
  updateAddress: (id: string, data: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setSelectedAddress: (address: Address | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAddressStore = create<AddressState>((set) => ({
  addresses: [],
  selectedAddress: null,
  isLoading: false,
  error: null,

  setAddresses: (addresses) => set({ addresses }),
  addAddress: (address) => set((state) => ({ addresses: [...state.addresses, address] })),
  updateAddress: (id, data) =>
    set((state) => ({
      addresses: state.addresses.map((a) => (a.id === id ? { ...a, ...data } : a)),
      selectedAddress: state.selectedAddress?.id === id ? { ...state.selectedAddress, ...data } : state.selectedAddress,
    })),
  removeAddress: (id) =>
    set((state) => ({
      addresses: state.addresses.filter((a) => a.id !== id),
      selectedAddress: state.selectedAddress?.id === id ? null : state.selectedAddress,
    })),
  setSelectedAddress: (address) => set({ selectedAddress: address }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({ addresses: [], selectedAddress: null, isLoading: false, error: null }),
}));