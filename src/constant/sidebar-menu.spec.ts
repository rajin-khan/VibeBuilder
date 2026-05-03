import { menuItems } from '../constant/sidebar-menu';

describe('menuItems', () => {
  test('should have the correct structure', () => {
    expect(Array.isArray(menuItems)).toBe(true);
    expect(menuItems.length).toBeGreaterThan(0);
  });

  test('each menu item should have required properties', () => {
    menuItems.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('path');
      expect(typeof item.id).toBe('string');
      expect(typeof item.name).toBe('string');
      expect(typeof item.path).toBe('string');
    });
  });

  test('dashboard item is hidden but still present', () => {
    const dashboardItem = menuItems.find((item) => item.id === 'dashboard');
    expect(dashboardItem).toBeDefined();
    expect(dashboardItem?.path).toBe('/dashboard');
    expect(dashboardItem?.icon).toBe('LayoutDashboard');
    expect(dashboardItem?.hidden).toBe(true);
  });

  test('IAM item is integrated and hidden', () => {
    const iamItem = menuItems.find((item) => item.id === 'iam');
    expect(iamItem).toBeDefined();
    if (iamItem) {
      expect(iamItem.isIntegrated).toBe(true);
      expect(iamItem.hidden).toBe(true);
      expect(iamItem.name).toBe('IAM');
      expect(iamItem.path).toBe('/identity-management');
      expect(iamItem.icon).toBe('Users');
    }
  });

  test('Workspace (Blockloom builder) is the only visible top-level item', () => {
    const visibleItems = menuItems.filter((item) => !item.hidden);
    expect(visibleItems).toHaveLength(1);
    expect(visibleItems[0]).toMatchObject({
      id: 'vibebuilder',
      name: 'Workspace',
      path: '/app',
      icon: 'Layers3',
    });
  });

  test('all paths should start with a slash', () => {
    menuItems.forEach((item) => {
      expect(item.path.startsWith('/')).toBe(true);
    });
  });
});
