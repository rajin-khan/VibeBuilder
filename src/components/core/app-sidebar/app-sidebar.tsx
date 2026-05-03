import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from '@/components/ui-kit/sidebar';
import { useTheme } from '@/styles/theme/theme-provider';
import { getSidebarStyle } from '@/lib/utils/sidebar-utils';
import { useFilteredMenu } from '@/hooks/use-filtered-menu';
import { LogoSection, MenuSection } from '@/components/core';
import { menuItems } from '@/constant/sidebar-menu';

type AppSidebarProps = {
  desktopCollapsible?: 'icon' | 'offcanvas';
};

/**
 * AppSidebar — product app shell sidebar.
 *
 * Renders the brand wordmark + a single grouping of navigation items.
 * Items flagged `hidden: true` in `sidebar-menu.ts` are filtered out by
 * `useFilteredMenu`; their routes stay wired so direct navigation works.
 */
export const AppSidebar = ({ desktopCollapsible = 'icon' }: AppSidebarProps) => {
  const { theme } = useTheme();
  const { pathname } = useLocation();
  const { setOpenMobile, open, isMobile, openMobile } = useSidebar();

  const filteredMenuItems = useFilteredMenu(menuItems);

  useEffect(() => {
    if (!isMobile) {
      setOpenMobile(false);
    }
  }, [pathname, setOpenMobile, isMobile]);

  const sidebarStyle = getSidebarStyle(isMobile, open, openMobile);

  if (isMobile && !openMobile) {
    return null;
  }

  return (
    <Sidebar
      className={`bg-card h-full ${isMobile ? 'mobile-sidebar' : ''}`}
      collapsible={isMobile ? 'none' : desktopCollapsible}
      style={sidebarStyle}
    >
      <SidebarHeader className={`${!open && !isMobile ? 'border-b' : ''} p-2`}>
        <LogoSection
          theme={theme}
          open={open}
          isMobile={isMobile}
          onClose={() => setOpenMobile(false)}
        />
      </SidebarHeader>

      <SidebarContent className="text-base ml-4 mr-2 my-3 text-high-emphasis font-normal overflow-x-hidden">
        <MenuSection
          items={filteredMenuItems}
          showText={open || isMobile}
          pathname={pathname}
          onItemClick={isMobile ? () => setOpenMobile(false) : undefined}
        />
      </SidebarContent>
    </Sidebar>
  );
};
