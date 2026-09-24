import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@khana_go_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export const POPULAR_SEARCHES = [
  'Momo',
  'Pizza',
  'Biryani',
  'Burger',
  'Chowmein',
  'Thakali Khana',
  'Sekuwa',
  'Fried Rice',
  'Coffee',
  'Dessert',
];

export function useSearchHistory() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored && mounted) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.filter((item) => typeof item === 'string' && item.trim().length > 0));
          }
        }
      } catch (err) {
        console.warn('Failed to load recent searches:', err);
      } finally {
        if (mounted) setIsLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Save query to history
  const addSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;

    setRecentSearches((prev) => {
      // Deduplicate case-insensitively and place the latest search at the front
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)).catch((err) =>
        console.warn('Failed to save search history:', err)
      );
      return updated;
    });
  }, []);

  // Remove single search item
  const removeSearch = useCallback(async (query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== query.toLowerCase());
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)).catch((err) =>
        console.warn('Failed to update search history:', err)
      );
      return updated;
    });
  }, []);

  // Clear all recent searches
  const clearHistory = useCallback(async () => {
    setRecentSearches([]);
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (err) {
      console.warn('Failed to clear search history:', err);
    }
  }, []);

  return {
    recentSearches,
    isLoaded,
    addSearch,
    removeSearch,
    clearHistory,
    popularSearches: POPULAR_SEARCHES,
  };
}
