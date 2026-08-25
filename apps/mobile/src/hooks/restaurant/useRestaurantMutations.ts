import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantService } from '@/services/restaurant/restaurant.service';
import type {
  RestaurantImageType,
  UploadableImage,
} from '@/services/restaurant/restaurant.service';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { CreateRestaurantPayload, Restaurant } from '@food_delivery/types';
import { toast } from '@/components/ui/toast';

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

const MY_RESTAURANTS_KEY = ['restaurants', 'my'] as const;

/**
 * Immediately patches the cached "my restaurants" list so the UI reflects
 * changes instantly, without waiting for the network refetch triggered by
 * invalidation. This keeps uploaded logos / covers visible right away.
 */
const patchCachedRestaurant = (
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  data: Partial<Restaurant>,
) => {
  const cached = queryClient.getQueryData<Restaurant[]>(MY_RESTAURANTS_KEY);
  if (!Array.isArray(cached)) return;
  queryClient.setQueryData<Restaurant[]>(
    MY_RESTAURANTS_KEY,
    cached.map((r) => (r.id === id ? { ...r, ...data } : r)),
  );
};

// ─── UPDATE TEXT DETAILS ───
export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();
  const { updateRestaurant, setLoading, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateRestaurantPayload>;
    }) => {
      setLoading(true);
      return restaurantService.update(id, data);
    },
    onSuccess: (restaurant, { id }) => {
      updateRestaurant(restaurant.id, restaurant);
      patchCachedRestaurant(queryClient, id, restaurant);
      queryClient.invalidateQueries({ queryKey: MY_RESTAURANTS_KEY });
      setLoading(false);
      toast.success('Your restaurant details have been saved.', 'Details updated');
    },
    onError: (error: any) => {
      setLoading(false);
      setError(getErrorMessage(error, 'Failed to update restaurant'));
      toast.error(getErrorMessage(error, 'Failed to update restaurant'), 'Could not save');
    },
  });
};

// ─── TOGGLE OPEN / CLOSED ───
export const useToggleOpenStatus = () => {
  const queryClient = useQueryClient();
  const { updateRestaurant, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: (id: string) => restaurantService.toggleOpenStatus(id),
    onSuccess: ({ isOpen }, id) => {
      updateRestaurant(id, { isOpen });
      patchCachedRestaurant(queryClient, id, { isOpen });
      queryClient.invalidateQueries({ queryKey: MY_RESTAURANTS_KEY });
      toast.success(
        isOpen
          ? 'Customers can now place orders.'
          : 'Your store is hidden until you reopen.',
        isOpen ? 'Accepting orders' : 'Orders paused',
      );
    },
    onError: (error: any) => {
      setError(getErrorMessage(error, 'Failed to change restaurant status'));
      toast.error(getErrorMessage(error, 'Failed to change restaurant status'));
    },
  });
};

// ─── REPLACE LOGO / COVER ───
export const useUpdateImage = () => {
  const queryClient = useQueryClient();
  const { updateRestaurant, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: ({
      id,
      type,
      image,
    }: {
      id: string;
      type: RestaurantImageType;
      image: UploadableImage;
    }) => restaurantService.updateImage(id, type, image),
    onSuccess: (result, { id, type }) => {
      updateRestaurant(id, result);
      // Patch the cache synchronously so the new photo renders instantly,
      // even before the invalidated query finishes refetching.
      patchCachedRestaurant(queryClient, id, result);
      queryClient.invalidateQueries({ queryKey: MY_RESTAURANTS_KEY });
      toast.success(
        type === 'logo'
          ? 'Your new logo is live on your storefront.'
          : 'Your new cover photo is live on your storefront.',
        type === 'logo' ? 'Logo updated' : 'Cover updated',
      );
    },
    onError: (error: any) => {
      setError(getErrorMessage(error, 'Failed to upload image'));
      toast.error(getErrorMessage(error, 'Failed to upload image'), 'Upload failed');
    },
  });
};

// ─── DELETE LOGO / COVER ───
export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  const { updateRestaurant, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: RestaurantImageType }) =>
      type === 'logo'
        ? restaurantService.deleteLogo(id)
        : restaurantService.deleteCover(id),
    onSuccess: (_, { id, type }) => {
      const cleared = type === 'logo' ? { logoUrl: undefined } : { coverImageUrl: undefined };
      updateRestaurant(id, cleared);
      patchCachedRestaurant(queryClient, id, cleared);
      queryClient.invalidateQueries({ queryKey: MY_RESTAURANTS_KEY });
      toast.success(type === 'logo' ? 'Logo removed.' : 'Cover photo removed.', 'Photo deleted');
    },
    onError: (error: any) => {
      setError(getErrorMessage(error, 'Failed to delete image'));
      toast.error(getErrorMessage(error, 'Failed to delete image'));
    },
  });
};

// ─── SOFT DELETE RESTAURANT ───
export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  const { removeRestaurant, setLoading, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: (id: string) => {
      setLoading(true);
      return restaurantService.delete(id);
    },
    onSuccess: (_, id) => {
      removeRestaurant(id);
      queryClient.invalidateQueries({ queryKey: MY_RESTAURANTS_KEY });
      setLoading(false);
      toast.success('Your restaurant has been removed.', 'Done');
    },
    onError: (error: any) => {
      setLoading(false);
      setError(getErrorMessage(error, 'Failed to delete restaurant'));
      toast.error(getErrorMessage(error, 'Failed to delete restaurant'));
    },
  });
};
