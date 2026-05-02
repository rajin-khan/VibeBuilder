import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useSidebar } from '@/components/ui-kit/sidebar';
import { AppSidebar, ProfileMenu } from '@/components/core';

export const MainLayout = () => {
  const { open, isMobile, setOpen } = useSidebar();
  const { pathname } = useLocation();
  const segments = pathname?.split('/').filter(Boolean);
  const firstSegment = segments?.[0] ?? undefined;
  const isEmailRoute = firstSegment === 'mail';
  const isChatRoute = firstSegment === 'chat';
  const isBuilderRoute = firstSegment === 'app';
  const isEditorRoute = pathname.startsWith('/app/sites/') && pathname.includes('/pages/');

  useEffect(() => {
    if (isBuilderRoute && !isMobile) {
      setOpen(false);
    }
  }, [isBuilderRoute, isMobile, setOpen]);

  const getMarginClass = () => {
    if (isMobile) return 'ml-0';
    if (isBuilderRoute) return open ? 'ml-[var(--sidebar-width)]' : 'ml-0';
    return open ? 'ml-[var(--sidebar-width)]' : 'ml-16';
  };

  const marginClass = getMarginClass();
  const contentPaddingClass = isEditorRoute
    ? 'p-0'
    : !isEmailRoute && !isChatRoute
      ? 'p-4 sm:p-6 md:p-8'
      : '';

  return (
    <div className="relative flex min-h-screen w-full">
      <div className="absolute left-0 top-0 h-full">
        <AppSidebar desktopCollapsible={isBuilderRoute ? 'offcanvas' : 'icon'} />
      </div>

      <div
        className={`flex min-h-screen w-full flex-col ${
          marginClass
        } transition-[margin-left] duration-300 ease-in-out`}
      >
        <div
          className={`flex min-h-screen bg-surface ${contentPaddingClass} ${open && !isMobile && !isBuilderRoute ? 'w-[calc(100dvw-var(--sidebar-width))]' : 'w-full'}`}
        >
          <Outlet />
        </div>
      </div>

      {!isEditorRoute && (
        <div className="fixed bottom-4 right-4 z-40 rounded-full border border-border bg-card/95 p-1.5 shadow-pop">
          <ProfileMenu side="top" align="end" sideOffset={12} />
        </div>
      )}
    </div>
  );
};
