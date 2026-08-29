import { userAdminService } from '@/services/admin/user/user.service';
import { useUserStore } from '@/stores/admin/userStore';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useUser = (id: string) => {
  const { setCurrentUser, setError } = useUserStore();

  const query = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => userAdminService.getOne(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (query.data) setCurrentUser(query.data);
  }, [query.data, setCurrentUser]);

  useEffect(() => {
    if (query.error) {
      const msg = (query.error as any)?.response?.data?.message || 'Failed to fetch user';
      setError(msg);
    }
  }, [query.error, setError]);

  return query;
};