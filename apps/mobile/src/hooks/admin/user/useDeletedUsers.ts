import { userAdminService } from '@/services/admin/user/user.service';
import { UserListFilters } from '@food_delivery/types';
import { useQuery } from '@tanstack/react-query';

export const useDeletedUsers = (filters?: UserListFilters, opts?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-deleted-users', filters],
    queryFn: () => userAdminService.getDeleted(filters),
    enabled: opts?.enabled ?? true,
    staleTime: 60 * 1000,
  });
};
