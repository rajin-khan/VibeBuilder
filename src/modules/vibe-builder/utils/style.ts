import { CSSProperties } from 'react';
import { withAlpha } from './color';
import { VibeBlock } from '../types';

export type SpacingPreset = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

const spacingMap: Record<SpacingPreset, number> = {
  none: 0,
  xs: 16,
  sm: 32,
  md: 48,
  lg: 72,
  xl: 96,
  '2xl': 128,
  '3xl': 168,
};

export const spacingPresets: SpacingPreset[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

const radiusMap: Record<string, string> = {
  none: '0px',
  sm: '4px',
  md: '10px',
  lg: '18px',
  xl: '28px',
  pill: '999px',
};

export const radiusPresets = Object.keys(radiusMap);

const shadowMap: Record<string, string> = {
  none: 'none',
  soft: '0 8px 24px -16px rgba(15, 23, 42, 0.18)',
  medium: '0 24px 48px -28px rgba(15, 23, 42, 0.28)',
  bold: '0 32px 80px -28px rgba(15, 23, 42, 0.45)',
  glow: '0 0 0 1px rgba(15, 23, 42, 0.06), 0 32px 80px -32px rgba(20, 184, 166, 0.4)',
};

export const shadowPresets = Object.keys(shadowMap);

const maxWidthMap: Record<string, string> = {
  narrow: '720px',
  default: '1080px',
  wide: '1280px',
  full: '100%',
};

export const maxWidthPresets = Object.keys(maxWidthMap);

const animationMap: Record<string, string> = {
  none: 'none',
  fadeIn: 'vibeFadeIn 0.7s ease-out both',
  rise: 'vibeRise 0.7s cubic-bezier(0.18, 0.7, 0.2, 1) both',
  slide: 'vibeSlide 0.7s cubic-bezier(0.18, 0.7, 0.2, 1) both',
  zoom: 'vibeZoom 0.6s ease-out both',
};

export const animationPresets = Object.keys(animationMap);

export type UniversalStyle = {
  paddingTop?: SpacingPreset;
  paddingBottom?: SpacingPreset;
  paddingX?: SpacingPreset;
  marginTop?: SpacingPreset;
  marginBottom?: SpacingPreset;
  maxWidth?: keyof typeof maxWidthMap;
  borderRadius?: keyof typeof radiusMap;
  shadow?: keyof typeof shadowMap;
  animation?: keyof typeof animationMap;
  align?: 'left' | 'center' | 'right';
  backgroundImage?: string;
  backgroundOverlay?: string;
  backgroundOverlayOpacity?: number;
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
  anchorId?: string;
  customClass?: string;
};

export type PreviewMode = 'desktop' | 'tablet' | 'mobile';

const numberOrPreset = (value: unknown, fallback?: number): number | undefined => {
  if (value === undefined || value === '') {
    return fallback;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
    if (value in spacingMap) {
      return spacingMap[value as SpacingPreset];
    }
  }
  return fallback;
};

export const sectionWrapperStyle = (block: VibeBlock, fallbackBackground = '#ffffff'): CSSProperties => {
  const props = block.props as Record<string, unknown>;
  const style: CSSProperties = {};

  const background = (props.background as string) || fallbackBackground;
  const overlay = props.backgroundOverlay as string | undefined;
  const overlayOpacity = typeof props.backgroundOverlayOpacity === 'number'
    ? props.backgroundOverlayOpacity
    : Number(props.backgroundOverlayOpacity ?? 0.5);

  const backgroundImage = props.backgroundImage as string | undefined;
  const layers: string[] = [];

  if (overlay) {
    layers.push(`linear-gradient(${withAlpha(overlay, overlayOpacity)}, ${withAlpha(overlay, overlayOpacity)})`);
  }
  if (backgroundImage) {
    layers.push(`url(${backgroundImage})`);
  }

  if (layers.length > 0) {
    style.backgroundImage = layers.join(', ');
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
    style.backgroundRepeat = 'no-repeat';
  }

  style.backgroundColor = background;

  const paddingTop = numberOrPreset(props.paddingTop, undefined);
  const paddingBottom = numberOrPreset(props.paddingBottom, undefined);
  const paddingX = numberOrPreset(props.paddingX, undefined);
  if (paddingTop !== undefined) {
    style.paddingTop = `${paddingTop}px`;
  }
  if (paddingBottom !== undefined) {
    style.paddingBottom = `${paddingBottom}px`;
  }
  if (paddingX !== undefined) {
    style.paddingLeft = `${paddingX}px`;
    style.paddingRight = `${paddingX}px`;
  }

  const marginTop = numberOrPreset(props.marginTop, undefined);
  const marginBottom = numberOrPreset(props.marginBottom, undefined);
  if (marginTop !== undefined) {
    style.marginTop = `${marginTop}px`;
  }
  if (marginBottom !== undefined) {
    style.marginBottom = `${marginBottom}px`;
  }

  const radiusKey = (props.borderRadius as keyof typeof radiusMap) ?? undefined;
  if (radiusKey && radiusKey in radiusMap) {
    style.borderRadius = radiusMap[radiusKey];
  }

  const shadowKey = (props.shadow as keyof typeof shadowMap) ?? undefined;
  if (shadowKey && shadowKey in shadowMap) {
    style.boxShadow = shadowMap[shadowKey];
  }

  const animationKey = (props.animation as keyof typeof animationMap) ?? undefined;
  if (animationKey && animationKey in animationMap && animationMap[animationKey] !== 'none') {
    style.animation = animationMap[animationKey];
  }

  return style;
};

export const innerContainerStyle = (block: VibeBlock): CSSProperties => {
  const maxWidthKey = (block.props.maxWidth as keyof typeof maxWidthMap) ?? 'default';
  const max = maxWidthMap[maxWidthKey] ?? maxWidthMap.default;
  return { maxWidth: max, marginLeft: 'auto', marginRight: 'auto' };
};

export const alignmentClass = (value: unknown) => {
  if (value === 'center') return 'text-center';
  if (value === 'right') return 'text-right';
  return 'text-left';
};

const truthy = (value: unknown) =>
  value === true || value === 'true' || value === 1 || value === '1';

export const blockVisibilityClass = (block: VibeBlock, previewMode?: PreviewMode) => {
  const hideDesktop = truthy(block.props.hideOnDesktop);
  const hideTablet = truthy(block.props.hideOnTablet);
  const hideMobile = truthy(block.props.hideOnMobile);

  if (previewMode) {
    if (previewMode === 'desktop' && hideDesktop) return 'hidden';
    if (previewMode === 'tablet' && hideTablet) return 'hidden';
    if (previewMode === 'mobile' && hideMobile) return 'hidden';
    return '';
  }

  return [
    hideMobile ? 'max-sm:hidden' : '',
    hideTablet ? 'sm:max-lg:hidden' : '',
    hideDesktop ? 'lg:hidden' : '',
  ]
    .filter(Boolean)
    .join(' ');
};
