import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { BellIcon } from '@radix-ui/react-icons';
import { SidebarTrigger, useSidebar } from '@/components/ui-kit/sidebar';
import { Button } from '@/components/ui-kit/button';
import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui-kit/menubar';
import {
  LanguageSelector,
  ProfileMenu,
  AppSidebar,
  Notification,
  useGetNotifications,
  OrgSwitcher,
} from '@/components/core';

type NotificationsData = {
  notifications: any[];
  unReadNotificationsCount: number;
  totalNotificationsCount: number;
};

export const MainLayout = () => {
  const { open, isMobile, setOpen } = useSidebar();
  const { pathname } = useLocation();
  const segments = pathname?.split('/').filter(Boolean);
  const firstSegment = segments?.[0] ?? undefined;
  const isEmailRoute = firstSegment === 'mail';
  const isChatRoute = firstSegment === 'chat';
  const isBuilderRoute = firstSegment === 'app';

  useEffect(() => {
    if (isBuilderRoute && !isMobile) {
      setOpen(false);
    }
  }, [isBuilderRoute, isMobile, setOpen]);

  const { data: notificationsData } = useGetNotifications({
    Page: 0,
    PageSize: 10,
  });

  const notifications: NotificationsData = notificationsData ?? {
    notifications: [],
    unReadNotificationsCount: 0,
    totalNotificationsCount: 0,
  };

  const getMarginClass = () => {
    if (isMobile) return 'ml-0';
    if (isBuilderRoute) return open ? 'ml-[var(--sidebar-width)]' : 'ml-0';
    return open ? 'ml-[var(--sidebar-width)]' : 'ml-16';
  };

  const marginClass = getMarginClass();

  return (
    <div className="flex w-full min-h-screen relative">
      <div className="absolute left-0 top-0 h-full">
        <AppSidebar desktopCollapsible={isBuilderRoute ? 'offcanvas' : 'icon'} />
      </div>

      <div
        className={`flex flex-col w-full h-full ${
          marginClass
        } transition-[margin-left] duration-300 ease-in-out`}
      >
        <div className="sticky bg-card z-20 top-0 border-b border-border py-2 px-4 sm:px-6 md:px-8 flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="pl-0" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <Menubar className="border-none p-0">
              <MenubarMenu>
                <MenubarTrigger
                  asChild
                  className="cursor-pointer focus:bg-transparent data-[state=open]:bg-transparent p-0"
                >
                  <div className="relative">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                      <BellIcon
                        className="!h-5 !w-5 text-medium-emphasis"
                        data-testid="bell-icon"
                      />
                    </Button>
                    {notifications.unReadNotificationsCount > 0 && (
                      <span className="absolute top-2 right-2 inline-flex h-2 w-2 items-center justify-center rounded-full bg-error ring-2 ring-card" />
                    )}
                  </div>
                </MenubarTrigger>
                <Notification />
              </MenubarMenu>
            </Menubar>
            <LanguageSelector />
            <OrgSwitcher />
            <ProfileMenu />
          </div>
        </div>
        <div
          className={`flex h-full bg-surface ${!isEmailRoute && !isChatRoute && 'p-4 sm:p-6 md:p-8'} ${open && !isMobile && !isBuilderRoute ? 'w-[calc(100dvw-var(--sidebar-width))]' : 'w-full'}`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};
