import { userAdminService } from '@/services/admin/user/user.service';
import { useUserStore } from '@/stores/admin/userStore';
import { UserListFilters } from '@food_delivery/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useUsers = (filters?: UserListFilters, opts?: { enabled?: boolean }) => {
  const { setUsers, setError } = useUserStore();
  const enabled = opts?.enabled ?? true;

  const query = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => userAdminService.getAll(filters),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (prev) => prev,
    notifyOnChangeProps: ['data', 'isFetching', 'isLoading', 'error'],
  });

  useEffect(() => {
    if (enabled && query.data) setUsers(query.data);
  }, [enabled, query.data, setUsers]);

  useEffect(() => {
    if (enabled && query.error) {
      const msg = (query.error as any)?.response?.data?.message || 'Failed to fetch users';
      setError(msg);
    }
  }, [enabled, query.error, setError]);

  return query;
};
