import { User } from '@/types/user.type';
import { GetOrganizationsResponse } from '@/lib/api/types/multi-orgs.types';

export const LOCAL_DEMO_OWNER_ID = 'local-demo-user';
export const LOCAL_DEMO_EMAIL = 'demo@blockloom.local';

type DemoPayload = {
  org_id?: string;
  email?: string;
  vibe_builder_demo?: boolean;
};

const decodePayload = (token: string | null): DemoPayload | null => {
  if (!token) {
    return null;
  }

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(base64)))) as DemoPayload;
  } catch {
    return null;
  }
};

export const isLocalDemoToken = (token: string | null) => {
  const payload = decodePayload(token);
  return payload?.vibe_builder_demo === true || payload?.org_id === LOCAL_DEMO_OWNER_ID;
};

export const getDemoUser = (): User => ({
  itemId: LOCAL_DEMO_OWNER_ID,
  createdDate: new Date().toISOString(),
  lastUpdatedDate: new Date().toISOString(),
  language: 'en',
  salutation: null,
  firstName: 'Demo',
  lastName: 'Builder',
  email: LOCAL_DEMO_EMAIL,
  userName: LOCAL_DEMO_EMAIL,
  phoneNumber: null,
  roles: ['admin'],
  permissions: [],
  active: true,
  isVarified: true,
  profileImageUrl: '',
  lastLoggedInTime: new Date().toISOString(),
  isMfaVerified: false,
  mfaEnabled: false,
  userMfaType: 0,
  userCreationType: 0,
  lastLoggedInDeviceInfo: 'Local development',
  logInCount: 1,
  memberships: [
    {
      organizationId: LOCAL_DEMO_OWNER_ID,
      roles: ['admin'],
    },
  ],
});

export const getDemoOrganizations = (): GetOrganizationsResponse => ({
  isSuccess: true,
  totalCount: 1,
  organizations: [
    {
      itemId: LOCAL_DEMO_OWNER_ID,
      createdDate: new Date().toISOString(),
      lastUpdatedDate: new Date().toISOString(),
      createdBy: LOCAL_DEMO_OWNER_ID,
      language: 'en',
      lastUpdatedBy: LOCAL_DEMO_OWNER_ID,
      organizationIds: [LOCAL_DEMO_OWNER_ID],
      tags: ['local'],
      name: 'Blockloom Demo',
      isEnable: true,
    },
  ],
});

export const getDemoNotifications = () => ({
  notifications: [],
  unReadNotificationsCount: 0,
  totalNotificationsCount: 0,
});
