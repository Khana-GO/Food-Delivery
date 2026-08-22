import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(255, 'Slug must not exceed 255 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  phone: z.string()
    .regex(/^[9][8|6|7][0-9]{8}$/, 'Phone number must be a valid Nepal phone number (10 digits)')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
  address: z.string()
    .min(5, 'Address must be at least 5 characters'),
  wardNumber: z.number().min(1).max(35).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  cuisineType: z.string().min(1, 'Cuisine type is required'),
  openingTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Opening time must be in HH:MM:SS format')
    .optional(),
  closingTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Closing time must be in HH:MM:SS format')
    .optional(),
  deliveryFee: z.number().min(0).max(200).optional(),
  minimumOrderAmount: z.number().min(0).optional(),
  estimatedDeliveryTime: z.number().min(10).max(120).optional(),
});

export type CreateRestaurantFormData = z.infer<typeof createRestaurantSchema>;