import { MenuItem } from '../models/sidebar';

const createMenuItem = (
  id: string,
  name: string,
  path: string,
  icon?: MenuItem['icon'],
  options: Partial<Omit<MenuItem, 'id' | 'name' | 'path' | 'icon'>> = {}
): MenuItem => ({
  id,
  name,
  path,
  icon,
  ...options,
});

const createMenuItemWithChildren = (
  id: string,
  name: string,
  path: string,
  icon: MenuItem['icon'],
  children: MenuItem[],
  options: Partial<Omit<MenuItem, 'id' | 'name' | 'path' | 'icon' | 'children'>> = {}
): MenuItem => ({
  id,
  name,
  path,
  icon,
  children,
  ...options,
});

/**
 * Sidebar navigation. Blockloom is a focused product so only the workspace + a
 * single Settings entry are shown by default. Every other item is `hidden:
 * true` — its routes stay wired so direct navigation still works, but they
 * don't appear in the sidebar.
 */
export const menuItems: MenuItem[] = [
  createMenuItem('vibebuilder', 'Workspace', '/app', 'Layers3'),

  createMenuItem('dashboard', 'DASHBOARD', '/dashboard', 'LayoutDashboard', { hidden: true }),
  createMenuItem('finance', 'FINANCE', '/finance', 'ChartNoAxesCombined', {
    hidden: true,
    roles: ['admin'],
  }),
  createMenuItem('iam', 'IAM', '/identity-management', 'Users', {
    hidden: true,
    isIntegrated: true,
  }),
  createMenuItem('inventory', 'INVENTORY', '/inventory', 'Store', {
    hidden: true,
    isIntegrated: true,
  }),
  createMenuItem('invoices', 'INVOICES', '/invoices', 'ReceiptText', {
    hidden: true,
    isIntegrated: true,
  }),
  createMenuItem('task-manager', 'TASK_MANAGER', '/task-manager', 'Presentation', {
    hidden: true,
    isIntegrated: true,
  }),
  createMenuItem('mail', 'MAIL', '/mail/inbox', 'Inbox', { hidden: true }),
  createMenuItem('calendar', 'CALENDAR', '/calendar', 'Calendar', { hidden: true }),
  createMenuItem('activity-log', 'ACTIVITY_LOG', '/activity-log', 'FileClock', { hidden: true }),
  createMenuItem('timeline', 'TIMELINE', '/timeline', 'History', {
    hidden: true,
    roles: ['admin'],
  }),
  createMenuItem('chat', 'CHAT', '/chat', 'MessageSquareText', {
    hidden: true,
    roles: ['admin'],
  }),
  createMenuItemWithChildren(
    'file-manager',
    'FILE_MANAGER',
    '/file-manager',
    'Folder',
    [
      createMenuItem('my-files', 'MY_FILES', '/file-manager/my-files'),
      createMenuItem('shared-files', 'SHARED_WITH_ME', '/file-manager/shared-files'),
      createMenuItem('trash', 'TRASH', '/file-manager/trash'),
    ],
    { hidden: true }
  ),
  createMenuItem('404', 'ERROR_404', '/404', 'SearchX', { hidden: true }),
  createMenuItem('503', 'ERROR_503', '/503', 'TriangleAlert', { hidden: true }),
];
