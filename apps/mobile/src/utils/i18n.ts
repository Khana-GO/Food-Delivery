import { useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'ne';

export const Translations = {
  en: {
    greeting: 'Good Evening',
    searchPlaceholder: 'Search Food, Restaurants etc.',
    categories: 'Categories',
    offersNearYou: 'Offers Near You',
    newAndTrending: 'New & Trending',
    yourCart: 'Your Cart',
    checkout: 'Checkout',
    placeOrder: 'Place Order',
    liveOrderTracking: 'Live Order Tracking',
    estimatedArrival: 'Estimated Arrival',
    callDriver: 'Call Driver',
    message: 'Message',
    deliveryAddress: 'Delivery Address',
    paymentMethod: 'Payment Method',
    total: 'Total',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
  },
  ne: {
    greeting: 'शुभ साँझ (Namaste)',
    searchPlaceholder: 'खाना, रेस्टुरेन्ट खोज्नुहोस्...',
    categories: 'वर्गहरू (Categories)',
    offersNearYou: 'तपाईंको नजिकका अफरहरू',
    newAndTrending: 'नयाँ र लोकप्रिय',
    yourCart: 'तपाईंको कार्ट',
    checkout: 'चेकआउट (Checkout)',
    placeOrder: 'अर्डर पक्का गर्नुहोस्',
    liveOrderTracking: 'लाइभ अर्डर ट्र्याकिङ',
    estimatedArrival: 'अनुमानित आगमन समय',
    callDriver: 'ड्राइभरलाई कल गर्नुहोस्',
    message: 'मेसेज पठाउनुहोस्',
    deliveryAddress: 'डेलिभरी ठेगाना',
    paymentMethod: 'भुक्तानी माध्यम',
    total: 'जम्मा रकम',
    subtotal: 'उप-जम्मा (Subtotal)',
    deliveryFee: 'डेलिभरी शुल्क',
  },
};

let currentLang: LanguageCode = 'en';
const listeners = new Set<(lang: LanguageCode) => void>();

export const setLanguage = (lang: LanguageCode) => {
  currentLang = lang;
  listeners.forEach((fn) => fn(lang));
};

export const getLanguage = (): LanguageCode => currentLang;

export const useTranslation = () => {
  const [lang, setLang] = useState<LanguageCode>(currentLang);

  useEffect(() => {
    const handler = (newLang: LanguageCode) => setLang(newLang);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const t = (key: keyof typeof Translations['en']): string => {
    return Translations[lang][key] || Translations['en'][key] || key;
  };

  return { t, lang, setLanguage };
};
