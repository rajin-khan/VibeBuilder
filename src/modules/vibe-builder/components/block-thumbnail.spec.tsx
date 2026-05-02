import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlockThumbnail } from './block-thumbnail';
import { componentRegistry } from './component-registry';
import { VibeBlockType } from '../types';

const componentTypes = Object.keys(componentRegistry) as VibeBlockType[];

describe('BlockThumbnail', () => {
  it('renders a distinct SVG preview for every component type', () => {
    componentTypes.forEach((type) => {
      const { container, unmount } = render(<BlockThumbnail type={type} />);
      const svg = container.querySelector('svg');

      expect(svg, type).toBeTruthy();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 96 60');
      expect(container.querySelectorAll('rect, circle, path, polygon, line, text').length, type)
        .toBeGreaterThan(3);

      unmount();
    });
  });
});
