import { Category } from '@food_delivery/types';
import { create } from 'zustand';
interface CategoryState {
  // ─── State ───
  categories: Category[];
  currentCategory: Category | null;
  isLoading: boolean;
  error: string | null;

  // ─── Actions ───
  setCategories: (categories: Category[]) => void;
  setCurrentCategory: (category: Category | null) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearStore: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  // ─── Initial State ───
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,

  // ─── Actions ───
  setCategories: (categories) => set({ categories }),
  
  setCurrentCategory: (category) => set({ currentCategory: category }),
  
  addCategory: (category) =>
    set((state) => ({
      categories: [category, ...state.categories],
    })),
  
  updateCategory: (id, data) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
      currentCategory:
        state.currentCategory?.id === id
          ? { ...state.currentCategory, ...data }
          : state.currentCategory,
    })),
  
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      currentCategory:
        state.currentCategory?.id === id ? null : state.currentCategory,
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearStore: () =>
    set({
      categories: [],
      currentCategory: null,
      isLoading: false,
      error: null,
    }),
}));