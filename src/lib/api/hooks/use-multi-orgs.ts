import { useQuery } from '@tanstack/react-query';
import { getMultiOrgs } from '../services/multi-orgs.service';
import type { GetOrganizationsParams, GetOrganizationsResponse } from '../types/multi-orgs.types';
import { useAuthStore } from '@/state/store/auth';
import { getDemoOrganizations, isLocalDemoToken } from '@/modules/auth/utils/demo-session';

export const useGetMultiOrgs = (params?: GetOrganizationsParams) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLocalDemo = isLocalDemoToken(accessToken);

  return useQuery<GetOrganizationsResponse>({
    queryKey: ['getMultiOrgs', params],
    queryFn: () => getMultiOrgs(params),
    enabled: !isLocalDemo,
    initialData: isLocalDemo ? getDemoOrganizations : undefined,
  });
};
