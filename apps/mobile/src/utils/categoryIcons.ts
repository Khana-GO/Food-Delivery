/**
 * Category icons and UX helpers modeled after leading food delivery apps (Zomato/Swiggy).
 */

export const getCategoryIcon = (name?: string | null): string => {
  if (!name) return '🍽️';
  const lower = name.toLowerCase().trim();

  // Momo / Dumplings
  if (lower.includes('momo') || lower.includes('dumpling') || lower.includes('dim sum')) return '🥟';

  // Pizza & Italian
  if (lower.includes('pizza') || lower.includes('pasta') || lower.includes('italian')) return '🍕';

  // Burgers & Sandwiches
  if (lower.includes('burger') || lower.includes('sandwich') || lower.includes('sub')) return '🍔';

  // Biryani & Rice dishes
  if (lower.includes('biryani') || lower.includes('rice') || lower.includes('pulao') || lower.includes('fried rice')) return '🍛';

  // Chowmein & Noodles
  if (lower.includes('chowmein') || lower.includes('noodle') || lower.includes('thukpa') || lower.includes('ramen')) return '🍜';

  // Chiya, Tea, Coffee & Beverages
  if (
    lower.includes('chiya') ||
    lower.includes('tea') ||
    lower.includes('coffee') ||
    lower.includes('beverage') ||
    lower.includes('drink') ||
    lower.includes('shake') ||
    lower.includes('juice') ||
    lower.includes('boba') ||
    lower.includes('lassi')
  ) {
    return '☕';
  }

  // Bakery & Desserts
  if (
    lower.includes('bakery') ||
    lower.includes('cake') ||
    lower.includes('pastry') ||
    lower.includes('dessert') ||
    lower.includes('sweet') ||
    lower.includes('ice cream') ||
    lower.includes('waffle') ||
    lower.includes('donut')
  ) {
    return '🍰';
  }

  // Nepali Traditional / Thali / Khaja
  if (
    lower.includes('nepali') ||
    lower.includes('thali') ||
    lower.includes('khaja') ||
    lower.includes('dal bhat') ||
    lower.includes('newari') ||
    lower.includes('traditional')
  ) {
    return '🍱';
  }

  // Fast food & Snacks
  if (
    lower.includes('fast food') ||
    lower.includes('snack') ||
    lower.includes('fries') ||
    lower.includes('roll') ||
    lower.includes('samosa') ||
    lower.includes('chat') ||
    lower.includes('pani puri')
  ) {
    return '🍟';
  }

  // Chicken / BBQ / Sekuwa
  if (
    lower.includes('chicken') ||
    lower.includes('bbq') ||
    lower.includes('sekuwa') ||
    lower.includes('tandoori') ||
    lower.includes('roast') ||
    lower.includes('kebab') ||
    lower.includes('grill')
  ) {
    return '🍗';
  }

  // Healthy & Salads
  if (lower.includes('healthy') || lower.includes('salad') || lower.includes('soup') || lower.includes('diet')) return '🥗';

  return '🍽️';
};
