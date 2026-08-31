import { create } from 'zustand';

export type PaymentMethod = 'ONLINE' | 'OFFLINE';

interface CheckoutState {
  selectedAddressId: string | null;
  paymentMethod: PaymentMethod;
  notes: string;
  isProcessing: boolean;
  error: string | null;

  setSelectedAddressId: (id: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNotes: (notes: string) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  selectedAddressId: null,
  paymentMethod: 'OFFLINE',
  notes: '',
  isProcessing: false,
  error: null,

  setSelectedAddressId: (id) => set({ selectedAddressId: id }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setNotes: (notes) => set({ notes }),
  setProcessing: (processing) => set({ isProcessing: processing }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      selectedAddressId: null,
      paymentMethod: 'OFFLINE',
      notes: '',
      isProcessing: false,
      error: null,
    }),
}));