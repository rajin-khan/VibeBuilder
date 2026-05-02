import { Fragment, ReactNode, useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowRightIcon as ArrowRight,
  AvatarIcon as UsersRound,
  BadgeIcon as Award,
  BadgeIcon as BadgeDollarSign,
  BarChartIcon as BarChart3,
  BoxIcon as Box,
  CalendarIcon as CalendarDays,
  CheckCircledIcon as ShieldCheck,
  CheckIcon as Check,
  ChevronDownIcon as ChevronDown,
  ChevronRightIcon as CrumbChevronR,
  CodeIcon as Code2,
  Component1Icon as Sparkles,
  CubeIcon as Clapperboard,
  CursorArrowIcon as MousePointer2,
  DrawingPinIcon as MapPin,
  EnvelopeClosedIcon as Mail,
  ExclamationTriangleIcon as AlertTriangle,
  GitHubLogoIcon as Github,
  GlobeIcon as Facebook,
  GlobeIcon as Globe,
  GlobeIcon as Youtube,
  GridIcon as LayoutGrid,
  ImageIcon,
  InfoCircledIcon as Info,
  InstagramLogoIcon as Instagram,
  LayersIcon as Layers3,
  LightningBoltIcon as Zap,
  LinkedInLogoIcon as Linkedin,
  MagicWandIcon as Wand2,
  ArrowRightIcon as MoveRight,
  SpeakerLoudIcon as Megaphone,
  MinusIcon as Minus,
  PaperPlaneIcon as Send,
  FrameIcon as PanelTop,
  QuestionMarkCircledIcon as CircleHelp,
  QuoteIcon,
  QuoteIcon as MessageSquareQuote,
  ReaderIcon as Newspaper,
  RocketIcon as Rocket,
  RowsIcon as LayoutList,
  Share2Icon as Share2,
  ShuffleIcon as GitCompare,
  StarIcon as Star,
  TextIcon as TypeIcon,
  TimerIcon as TimerReset,
  TokensIcon as Palette,
  TwitterLogoIcon as Twitter,
} from '@radix-ui/react-icons';
import {
  ComponentCategory,
  InspectorField,
  VibeBlock,
  VibeBlockType,
  VibeComponentDefinition,
} from '../types';
import { contrastTokens, isDarkColor, withAlpha } from '../utils/color';
import { blockVisibilityClass, sectionWrapperStyle, innerContainerStyle } from '../utils/style';
import {
  accentField,
  advancedTabFields,
  alignField,
  bodyField,
  eyebrowField,
  styleTabFields,
  titleField,
  universalDefaults,
} from './style-fields';
import { useBuilderChildRenderer } from './builder-child-context';

const universalFields: InspectorField[] = [...styleTabFields, ...advancedTabFields];

const baseDefaults = (overrides: Record<string, unknown> = {}) => ({
  ...universalDefaults,
  ...overrides,
});

const prop = (block: VibeBlock, key: string, fallback = ''): string => {
  const value = block.props[key];
  if (value === undefined || value === null) return fallback;
  return String(value);
};

/** Rejects bare UUIDs and relative paths so <img src> never hits /site/.../uuid (404). */
const BARE_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const safeImageUrl = (raw: unknown): string => {
  if (raw === undefined || raw === null) return '';
  const s = String(raw).trim();
  if (!s || BARE_UUID.test(s)) return '';
  if (s.startsWith('blob:') || s.startsWith('data:')) return s;
  if (/^https?:\/\//i.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.protocol === 'https:' || u.protocol === 'http:') return s;
  } catch {
    /* not usable as absolute URL */
  }
  return '';
};

const numberProp = (block: VibeBlock, key: string, fallback: number) => {
  const value = Number(block.props[key]);
  return Number.isFinite(value) ? value : fallback;
};

const boolProp = (block: VibeBlock, key: string, fallback = false) => {
  const v = block.props[key];
  if (v === undefined) return fallback;
  if (typeof v === 'boolean') return v;
  return v === 'true' || v === true || v === 1 || v === '1';
};

const listProp = <T extends Record<string, unknown>>(block: VibeBlock, key: string, fallback: T[] = []): T[] => {
  const v = block.props[key];
  if (Array.isArray(v)) return v as T[];
  return fallback;
};

const Section = ({
  block,
  fallbackBackground = '#ffffff',
  className = '',
  children,
}: {
  block: VibeBlock;
  fallbackBackground?: string;
  className?: string;
  children: ReactNode;
}) => {
  const wrapper = sectionWrapperStyle(block, fallbackBackground);
  const inner = innerContainerStyle(block);
  const customClass = prop(block, 'customClass');
  const anchorId = prop(block, 'anchorId');

  return (
    <section
      id={anchorId || undefined}
      className={`relative w-full ${blockVisibilityClass(block)} ${customClass ? customClass : ''} ${className}`}
      style={wrapper}
    >
      <div style={inner} className="relative z-10 w-full min-w-0 max-w-full">
        {children}
      </div>
    </section>
  );
};

const Eyebrow = ({ children, color }: { children: ReactNode; color?: string }) =>
  children ? (
    <p
      className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em]"
      style={{ color: color ?? 'currentColor' }}
    >
      {children}
    </p>
  ) : null;

const PrimaryButton = ({
  label,
  background,
  textColor,
  className = '',
}: {
  label: string;
  background: string;
  textColor?: string;
  className?: string;
}) => (
  <button
    type="button"
    className={`vibe-button inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold shadow-md shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    style={{
      backgroundColor: background,
      color: textColor ?? (isDarkColor(background) ? '#ffffff' : '#0f172a'),
    }}
  >
    {label}
    <MoveRight className="size-4" />
  </button>
);

const HeroPrimaryCta = ({
  label,
  href,
  newTab,
  accent,
  variant,
  size,
}: {
  label: string;
  href: string;
  newTab: boolean;
  accent: string;
  variant: string;
  size: string;
}) => {
  const pad =
    size === 'sm'
      ? 'px-3 py-2 text-xs gap-1'
      : size === 'lg'
        ? 'px-6 py-3.5 text-base gap-2'
        : 'px-5 py-3 text-sm gap-2';
  const base = `vibe-button inline-flex items-center rounded-md font-semibold transition hover:-translate-y-0.5 ${pad} ${
    variant === 'outline' ? '' : 'shadow-md shadow-black/10 hover:shadow-lg'
  }`;
  const solidStyle: CSSProperties = {
    backgroundColor: accent,
    color: isDarkColor(accent) ? '#ffffff' : '#0f172a',
  };
  const outlineStyle: CSSProperties = {
    border: `2px solid ${accent}`,
    color: accent,
    backgroundColor: 'transparent',
    boxShadow: 'none',
  };
  const style = variant === 'outline' ? outlineStyle : solidStyle;
  const iconSz = size === 'sm' ? 'size-3.5' : 'size-4';
  const inner = (
    <>
      {label}
      <MoveRight className={iconSz} />
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        className={base}
        style={style}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
      >
        {inner}
      </a>
    );
  }
  return (
    <button type="button" className={base} style={style}>
      {inner}
    </button>
  );
};

const PlaceholderImage = ({
  ratio = 'aspect-[4/3]',
  accent = '#94a3b8',
  rounded = 'rounded-xl',
  isDark,
}: {
  ratio?: string;
  accent?: string;
  rounded?: string;
  isDark?: boolean;
}) => (
  <div
    className={`relative isolate flex items-center justify-center overflow-hidden ${ratio} ${rounded} border`}
    style={{
      borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.12)',
      background: isDark
        ? `linear-gradient(135deg, ${withAlpha(accent, 0.2)}, rgba(255,255,255,0.055) 44%, rgba(255,255,255,0.09))`
        : `linear-gradient(135deg, ${withAlpha(accent, 0.16)}, rgba(15,23,42,0.035) 46%, rgba(255,255,255,0.82))`,
    }}
  >
    <span
      className="absolute inset-0 -z-10 opacity-60"
      style={{
        backgroundImage:
          'radial-gradient(circle at 24% 24%, rgba(255,255,255,0.42), transparent 18%), radial-gradient(circle at 78% 34%, rgba(255,255,255,0.22), transparent 16%), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
        backgroundSize: 'auto, auto, 28px 28px, 28px 28px',
      }}
      aria-hidden
    />
    <span
      className="absolute -bottom-10 -right-10 size-32 rounded-full opacity-20"
      style={{ backgroundColor: accent }}
      aria-hidden
    />
    <span
      className="grid size-14 place-items-center rounded-2xl border"
      style={{
        borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.1)',
        background: isDark ? 'rgba(7,10,18,0.72)' : 'rgba(255,255,255,0.78)',
        color: accent,
      }}
    >
      <ImageIcon className="size-7" />
    </span>
  </div>
);

const socialIconMap = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  youtube: Youtube,
  globe: Globe,
  mail: Mail,
};

export const componentRegistry: Record<VibeBlockType, VibeComponentDefinition> = {
  hero: {
    type: 'hero',
    name: 'Hero Section',
    description: 'A bold first impression with call-to-action copy.',
    preview: 'Headline, subcopy, action',
    category: 'hero',
    defaultProps: baseDefaults({
      eyebrow: 'New studio launch',
      headline: 'Build a sharper website in one sitting',
      body: 'A confident, fast-loading section for product pages, agencies, and campaign launches.',
      cta: 'Start the tour',
      ctaUrl: '',
      ctaNewTab: false,
      secondaryCta: 'Watch demo',
      secondaryUrl: '',
      secondaryNewTab: false,
      background: '#0f172a',
      accent: '#14b8a6',
      heroLayout: 'split',
      align: 'left',
      heroHeight: 620,
      media: '',
      headlineSize: 'lg',
      hideBody: false,
      mediaFit: 'cover',
      mediaPosition: 'center',
      overlayStrength: 55,
      primaryButtonStyle: 'solid',
      primaryButtonSize: 'md',
      paddingTop: 'xl',
      paddingBottom: 'xl',
    }),
    fields: [
      eyebrowField,
      { key: 'headline', label: 'Headline', type: 'textarea', tab: 'content', group: 'Heading' },
      bodyField,
      {
        key: 'hideBody',
        label: 'Hide body text',
        type: 'boolean',
        tab: 'content',
        group: 'Heading',
      },
      { key: 'cta', label: 'Primary button', type: 'text', tab: 'content', group: 'Actions' },
      { key: 'ctaUrl', label: 'Primary URL', type: 'text', tab: 'content', group: 'Actions', placeholder: 'https://' },
      {
        key: 'ctaNewTab',
        label: 'Open primary in new tab',
        type: 'boolean',
        tab: 'content',
        group: 'Actions',
      },
      { key: 'secondaryCta', label: 'Secondary link', type: 'text', tab: 'content', group: 'Actions' },
      {
        key: 'secondaryUrl',
        label: 'Secondary URL',
        type: 'text',
        tab: 'content',
        group: 'Actions',
        placeholder: 'https://',
      },
      {
        key: 'secondaryNewTab',
        label: 'Open secondary in new tab',
        type: 'boolean',
        tab: 'content',
        group: 'Actions',
      },
      { key: 'media', label: 'Hero image', type: 'image', tab: 'content', group: 'Media' },
      {
        key: 'heroLayout',
        label: 'Layout',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'split', label: 'Split media' },
          { value: 'overlay', label: 'Image overlay' },
        ],
      },
      alignField(),
      { key: 'heroHeight', label: 'Min height (px)', type: 'range', tab: 'style', group: 'Layout', min: 360, max: 900, step: 20 },
      {
        key: 'headlineSize',
        label: 'Headline size',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Typography',
        options: [
          { value: 'sm', label: 'S' },
          { value: 'md', label: 'M' },
          { value: 'lg', label: 'L' },
          { value: 'xl', label: 'XL' },
        ],
      },
      {
        key: 'mediaFit',
        label: 'Media fit',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Media',
        options: [
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' },
        ],
      },
      {
        key: 'mediaPosition',
        label: 'Media focus',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Media',
        options: [
          { value: 'top', label: 'Top' },
          { value: 'center', label: 'Center' },
          { value: 'bottom', label: 'Bottom' },
        ],
      },
      {
        key: 'overlayStrength',
        label: 'Overlay darkness',
        type: 'range',
        tab: 'style',
        group: 'Media',
        min: 0,
        max: 100,
        step: 5,
        visibleWhen: (props) => props.heroLayout === 'overlay',
      },
      {
        key: 'primaryButtonStyle',
        label: 'Primary button',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Actions',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'outline', label: 'Outline' },
        ],
      },
      {
        key: 'primaryButtonSize',
        label: 'Primary size',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Actions',
        options: [
          { value: 'sm', label: 'S' },
          { value: 'md', label: 'M' },
          { value: 'lg', label: 'L' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  heading: {
    type: 'heading',
    name: 'Heading',
    description: 'A standalone display heading with optional eyebrow.',
    preview: 'Big title only',
    category: 'content',
    defaultProps: baseDefaults({
      eyebrow: '',
      title: 'A confident headline goes a long way',
      level: 'h2',
      align: 'left',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'lg',
      paddingBottom: 'sm',
    }),
    fields: [
      eyebrowField,
      titleField,
      {
        key: 'level',
        label: 'Tag',
        type: 'buttonGroup',
        tab: 'content',
        group: 'Heading',
        options: ['h1', 'h2', 'h3', 'h4'],
      },
      alignField(),
      accentField,
      ...universalFields,
    ],
  },

  paragraph: {
    type: 'paragraph',
    name: 'Paragraph',
    description: 'Refined editorial body text.',
    preview: 'Body text block',
    category: 'content',
    defaultProps: baseDefaults({
      body: 'Type the story you want to tell. Use this block for product detail, founder notes, or service explainers that need just one tidy column.',
      size: 'md',
      align: 'left',
      background: '#ffffff',
      accent: '#0f172a',
      paddingTop: 'sm',
      paddingBottom: 'sm',
    }),
    fields: [
      bodyField,
      {
        key: 'size',
        label: 'Size',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Typography',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
        ],
      },
      alignField(),
      accentField,
      ...universalFields,
    ],
  },

  text: {
    type: 'text',
    name: 'Text Block',
    description: 'Heading and paragraph in a two-column editorial layout.',
    preview: 'Title + paragraph',
    category: 'content',
    defaultProps: baseDefaults({
      eyebrow: 'Why it matters',
      title: 'Clear structure, calmer clients',
      body: 'Use this block for concise writing that helps visitors understand the next useful action. It is ideal for brand stories, service explainers, and founder notes.',
      columns: 'two',
      background: '#ffffff',
      accent: '#b45309',
      paddingTop: 'lg',
      paddingBottom: 'lg',
    }),
    fields: [
      eyebrowField,
      titleField,
      bodyField,
      {
        key: 'columns',
        label: 'Columns',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: 'one', label: 'Single' },
          { value: 'two', label: 'Two' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  features: {
    type: 'features',
    name: 'Feature Grid',
    description: 'Up to four benefit cards for services, products, or process steps.',
    preview: 'Cards with icons',
    category: 'content',
    defaultProps: baseDefaults({
      eyebrow: 'Capabilities',
      title: 'A builder shaped for momentum',
      body: 'Use feature cards to explain what makes the website, service, or campaign worth choosing.',
      columns: 3,
      cardStyle: 'soft',
      iconStyle: 'tile',
      background: '#f8fafc',
      accent: '#0f766e',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { icon: 'Zap', title: 'Visual assembly', body: 'Drag sections into place and tune copy, color, image, and spacing.' },
        { icon: 'Layers3', title: 'Autosaved layouts', body: 'Every canvas move becomes a durable JSON document.' },
        { icon: 'Rocket', title: 'Publish cleanly', body: 'Ship a live route visitors browse without editor tools.' },
      ],
    }),
    fields: [
      eyebrowField,
      titleField,
      bodyField,
      { key: 'columns', label: 'Columns', type: 'range', tab: 'style', group: 'Layout', min: 2, max: 4, step: 1 },
      {
        key: 'cardStyle',
        label: 'Card style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Card',
        options: [
          { value: 'soft', label: 'Soft' },
          { value: 'elevated', label: 'Elevated' },
          { value: 'outlined', label: 'Outlined' },
          { value: 'solid', label: 'Solid' },
        ],
      },
      {
        key: 'iconStyle',
        label: 'Icon style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Card',
        options: [
          { value: 'tile', label: 'Tile' },
          { value: 'circle', label: 'Circle' },
          { value: 'plain', label: 'Plain' },
        ],
      },
      accentField,
      {
        key: 'items',
        label: 'Features',
        type: 'list',
        tab: 'content',
        group: 'Features',
        itemLabel: 'Feature',
        defaultItem: { icon: 'Sparkles', title: 'New feature', body: 'Describe the value briefly.' },
        itemFields: [
          { key: 'icon', label: 'Icon', type: 'icon' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'body', label: 'Body', type: 'textarea' },
        ],
      },
      ...universalFields,
    ],
  },

  iconBox: {
    type: 'iconBox',
    name: 'Icon Box',
    description: 'A single icon, headline, and supporting copy.',
    preview: 'Icon + heading + body',
    category: 'utility',
    defaultProps: baseDefaults({
      icon: 'Sparkles',
      title: 'A nicer reason to scroll',
      body: 'A standalone tile to highlight one promise, value, or step.',
      align: 'center',
      iconStyle: 'tile',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'md',
      paddingBottom: 'md',
    }),
    fields: [
      { key: 'icon', label: 'Icon', type: 'icon', tab: 'content', group: 'Icon' },
      titleField,
      bodyField,
      alignField(),
      {
        key: 'iconStyle',
        label: 'Icon style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Icon',
        options: [
          { value: 'tile', label: 'Tile' },
          { value: 'circle', label: 'Circle' },
          { value: 'plain', label: 'Plain' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  stats: {
    type: 'stats',
    name: 'Stats Band',
    description: 'Metric highlights for credibility and momentum.',
    preview: 'Numbers row',
    category: 'social-proof',
    defaultProps: baseDefaults({
      eyebrow: 'Built for momentum',
      title: 'Numbers that earn the deck slide',
      background: '#0f172a',
      accent: '#facc15',
      cardStyle: 'solid',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { value: '3x', label: 'faster launch cycles' },
        { value: '24/7', label: 'autosaved editing' },
        { value: '100%', label: 'public renderer separation' },
        { value: '32+', label: 'reusable components' },
      ],
    }),
    fields: [
      eyebrowField,
      titleField,
      {
        key: 'cardStyle',
        label: 'Card style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Card',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'tile', label: 'Tile' },
          { value: 'plain', label: 'Plain' },
        ],
      },
      accentField,
      {
        key: 'items',
        label: 'Stats',
        type: 'list',
        tab: 'content',
        group: 'Stats',
        itemLabel: 'Stat',
        defaultItem: { value: '100%', label: 'awesome' },
        itemFields: [
          { key: 'value', label: 'Value', type: 'text' },
          { key: 'label', label: 'Label', type: 'text' },
        ],
      },
      ...universalFields,
    ],
  },

  gallery: {
    type: 'gallery',
    name: 'Image Gallery',
    description: 'Multiple image tiles for portfolio, venue, or product proof.',
    preview: 'Image grid',
    category: 'media',
    defaultProps: baseDefaults({
      title: 'Selected work',
      body: 'Show the visual proof that helps visitors trust the offer.',
      layout: 'masonry',
      columns: 3,
      background: '#f8fafc',
      accent: '#2563eb',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { image: '', caption: 'Homepage concept' },
        { image: '', caption: 'Campaign detail' },
        { image: '', caption: 'Launch-ready section' },
      ],
    }),
    fields: [
      titleField,
      bodyField,
      {
        key: 'layout',
        label: 'Layout',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: 'masonry', label: 'Masonry' },
          { value: 'equal', label: 'Equal grid' },
          { value: 'carousel', label: 'Carousel' },
        ],
      },
      { key: 'columns', label: 'Columns', type: 'range', tab: 'style', group: 'Layout', min: 2, max: 4, step: 1 },
      accentField,
      {
        key: 'items',
        label: 'Images',
        type: 'list',
        tab: 'content',
        group: 'Images',
        itemLabel: 'Image',
        defaultItem: { image: '', caption: 'New image' },
        itemFields: [
          { key: 'image', label: 'Image', type: 'image' },
          { key: 'caption', label: 'Caption', type: 'text' },
        ],
      },
      ...universalFields,
    ],
  },

  image: {
    type: 'image',
    name: 'Image',
    description: 'A single full-bleed or framed image.',
    preview: 'Standalone image',
    category: 'media',
    defaultProps: baseDefaults({
      image: '',
      caption: '',
      aspect: '16/9',
      align: 'center',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'sm',
      paddingBottom: 'sm',
    }),
    fields: [
      { key: 'image', label: 'Image', type: 'image', tab: 'content', group: 'Media' },
      { key: 'caption', label: 'Caption', type: 'text', tab: 'content', group: 'Media' },
      {
        key: 'aspect',
        label: 'Aspect ratio',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: '16/9', label: '16:9' },
          { value: '4/3', label: '4:3' },
          { value: '1/1', label: 'Square' },
          { value: '3/4', label: 'Portrait' },
          { value: 'auto', label: 'Auto' },
        ],
      },
      alignField(),
      ...universalFields,
    ],
  },

  testimonial: {
    type: 'testimonial',
    name: 'Testimonial',
    description: 'A strong quote with attribution for trust building.',
    preview: 'Single quote',
    category: 'social-proof',
    defaultProps: baseDefaults({
      quote: 'The editor made our content team feel like they had a proper production studio, not another brittle form.',
      name: 'Mira Chowdhury',
      role: 'Founder, Northline Studio',
      avatar: '',
      tone: 'card',
      background: '#fff7ed',
      accent: '#c2410c',
      paddingTop: 'lg',
      paddingBottom: 'lg',
    }),
    fields: [
      { key: 'quote', label: 'Quote', type: 'textarea', tab: 'content', group: 'Quote' },
      { key: 'name', label: 'Name', type: 'text', tab: 'content', group: 'Author' },
      { key: 'role', label: 'Role', type: 'text', tab: 'content', group: 'Author' },
      { key: 'avatar', label: 'Avatar', type: 'image', tab: 'content', group: 'Author' },
      {
        key: 'tone',
        label: 'Style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'card', label: 'Card' },
          { value: 'minimal', label: 'Minimal' },
          { value: 'gradient', label: 'Gradient' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  pricing: {
    type: 'pricing',
    name: 'Pricing Card',
    description: 'A compact offer block with inclusions and CTA.',
    preview: 'Single offer',
    category: 'commerce',
    defaultProps: baseDefaults({
      label: 'Starter launch',
      title: 'One-page launch kit',
      price: '$499',
      period: 'one-time',
      body: 'For teams that need a polished public page quickly.',
      cta: 'Reserve a spot',
      featured: false,
      background: '#f4f4f5',
      accent: '#4f46e5',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { text: 'Strategy-ready section set' },
        { text: 'Responsive live renderer' },
        { text: 'Editable media and copy' },
      ],
    }),
    fields: [
      { key: 'label', label: 'Label', type: 'text', tab: 'content', group: 'Heading' },
      titleField,
      { key: 'price', label: 'Price', type: 'text', tab: 'content', group: 'Pricing' },
      { key: 'period', label: 'Period', type: 'text', tab: 'content', group: 'Pricing' },
      bodyField,
      { key: 'cta', label: 'Button label', type: 'text', tab: 'content', group: 'Action' },
      { key: 'featured', label: 'Highlight as featured', type: 'boolean', tab: 'style', group: 'Style' },
      accentField,
      {
        key: 'items',
        label: 'Inclusions',
        type: 'list',
        tab: 'content',
        group: 'Inclusions',
        itemLabel: 'Item',
        defaultItem: { text: 'Another inclusion' },
        itemFields: [{ key: 'text', label: 'Text', type: 'text' }],
      },
      ...universalFields,
    ],
  },

  pricingTable: {
    type: 'pricingTable',
    name: 'Pricing Table',
    description: 'Three-tier pricing comparison.',
    preview: 'Three-column pricing',
    category: 'commerce',
    defaultProps: baseDefaults({
      eyebrow: 'Plans',
      title: 'Pick the option that fits the launch',
      body: 'Every plan ships with the canvas editor, autosaving JSON, and the live renderer.',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        {
          name: 'Solo',
          price: '$0',
          period: 'forever',
          body: 'Personal websites and side projects.',
          cta: 'Start free',
          featured: false,
          features: ['1 website', '5 pages', 'Community support'],
        },
        {
          name: 'Studio',
          price: '$29',
          period: '/mo',
          body: 'Independent studios and small teams.',
          cta: 'Start studio',
          featured: true,
          features: ['Unlimited pages', 'Custom domains', 'Priority email support'],
        },
        {
          name: 'Agency',
          price: '$79',
          period: '/mo',
          body: 'Multi-client agencies and growing teams.',
          cta: 'Contact sales',
          featured: false,
          features: ['Workspaces', 'Team roles', 'Dedicated success'],
        },
      ],
    }),
    fields: [
      eyebrowField,
      titleField,
      bodyField,
      accentField,
      {
        key: 'items',
        label: 'Plans',
        type: 'list',
        tab: 'content',
        group: 'Plans',
        itemLabel: 'Plan',
        defaultItem: {
          name: 'New plan',
          price: '$9',
          period: '/mo',
          body: 'Short description',
          cta: 'Choose',
          featured: false,
          features: ['Feature one', 'Feature two'],
        },
        itemFields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'price', label: 'Price', type: 'text' },
          { key: 'period', label: 'Period', type: 'text' },
          { key: 'body', label: 'Body', type: 'textarea' },
          { key: 'cta', label: 'Button label', type: 'text' },
          { key: 'featured', label: 'Featured', type: 'boolean' },
        ],
      },
      ...universalFields,
    ],
  },

  faq: {
    type: 'faq',
    name: 'FAQ',
    description: 'A collapsible Q&A list for launch details, support, or policies.',
    preview: 'Question list',
    category: 'interactive',
    defaultProps: baseDefaults({
      eyebrow: 'Frequently asked',
      title: 'Questions before launch',
      body: 'Tap a question to expand the answer.',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        {
          question: 'Can I edit pages after publishing?',
          answer: 'Yes. Draft changes stay private until you publish again.',
        },
        {
          question: 'Can every site have multiple pages?',
          answer: 'Yes. Each website owns its own page list and navigation.',
        },
        {
          question: 'Where are layouts saved?',
          answer: 'Each page serializes its component tree as JSON in Blocks Data Gateway.',
        },
      ],
    }),
    fields: [
      eyebrowField,
      titleField,
      bodyField,
      accentField,
      {
        key: 'items',
        label: 'Questions',
        type: 'list',
        tab: 'content',
        group: 'Questions',
        itemLabel: 'Question',
        defaultItem: { question: 'Another question?', answer: 'A short helpful answer.' },
        itemFields: [
          { key: 'question', label: 'Question', type: 'text' },
          { key: 'answer', label: 'Answer', type: 'textarea' },
        ],
      },
      ...universalFields,
    ],
  },

  accordion: {
    type: 'accordion',
    name: 'Accordion',
    description: 'Stacked, expandable content panels (only one open at a time).',
    preview: 'Collapsible panels',
    category: 'interactive',
    defaultProps: baseDefaults({
      title: 'Process at a glance',
      style: 'plain',
      background: '#ffffff',
      accent: '#0891b2',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { question: 'Discover', answer: 'We map the goal, audience, and competitive context.' },
        { question: 'Design', answer: 'We assemble sections, typography, and identity.' },
        { question: 'Deliver', answer: 'We publish a live route and refine through usage.' },
      ],
    }),
    fields: [
      titleField,
      {
        key: 'style',
        label: 'Style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'plain', label: 'Plain' },
          { value: 'cards', label: 'Cards' },
          { value: 'separated', label: 'Separated' },
        ],
      },
      accentField,
      {
        key: 'items',
        label: 'Panels',
        type: 'list',
        tab: 'content',
        group: 'Panels',
        itemLabel: 'Panel',
        defaultItem: { question: 'Section', answer: 'Description goes here.' },
        itemFields: [
          { key: 'question', label: 'Title', type: 'text' },
          { key: 'answer', label: 'Body', type: 'textarea' },
        ],
      },
      ...universalFields,
    ],
  },

  tabs: {
    type: 'tabs',
    name: 'Tabs',
    description: 'A tabbed view for product capabilities, services, or comparison.',
    preview: 'Tabbed content',
    category: 'interactive',
    defaultProps: baseDefaults({
      title: 'Pick a workflow',
      style: 'pill',
      background: '#f8fafc',
      accent: '#7c3aed',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { label: 'Plan', body: 'Capture the goal and the visitor you want to convert.', media: '' },
        { label: 'Build', body: 'Drag sections into place and tune the copy and visuals.', media: '' },
        { label: 'Ship', body: 'Publish a tidy live route and iterate without losing drafts.', media: '' },
      ],
    }),
    fields: [
      titleField,
      {
        key: 'style',
        label: 'Tab style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'pill', label: 'Pill' },
          { value: 'underline', label: 'Underline' },
          { value: 'segmented', label: 'Segmented' },
        ],
      },
      accentField,
      {
        key: 'items',
        label: 'Tabs',
        type: 'list',
        tab: 'content',
        group: 'Tabs',
        itemLabel: 'Tab',
        defaultItem: { label: 'New tab', body: 'Tab content', media: '' },
        itemFields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'body', label: 'Body', type: 'textarea' },
          { key: 'media', label: 'Image', type: 'image' },
        ],
      },
      ...universalFields,
    ],
  },

  logoStrip: {
    type: 'logoStrip',
    name: 'Logo Strip',
    description: 'A credibility row for partners, press, or customer names.',
    preview: 'Partner names',
    category: 'social-proof',
    defaultProps: baseDefaults({
      eyebrow: 'Trusted by teams shipping faster',
      layout: 'grid',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'md',
      paddingBottom: 'md',
      items: [
        { name: 'Northline' },
        { name: 'StudioFold' },
        { name: 'BrightOps' },
        { name: 'LaunchLab' },
        { name: 'OrbitWorks' },
      ],
    }),
    fields: [
      eyebrowField,
      {
        key: 'layout',
        label: 'Layout',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: 'grid', label: 'Grid' },
          { value: 'inline', label: 'Inline' },
          { value: 'cards', label: 'Cards' },
        ],
      },
      accentField,
      {
        key: 'items',
        label: 'Logos',
        type: 'list',
        tab: 'content',
        group: 'Logos',
        itemLabel: 'Logo',
        defaultItem: { name: 'NewBrand', image: '' },
        itemFields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'image', label: 'Image (optional)', type: 'image' },
        ],
      },
      ...universalFields,
    ],
  },

  process: {
    type: 'process',
    name: 'Process Steps',
    description: 'A sequenced workflow for explaining how something happens.',
    preview: 'Numbered steps',
    category: 'utility',
    defaultProps: baseDefaults({
      eyebrow: 'How we work',
      title: 'From idea to published page',
      body: 'Show the practical path visitors can expect before they commit.',
      layout: 'rail',
      background: '#ecfeff',
      accent: '#0891b2',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { title: 'Frame the offer', body: 'Clarify who the page is for and what action matters most.' },
        { title: 'Assemble sections', body: 'Drag in the right story blocks and tailor every visual detail.' },
        { title: 'Publish and refine', body: 'Push the public version live, then keep drafts moving privately.' },
      ],
    }),
    fields: [
      eyebrowField,
      titleField,
      bodyField,
      {
        key: 'layout',
        label: 'Layout',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: 'rail', label: 'Rail' },
          { value: 'cards', label: 'Cards' },
        ],
      },
      accentField,
      {
        key: 'items',
        label: 'Steps',
        type: 'list',
        tab: 'content',
        group: 'Steps',
        itemLabel: 'Step',
        defaultItem: { title: 'New step', body: 'Describe the action.' },
        itemFields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'body', label: 'Body', type: 'textarea' },
        ],
      },
      ...universalFields,
    ],
  },

  team: {
    type: 'team',
    name: 'Team',
    description: 'People cards for founders, makers, or service teams.',
    preview: 'People with roles',
    category: 'utility',
    defaultProps: baseDefaults({
      eyebrow: 'The crew',
      title: 'Meet the launch team',
      body: 'Introduce the people behind the work with names, roles, and optional photos.',
      layout: 'cards',
      background: '#f8fafc',
      accent: '#7c3aed',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { name: 'Aria Khan', role: 'Product lead', image: '' },
        { name: 'Miles Chen', role: 'Visual designer', image: '' },
        { name: 'Nadia Islam', role: 'Frontend engineer', image: '' },
      ],
    }),
    fields: [
      eyebrowField,
      titleField,
      bodyField,
      {
        key: 'layout',
        label: 'Layout',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: 'cards', label: 'Cards' },
          { value: 'compact', label: 'Compact' },
          { value: 'avatar', label: 'Avatar grid' },
        ],
      },
      accentField,
      {
        key: 'items',
        label: 'Members',
        type: 'list',
        tab: 'content',
        group: 'Members',
        itemLabel: 'Member',
        defaultItem: { name: 'New member', role: 'Role', image: '' },
        itemFields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'role', label: 'Role', type: 'text' },
          { key: 'image', label: 'Photo', type: 'image' },
        ],
      },
      ...universalFields,
    ],
  },

  timeline: {
    type: 'timeline',
    name: 'Timeline',
    description: 'Milestones for launches, events, roadmaps, and histories.',
    preview: 'Milestone list',
    category: 'utility',
    defaultProps: baseDefaults({
      title: 'Launch timeline',
      orientation: 'vertical',
      background: '#0f172a',
      accent: '#38bdf8',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { date: 'Week 1', title: 'Content sprint', body: 'Lock copy, imagery, and brand voice.' },
        { date: 'Week 2', title: 'Design polish', body: 'Tighten visuals and accessibility.' },
        { date: 'Week 3', title: 'Publish and measure', body: 'Ship live and watch outcomes.' },
      ],
    }),
    fields: [
      titleField,
      {
        key: 'orientation',
        label: 'Orientation',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: 'vertical', label: 'Vertical' },
          { value: 'horizontal', label: 'Horizontal' },
        ],
      },
      accentField,
      {
        key: 'items',
        label: 'Milestones',
        type: 'list',
        tab: 'content',
        group: 'Milestones',
        itemLabel: 'Milestone',
        defaultItem: { date: 'Date', title: 'Milestone', body: 'Detail' },
        itemFields: [
          { key: 'date', label: 'Date', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'body', label: 'Body', type: 'textarea' },
        ],
      },
      ...universalFields,
    ],
  },

  newsletter: {
    type: 'newsletter',
    name: 'Newsletter',
    description: 'A signup section for email capture or waitlists.',
    preview: 'Email capture CTA',
    category: 'commerce',
    defaultProps: baseDefaults({
      eyebrow: 'Stay in the loop',
      title: 'Get launch notes in your inbox',
      body: 'Share product updates, event reminders, or studio dispatches with a focused email block.',
      placeholder: 'you@example.com',
      cta: 'Subscribe',
      layout: 'inline',
      background: '#fef3c7',
      accent: '#b45309',
      paddingTop: 'lg',
      paddingBottom: 'lg',
    }),
    fields: [
      eyebrowField,
      titleField,
      bodyField,
      { key: 'placeholder', label: 'Input placeholder', type: 'text', tab: 'content', group: 'Form' },
      { key: 'cta', label: 'Button label', type: 'text', tab: 'content', group: 'Form' },
      {
        key: 'layout',
        label: 'Layout',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: 'inline', label: 'Inline' },
          { value: 'stacked', label: 'Stacked' },
          { value: 'card', label: 'Card' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  video: {
    type: 'video',
    name: 'Video Feature',
    description: 'A framed video or media placeholder with supporting copy.',
    preview: 'Video + copy',
    category: 'media',
    defaultProps: baseDefaults({
      title: 'Show the product in motion',
      body: 'Use this section for walkthroughs, event recaps, founder intros, or feature demos.',
      videoUrl: '',
      cta: 'Watch overview',
      layout: 'media-right',
      background: '#eff6ff',
      accent: '#2563eb',
      paddingTop: 'lg',
      paddingBottom: 'lg',
    }),
    fields: [
      titleField,
      bodyField,
      { key: 'videoUrl', label: 'Video URL (YouTube/MP4)', type: 'text', tab: 'content', group: 'Media' },
      { key: 'cta', label: 'Button label', type: 'text', tab: 'content', group: 'Action' },
      {
        key: 'layout',
        label: 'Layout',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: 'media-right', label: 'Media right' },
          { value: 'media-left', label: 'Media left' },
          { value: 'overlay', label: 'Full overlay' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  embed: {
    type: 'embed',
    name: 'Embed / iFrame',
    description: 'Drop in a YouTube, Spotify, Figma, Maps, or any embed URL.',
    preview: 'Embed iframe',
    category: 'media',
    defaultProps: baseDefaults({
      title: 'Live embed',
      body: 'Use this block for a Figma, YouTube, Spotify, Calendar, or Map embed.',
      url: '',
      aspect: '16/9',
      background: '#0f172a',
      accent: '#facc15',
      paddingTop: 'md',
      paddingBottom: 'md',
    }),
    fields: [
      titleField,
      bodyField,
      { key: 'url', label: 'Embed URL', type: 'text', tab: 'content', group: 'Embed' },
      {
        key: 'aspect',
        label: 'Aspect ratio',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: '16/9', label: '16:9' },
          { value: '4/3', label: '4:3' },
          { value: '1/1', label: 'Square' },
          { value: '21/9', label: '21:9' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  comparison: {
    type: 'comparison',
    name: 'Comparison',
    description: 'Before/after or plan comparison with two columns.',
    preview: 'Two-column contrast',
    category: 'utility',
    defaultProps: baseDefaults({
      eyebrow: 'Before vs after',
      title: 'Before VibeBuilder / after VibeBuilder',
      style: 'split',
      background: '#ffffff',
      accent: '#16a34a',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      leftTitle: 'Scattered drafts',
      leftBody: 'Copy, images, page order, and publishing status live in separate places.',
      rightTitle: 'One canvas',
      rightBody: 'Every page becomes a structured layout with reusable blocks and a clean live route.',
    }),
    fields: [
      eyebrowField,
      titleField,
      { key: 'leftTitle', label: 'Left title', type: 'text', tab: 'content', group: 'Left column' },
      { key: 'leftBody', label: 'Left body', type: 'textarea', tab: 'content', group: 'Left column' },
      { key: 'rightTitle', label: 'Right title', type: 'text', tab: 'content', group: 'Right column' },
      { key: 'rightBody', label: 'Right body', type: 'textarea', tab: 'content', group: 'Right column' },
      {
        key: 'style',
        label: 'Style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'split', label: 'Split' },
          { value: 'checklist', label: 'Checklist' },
          { value: 'cards', label: 'Cards' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  cta: {
    type: 'cta',
    name: 'CTA Band',
    description: 'A bold conversion band for next-step actions.',
    preview: 'Headline + button',
    category: 'commerce',
    defaultProps: baseDefaults({
      eyebrow: 'Ready when you are',
      title: 'Turn the next idea into a live page',
      body: 'Give visitors a clear reason to act now.',
      cta: 'Start building',
      secondaryCta: 'Talk to us',
      align: 'center',
      style: 'solid',
      background: '#0f172a',
      accent: '#14b8a6',
      paddingTop: 'lg',
      paddingBottom: 'lg',
    }),
    fields: [
      eyebrowField,
      titleField,
      bodyField,
      { key: 'cta', label: 'Primary button', type: 'text', tab: 'content', group: 'Actions' },
      { key: 'secondaryCta', label: 'Secondary link', type: 'text', tab: 'content', group: 'Actions' },
      alignField(),
      {
        key: 'style',
        label: 'Style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'gradient', label: 'Gradient' },
          { value: 'outline', label: 'Outline' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  button: {
    type: 'button',
    name: 'Button',
    description: 'A single call-to-action button placed on its own line.',
    preview: 'Standalone button',
    category: 'utility',
    defaultProps: baseDefaults({
      label: 'Click me',
      url: '#',
      align: 'left',
      size: 'md',
      style: 'solid',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'sm',
      paddingBottom: 'sm',
    }),
    fields: [
      { key: 'label', label: 'Label', type: 'text', tab: 'content', group: 'Button' },
      { key: 'url', label: 'Link URL', type: 'text', tab: 'content', group: 'Button' },
      alignField(),
      {
        key: 'size',
        label: 'Size',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
        ],
      },
      {
        key: 'style',
        label: 'Style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'outline', label: 'Outline' },
          { value: 'ghost', label: 'Ghost' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  location: {
    type: 'location',
    name: 'Location',
    description: 'Address and map-style panel for venues, offices, or events.',
    preview: 'Map + address',
    category: 'utility',
    defaultProps: baseDefaults({
      title: 'Visit the studio',
      address: 'Banani, Dhaka',
      hours: 'Sunday to Thursday, 10:00-18:00',
      body: 'Use this block for places, event venues, and service areas.',
      mapStyle: 'grid',
      background: '#f0fdf4',
      accent: '#15803d',
      paddingTop: 'lg',
      paddingBottom: 'lg',
    }),
    fields: [
      titleField,
      { key: 'address', label: 'Address', type: 'text', tab: 'content', group: 'Place' },
      { key: 'hours', label: 'Hours', type: 'text', tab: 'content', group: 'Place' },
      bodyField,
      {
        key: 'mapStyle',
        label: 'Map style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'grid', label: 'Grid' },
          { value: 'minimal', label: 'Minimal' },
          { value: 'satellite', label: 'Satellite' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  socialProof: {
    type: 'socialProof',
    name: 'Reviews',
    description: 'Review cards with ratings and short customer wins.',
    preview: 'Review cards',
    category: 'social-proof',
    defaultProps: baseDefaults({
      title: 'Loved by launch teams',
      rating: 5,
      background: '#f8fafc',
      accent: '#f59e0b',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { quote: 'We shipped in a single afternoon.', name: 'Ari', role: 'Founder' },
        { quote: 'The public page stayed clean while the draft kept evolving.', name: 'Lena', role: 'Designer' },
        { quote: 'It finally made our page system understandable.', name: 'Sam', role: 'PM' },
      ],
    }),
    fields: [
      titleField,
      { key: 'rating', label: 'Stars per review', type: 'range', tab: 'style', group: 'Style', min: 1, max: 5, step: 1 },
      accentField,
      {
        key: 'items',
        label: 'Reviews',
        type: 'list',
        tab: 'content',
        group: 'Reviews',
        itemLabel: 'Review',
        defaultItem: { quote: 'Honest review', name: 'Customer', role: 'Role' },
        itemFields: [
          { key: 'quote', label: 'Quote', type: 'textarea' },
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'role', label: 'Role', type: 'text' },
        ],
      },
      ...universalFields,
    ],
  },

  socialIcons: {
    type: 'socialIcons',
    name: 'Social Icons',
    description: 'Linkable social platform icons.',
    preview: 'Icon row',
    category: 'utility',
    defaultProps: baseDefaults({
      align: 'center',
      shape: 'circle',
      size: 'md',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'sm',
      paddingBottom: 'sm',
      items: [
        { platform: 'twitter', url: 'https://twitter.com' },
        { platform: 'instagram', url: 'https://instagram.com' },
        { platform: 'linkedin', url: 'https://linkedin.com' },
        { platform: 'github', url: 'https://github.com' },
      ],
    }),
    fields: [
      alignField(),
      {
        key: 'shape',
        label: 'Shape',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'circle', label: 'Circle' },
          { value: 'square', label: 'Square' },
          { value: 'plain', label: 'Plain' },
        ],
      },
      {
        key: 'size',
        label: 'Size',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
        ],
      },
      accentField,
      {
        key: 'items',
        label: 'Networks',
        type: 'list',
        tab: 'content',
        group: 'Networks',
        itemLabel: 'Network',
        defaultItem: { platform: 'globe', url: 'https://example.com' },
        itemFields: [
          {
            key: 'platform',
            label: 'Platform',
            type: 'select',
            options: ['twitter', 'facebook', 'instagram', 'linkedin', 'github', 'youtube', 'globe', 'mail'],
          },
          { key: 'url', label: 'URL', type: 'text' },
        ],
      },
      ...universalFields,
    ],
  },

  spacer: {
    type: 'spacer',
    name: 'Spacer',
    description: 'Pure vertical breathing room with optional label.',
    preview: 'Vertical gap',
    category: 'layout',
    defaultProps: baseDefaults({
      label: '',
      height: 96,
      sizePreset: 'custom',
      background: '#ffffff',
      accent: '#cbd5e1',
      paddingTop: 'none',
      paddingBottom: 'none',
    }),
    fields: [
      { key: 'label', label: 'Label', type: 'text', tab: 'content', group: 'Spacer' },
      {
        key: 'sizePreset',
        label: 'Quick height',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: 'custom', label: 'Custom' },
          { value: 'tight', label: 'Tight' },
          { value: 'comfort', label: 'Comfort' },
          { value: 'section', label: 'Section' },
        ],
      },
      {
        key: 'height',
        label: 'Height (px)',
        type: 'range',
        tab: 'style',
        group: 'Layout',
        min: 16,
        max: 320,
        step: 8,
        visibleWhen: (props) => props.sizePreset === 'custom' || !props.sizePreset,
      },
      ...universalFields,
    ],
  },

  divider: {
    type: 'divider',
    name: 'Divider',
    description: 'A horizontal rule, dotted, dashed, or thick.',
    preview: 'Horizontal line',
    category: 'layout',
    defaultProps: baseDefaults({
      label: '',
      style: 'line',
      thickness: 1,
      dividerWidth: 'full',
      background: '#ffffff',
      accent: '#cbd5e1',
      paddingTop: 'sm',
      paddingBottom: 'sm',
    }),
    fields: [
      { key: 'label', label: 'Inline label', type: 'text', tab: 'content', group: 'Divider' },
      {
        key: 'dividerWidth',
        label: 'Line width',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'full', label: 'Full' },
          { value: 'medium', label: 'Medium' },
          { value: 'narrow', label: 'Narrow' },
        ],
      },
      {
        key: 'style',
        label: 'Style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'line', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dots', label: 'Dotted' },
          { value: 'wave', label: 'Wave' },
        ],
      },
      { key: 'thickness', label: 'Thickness', type: 'range', tab: 'style', group: 'Style', min: 1, max: 8, step: 1 },
      accentField,
      ...universalFields,
    ],
  },

  section: {
    type: 'section',
    name: 'Section (band)',
    description: 'Empty structural band with min-height—use between blocks like an Elementor section.',
    preview: 'Layout shell',
    category: 'layout',
    defaultProps: baseDefaults({
      minHeight: 120,
      showHelperLabel: false,
      background: '#f8fafc',
      accent: '#cbd5e1',
      paddingTop: 'lg',
      paddingBottom: 'lg',
    }),
    fields: [
      { key: 'minHeight', label: 'Min height (px)', type: 'range', tab: 'style', group: 'Layout', min: 40, max: 480, step: 8 },
      {
        key: 'showHelperLabel',
        label: 'Show placeholder label',
        type: 'boolean',
        tab: 'content',
        group: 'Section',
        description: 'Faint on-page hint while editing sparse layouts.',
      },
      accentField,
      ...universalFields,
    ],
  },

  container: {
    type: 'container',
    name: 'Container',
    description: 'Centered box with constrained width—stack content blocks around it.',
    preview: 'Box shell',
    category: 'layout',
    defaultProps: baseDefaults({
      minHeight: 80,
      maxWidth: 'default',
      showHelperLabel: false,
      background: '#ffffff',
      accent: '#cbd5e1',
      paddingTop: 'md',
      paddingBottom: 'md',
    }),
    fields: [
      { key: 'minHeight', label: 'Min height (px)', type: 'range', tab: 'style', group: 'Layout', min: 32, max: 400, step: 8 },
      {
        key: 'showHelperLabel',
        label: 'Show placeholder label',
        type: 'boolean',
        tab: 'content',
        group: 'Container',
      },
      accentField,
      ...universalFields,
    ],
  },

  stack: {
    type: 'stack',
    name: 'Flex stack',
    description: 'Row or column flex shell with gap—foundational layout primitive.',
    preview: 'Flex layout',
    category: 'layout',
    defaultProps: baseDefaults({
      direction: 'column',
      gap: 'md',
      justify: 'start',
      alignItems: 'stretch',
      wrap: false,
      minHeight: 72,
      showHelperLabel: false,
      background: '#ffffff',
      accent: '#94a3b8',
      paddingTop: 'md',
      paddingBottom: 'md',
    }),
    fields: [
      {
        key: 'direction',
        label: 'Direction',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Flex',
        options: [
          { value: 'row', label: 'Row' },
          { value: 'column', label: 'Column' },
        ],
      },
      {
        key: 'gap',
        label: 'Gap',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Flex',
        options: [
          { value: 'none', label: 'None' },
          { value: 'sm', label: 'S' },
          { value: 'md', label: 'M' },
          { value: 'lg', label: 'L' },
          { value: 'xl', label: 'XL' },
        ],
      },
      {
        key: 'justify',
        label: 'Justify',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Flex',
        options: [
          { value: 'start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'end', label: 'End' },
          { value: 'between', label: 'Between' },
        ],
      },
      {
        key: 'alignItems',
        label: 'Align',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Flex',
        options: [
          { value: 'start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'end', label: 'End' },
          { value: 'stretch', label: 'Stretch' },
        ],
      },
      {
        key: 'wrap',
        label: 'Wrap',
        type: 'boolean',
        tab: 'style',
        group: 'Flex',
      },
      { key: 'minHeight', label: 'Min height (px)', type: 'range', tab: 'style', group: 'Flex', min: 32, max: 320, step: 8 },
      {
        key: 'showHelperLabel',
        label: 'Show placeholder label',
        type: 'boolean',
        tab: 'content',
        group: 'Stack',
      },
      accentField,
      ...universalFields,
    ],
  },

  imageCaption: {
    type: 'imageCaption',
    name: 'Image + caption',
    description: 'Simple figure with caption—sparse media primitive.',
    preview: 'Figure',
    category: 'media',
    defaultProps: baseDefaults({
      image: '',
      caption: 'Describe this image for visitors and screen readers.',
      align: 'center',
      ratio: '16/9',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'md',
      paddingBottom: 'md',
    }),
    fields: [
      { key: 'image', label: 'Image', type: 'image', tab: 'content', group: 'Media' },
      { key: 'caption', label: 'Caption', type: 'textarea', tab: 'content', group: 'Media' },
      alignField(),
      {
        key: 'ratio',
        label: 'Aspect ratio',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: '16/9', label: '16:9' },
          { value: '4/3', label: '4:3' },
          { value: '1/1', label: '1:1' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  htmlSnippet: {
    type: 'htmlSnippet',
    name: 'Custom HTML',
    description: 'Raw HTML rendered in a sandboxed frame (scripts disabled).',
    preview: 'HTML',
    category: 'utility',
    defaultProps: baseDefaults({
      html: '<p>Custom markup</p>',
      frameHeight: 200,
      background: '#ffffff',
      accent: '#64748b',
      paddingTop: 'sm',
      paddingBottom: 'sm',
    }),
    fields: [
      {
        key: 'html',
        label: 'HTML',
        type: 'textarea',
        tab: 'content',
        group: 'HTML',
        placeholder: '<p>…</p>',
      },
      {
        key: 'frameHeight',
        label: 'Frame height (px)',
        type: 'range',
        tab: 'style',
        group: 'Layout',
        min: 120,
        max: 720,
        step: 20,
      },
      accentField,
      ...universalFields,
    ],
  },

  alert: {
    type: 'alert',
    name: 'Alert / Banner',
    description: 'Inline notice for announcements and warnings.',
    preview: 'Notice strip',
    category: 'utility',
    defaultProps: baseDefaults({
      title: 'Heads up — limited launch slots',
      body: 'We are taking five new launches this month. Reserve a spot before next Tuesday.',
      kind: 'info',
      icon: 'Info',
      cta: 'Reserve a slot',
      url: '#',
      background: '#ecfeff',
      accent: '#0891b2',
      paddingTop: 'sm',
      paddingBottom: 'sm',
    }),
    fields: [
      titleField,
      bodyField,
      {
        key: 'kind',
        label: 'Kind',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'info', label: 'Info' },
          { value: 'success', label: 'Success' },
          { value: 'warning', label: 'Warning' },
          { value: 'error', label: 'Error' },
          { value: 'neutral', label: 'Neutral' },
        ],
      },
      { key: 'cta', label: 'Action label', type: 'text', tab: 'content', group: 'Action' },
      { key: 'url', label: 'Action URL', type: 'text', tab: 'content', group: 'Action' },
      accentField,
      ...universalFields,
    ],
  },

  quote: {
    type: 'quote',
    name: 'Pull Quote',
    description: 'A large stylized quote, perfect for editorial pages.',
    preview: 'Big quote',
    category: 'content',
    defaultProps: baseDefaults({
      quote: 'Editing should feel like writing, not configuring fields.',
      attribution: 'VibeBuilder principle 01',
      align: 'center',
      style: 'serif',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'lg',
      paddingBottom: 'lg',
    }),
    fields: [
      { key: 'quote', label: 'Quote', type: 'textarea', tab: 'content', group: 'Quote' },
      { key: 'attribution', label: 'Attribution', type: 'text', tab: 'content', group: 'Quote' },
      alignField(),
      {
        key: 'style',
        label: 'Style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'serif', label: 'Serif' },
          { value: 'sans', label: 'Sans' },
          { value: 'mono', label: 'Mono' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  columns: {
    type: 'columns',
    name: 'Columns',
    description: 'Two- or three-column text layout for side-by-side reading.',
    preview: 'Multi-column text',
    category: 'layout',
    defaultProps: baseDefaults({
      title: 'Two voices, one page',
      columns: 2,
      align: 'left',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { title: 'For founders', body: 'Build a proof page in an afternoon and edit it for years.' },
        { title: 'For studios', body: 'Spin up branded launch pages in repeatable, governed motion.' },
      ],
    }),
    fields: [
      titleField,
      { key: 'columns', label: 'Columns', type: 'range', tab: 'style', group: 'Layout', min: 2, max: 4, step: 1 },
      alignField(),
      accentField,
      {
        key: 'items',
        label: 'Columns',
        type: 'list',
        tab: 'content',
        group: 'Columns',
        itemLabel: 'Column',
        defaultItem: { title: 'New column', body: 'Body for this column.' },
        itemFields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'body', label: 'Body', type: 'textarea' },
        ],
      },
      ...universalFields,
    ],
  },

  cardGrid: {
    type: 'cardGrid',
    name: 'Card Grid',
    description: 'Image-led card grid for blog teasers, products, or studies.',
    preview: 'Image cards',
    category: 'content',
    defaultProps: baseDefaults({
      eyebrow: 'Field notes',
      title: 'Latest from the studio',
      columns: 3,
      background: '#f8fafc',
      accent: '#0f766e',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { image: '', tag: 'Article', title: 'How we approach launch pages', body: 'A short piece on our default editorial canvas.', url: '#' },
        { image: '', tag: 'Case', title: 'Sandbar Studio rebrand', body: 'A 3-page launch site shipped in one afternoon.', url: '#' },
        { image: '', tag: 'Tutorial', title: 'Build a hero in 5 moves', body: 'A guided tour through the canvas controls.', url: '#' },
      ],
    }),
    fields: [
      eyebrowField,
      titleField,
      { key: 'columns', label: 'Columns', type: 'range', tab: 'style', group: 'Layout', min: 2, max: 4, step: 1 },
      accentField,
      {
        key: 'items',
        label: 'Cards',
        type: 'list',
        tab: 'content',
        group: 'Cards',
        itemLabel: 'Card',
        defaultItem: { image: '', tag: 'Tag', title: 'Card title', body: 'Short description.', url: '#' },
        itemFields: [
          { key: 'image', label: 'Image', type: 'image' },
          { key: 'tag', label: 'Tag', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'body', label: 'Body', type: 'textarea' },
          { key: 'url', label: 'URL', type: 'text' },
        ],
      },
      ...universalFields,
    ],
  },

  progressBars: {
    type: 'progressBars',
    name: 'Progress Bars',
    description: 'Visualize skills, completion, or capability levels.',
    preview: 'Animated bars',
    category: 'interactive',
    defaultProps: baseDefaults({
      title: 'Capability profile',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { label: 'Brand voice', value: 88 },
        { label: 'Visual systems', value: 76 },
        { label: 'Public renderer', value: 92 },
      ],
    }),
    fields: [
      titleField,
      accentField,
      {
        key: 'items',
        label: 'Bars',
        type: 'list',
        tab: 'content',
        group: 'Bars',
        itemLabel: 'Bar',
        defaultItem: { label: 'New skill', value: 60 },
        itemFields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'value', label: 'Value (0-100)', type: 'range', min: 0, max: 100, step: 1 },
        ],
      },
      ...universalFields,
    ],
  },

  countdown: {
    type: 'countdown',
    name: 'Countdown',
    description: 'A live countdown to a launch, sale, or event.',
    preview: 'Date countdown',
    category: 'interactive',
    defaultProps: baseDefaults({
      eyebrow: 'Launching soon',
      title: 'Launch goes live in',
      cta: 'Notify me',
      target: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      background: '#0f172a',
      accent: '#facc15',
      paddingTop: 'lg',
      paddingBottom: 'lg',
    }),
    fields: [
      eyebrowField,
      titleField,
      { key: 'target', label: 'Target ISO date', type: 'text', tab: 'content', group: 'Countdown', placeholder: '2026-12-31T18:00:00Z' },
      { key: 'cta', label: 'Button label', type: 'text', tab: 'content', group: 'Action' },
      accentField,
      ...universalFields,
    ],
  },

  navbar: {
    type: 'navbar',
    name: 'Navbar',
    description: 'A simple top navigation with logo + links.',
    preview: 'Top navigation',
    category: 'navigation',
    defaultProps: baseDefaults({
      brand: 'Studio',
      cta: 'Get started',
      url: '#',
      sticky: false,
      background: '#ffffff',
      accent: '#0f172a',
      paddingTop: 'sm',
      paddingBottom: 'sm',
      items: [
        { label: 'Home', url: '#' },
        { label: 'Work', url: '#' },
        { label: 'About', url: '#' },
        { label: 'Contact', url: '#' },
      ],
    }),
    fields: [
      { key: 'brand', label: 'Brand', type: 'text', tab: 'content', group: 'Brand' },
      { key: 'cta', label: 'Button label', type: 'text', tab: 'content', group: 'Action' },
      { key: 'url', label: 'Button URL', type: 'text', tab: 'content', group: 'Action' },
      { key: 'sticky', label: 'Sticky on scroll', type: 'boolean', tab: 'style', group: 'Behavior' },
      accentField,
      {
        key: 'items',
        label: 'Links',
        type: 'list',
        tab: 'content',
        group: 'Links',
        itemLabel: 'Link',
        defaultItem: { label: 'New link', url: '#' },
        itemFields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'url', label: 'URL', type: 'text' },
        ],
      },
      ...universalFields,
    ],
  },

  footer: {
    type: 'footer',
    name: 'Footer',
    description: 'A multi-column footer with logo, copy, and link groups.',
    preview: 'Multi-column footer',
    category: 'navigation',
    defaultProps: baseDefaults({
      brand: 'Studio',
      tagline: 'A small studio that ships pages people actually like to scroll.',
      copyright: '© 2026 Studio',
      background: '#0f172a',
      accent: '#14b8a6',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        { heading: 'Studio', links: [{ label: 'About', url: '#' }, { label: 'Work', url: '#' }, { label: 'Contact', url: '#' }] },
        { heading: 'Resources', links: [{ label: 'Notes', url: '#' }, { label: 'Press kit', url: '#' }] },
        { heading: 'Social', links: [{ label: 'Twitter', url: '#' }, { label: 'LinkedIn', url: '#' }] },
      ],
    }),
    fields: [
      { key: 'brand', label: 'Brand', type: 'text', tab: 'content', group: 'Brand' },
      { key: 'tagline', label: 'Tagline', type: 'textarea', tab: 'content', group: 'Brand' },
      { key: 'copyright', label: 'Copyright', type: 'text', tab: 'content', group: 'Bottom' },
      accentField,
      {
        key: 'items',
        label: 'Link columns',
        type: 'list',
        tab: 'content',
        group: 'Columns',
        itemLabel: 'Column',
        defaultItem: { heading: 'New column', links: [] },
        itemFields: [
          { key: 'heading', label: 'Heading', type: 'text' },
        ],
      },
      ...universalFields,
    ],
  },

  contact: {
    type: 'contact',
    name: 'Contact Form',
    description: 'A polished lead capture block for public pages.',
    preview: 'Message form',
    category: 'forms',
    defaultProps: baseDefaults({
      title: 'Let us shape the next page',
      body: 'Tell us what you want to launch. We will come back with a practical next step.',
      email: 'hello@example.com',
      formStyle: 'solid',
      ctaLabel: 'Send message',
      background: '#10201d',
      accent: '#f59e0b',
      paddingTop: 'lg',
      paddingBottom: 'lg',
    }),
    fields: [
      titleField,
      bodyField,
      { key: 'email', label: 'Recipient email', type: 'text', tab: 'content', group: 'Form' },
      { key: 'ctaLabel', label: 'Submit label', type: 'text', tab: 'content', group: 'Form' },
      {
        key: 'formStyle',
        label: 'Style',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'split', label: 'Split' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  iconList: {
    type: 'iconList',
    name: 'Icon list',
    description: 'Bulleted-style row list with Lucide icons.',
    preview: 'Checklist with icons',
    category: 'content',
    defaultProps: baseDefaults({
      title: 'At a glance',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'md',
      paddingBottom: 'md',
      items: [
        { icon: 'Check', text: 'Launch-ready templates' },
        { icon: 'Zap', text: 'Fast edits across breakpoints' },
        { icon: 'ShieldCheck', text: 'Accessible, semantic output' },
      ],
    }),
    fields: [
      titleField,
      accentField,
      {
        key: 'items',
        label: 'Items',
        type: 'list',
        tab: 'content',
        group: 'Items',
        itemLabel: 'Item',
        defaultItem: { icon: 'Check', text: 'New item' },
        itemFields: [
          { key: 'icon', label: 'Lucide icon name', type: 'text', placeholder: 'Check' },
          { key: 'text', label: 'Text', type: 'text' },
        ],
      },
      ...universalFields,
    ],
  },

  starRating: {
    type: 'starRating',
    name: 'Star rating',
    description: 'A simple visual score or review stars.',
    preview: '0–5 stars',
    category: 'social-proof',
    defaultProps: baseDefaults({
      label: 'Rated by teams like yours',
      value: 4.5,
      maxStars: 5,
      showNumeric: true,
      background: '#ffffff',
      accent: '#f59e0b',
      paddingTop: 'md',
      paddingBottom: 'md',
    }),
    fields: [
      { key: 'label', label: 'Caption', type: 'text', tab: 'content', group: 'Text' },
      {
        key: 'value',
        label: 'Score',
        type: 'range',
        tab: 'content',
        group: 'Rating',
        min: 0,
        max: 5,
        step: 0.5,
      },
      {
        key: 'maxStars',
        label: 'Max stars',
        type: 'range',
        tab: 'content',
        group: 'Rating',
        min: 1,
        max: 10,
        step: 1,
      },
      { key: 'showNumeric', label: 'Show number', type: 'boolean', tab: 'content', group: 'Rating' },
      accentField,
      ...universalFields,
    ],
  },

  badgeRow: {
    type: 'badgeRow',
    name: 'Badge row',
    description: 'Pill labels for highlights, tags, or tech stack.',
    preview: 'Inline pills',
    category: 'utility',
    defaultProps: baseDefaults({
      background: '#f8fafc',
      accent: '#0f766e',
      paddingTop: 'sm',
      paddingBottom: 'sm',
      paddingX: 'md',
      badges: [
        { label: 'SOC 2' },
        { label: 'EU hosting' },
        { label: 'SLA 99.9%' },
      ],
    }),
    fields: [
      accentField,
      {
        key: 'badges',
        label: 'Badges',
        type: 'list',
        tab: 'content',
        group: 'Badges',
        itemLabel: 'Badge',
        defaultItem: { label: 'New badge' },
        itemFields: [{ key: 'label', label: 'Label', type: 'text' }],
      },
      ...universalFields,
    ],
  },

  breadcrumbs: {
    type: 'breadcrumbs',
    name: 'Breadcrumbs',
    description: 'Path trail with optional links.',
    preview: 'Home / Page',
    category: 'navigation',
    defaultProps: baseDefaults({
      background: '#f8fafc',
      accent: '#0f766e',
      paddingTop: 'sm',
      paddingBottom: 'sm',
      paddingX: 'md',
      separator: 'chevron',
      items: [
        { label: 'Home', url: '#' },
        { label: 'Docs', url: '#' },
        { label: 'Builder' },
      ],
    }),
    fields: [
      {
        key: 'separator',
        label: 'Separator',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Style',
        options: [
          { value: 'chevron', label: '›' },
          { value: 'slash', label: '/' },
          { value: 'dot', label: '•' },
        ],
      },
      accentField,
      {
        key: 'items',
        label: 'Trail',
        type: 'list',
        tab: 'content',
        group: 'Items',
        itemLabel: 'Crumb',
        defaultItem: { label: 'Page', url: '#' },
        itemFields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'url', label: 'URL (optional)', type: 'text' },
        ],
      },
      ...universalFields,
    ],
  },

  backToTop: {
    type: 'backToTop',
    name: 'Back to top',
    description: 'Floating control to return to the page top.',
    preview: 'Scroll affordance',
    category: 'utility',
    defaultProps: baseDefaults({
      label: 'Top',
      threshold: 400,
      background: '#0f172a',
      accent: '#14b8a6',
      paddingTop: 'none',
      paddingBottom: 'none',
    }),
    fields: [
      { key: 'label', label: 'Button label', type: 'text', tab: 'content', group: 'Button' },
      {
        key: 'threshold',
        label: 'Show after scroll (px)',
        type: 'range',
        tab: 'style',
        group: 'Behavior',
        min: 120,
        max: 1200,
        step: 40,
      },
      accentField,
      ...universalFields,
    ],
  },

  simpleTable: {
    type: 'simpleTable',
    name: 'Simple table',
    description: 'A small responsive data table.',
    preview: 'Rows and columns',
    category: 'content',
    defaultProps: baseDefaults({
      caption: 'Compare plans',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'md',
      paddingBottom: 'md',
      striped: true,
      headers: [{ text: 'Feature' }, { text: 'Free' }, { text: 'Pro' }],
      rows: [
        { cells: [{ text: 'Projects' }, { text: '3' }, { text: '∞' }] },
        { cells: [{ text: 'Support' }, { text: 'Email' }, { text: 'Priority' }] },
      ],
    }),
    fields: [
      { key: 'caption', label: 'Caption', type: 'text', tab: 'content', group: 'Table' },
      { key: 'striped', label: 'Striped rows', type: 'boolean', tab: 'style', group: 'Style' },
      accentField,
      {
        key: 'headers',
        label: 'Header cells',
        type: 'list',
        tab: 'content',
        group: 'Columns',
        itemLabel: 'Column',
        defaultItem: { text: 'Column' },
        itemFields: [{ key: 'text', label: 'Heading', type: 'text' }],
      },
      {
        key: 'rows',
        label: 'Rows',
        type: 'list',
        tab: 'content',
        group: 'Rows',
        itemLabel: 'Row',
        defaultItem: { cells: [{ text: '' }, { text: '' }, { text: '' }] },
        itemFields: [
          {
            key: 'cells',
            label: 'Cells',
            type: 'list',
            itemLabel: 'Cell',
            defaultItem: { text: '' },
            itemFields: [{ key: 'text', label: 'Text', type: 'text' }],
          },
        ],
      },
      ...universalFields,
    ],
  },

  toggleContent: {
    type: 'toggleContent',
    name: 'Toggle content',
    description: 'Flip between two short messages or panels.',
    preview: 'Front / back',
    category: 'interactive',
    defaultProps: baseDefaults({
      frontTitle: 'Why us?',
      frontBody: 'We ship pages you can iterate on without filing a ticket.',
      backTitle: 'How it works',
      backBody: 'Drop blocks, tune theme, publish when it feels right.',
      flipLabel: 'Flip',
      flipBackLabel: 'Flip back',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'md',
      paddingBottom: 'md',
      minHeight: 180,
    }),
    fields: [
      { key: 'frontTitle', label: 'Front title', type: 'text', tab: 'content', group: 'Front' },
      { key: 'frontBody', label: 'Front body', type: 'textarea', tab: 'content', group: 'Front' },
      { key: 'backTitle', label: 'Back title', type: 'text', tab: 'content', group: 'Back' },
      { key: 'backBody', label: 'Back body', type: 'textarea', tab: 'content', group: 'Back' },
      { key: 'flipLabel', label: 'Button (show back)', type: 'text', tab: 'content', group: 'Action' },
      { key: 'flipBackLabel', label: 'Button (show front)', type: 'text', tab: 'content', group: 'Action' },
      {
        key: 'minHeight',
        label: 'Min height (px)',
        type: 'range',
        tab: 'style',
        group: 'Layout',
        min: 120,
        max: 360,
        step: 8,
      },
      accentField,
      ...universalFields,
    ],
  },

  lightboxImage: {
    type: 'lightboxImage',
    name: 'Lightbox image',
    description: 'Thumbnail or button opens a large image in a modal.',
    preview: 'Zoom image',
    category: 'media',
    defaultProps: baseDefaults({
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
      thumb: '',
      alt: 'Workspace photo',
      caption: 'Tap to enlarge',
      triggerStyle: 'thumb',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'md',
      paddingBottom: 'md',
    }),
    fields: [
      { key: 'image', label: 'Full image URL', type: 'image', tab: 'content', group: 'Media' },
      { key: 'thumb', label: 'Thumbnail (optional)', type: 'image', tab: 'content', group: 'Media' },
      { key: 'alt', label: 'Alt text', type: 'text', tab: 'content', group: 'Media' },
      { key: 'caption', label: 'Caption under trigger', type: 'text', tab: 'content', group: 'Media' },
      {
        key: 'triggerStyle',
        label: 'Trigger',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Layout',
        options: [
          { value: 'thumb', label: 'Thumbnail' },
          { value: 'button', label: 'Button' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  animatedHeadline: {
    type: 'animatedHeadline',
    name: 'Animated headline',
    description: 'Large title with a subtle motion treatment.',
    preview: 'Motion heading',
    category: 'content',
    defaultProps: baseDefaults({
      text: 'Build pages that feel alive',
      sub: 'Motion that respects reduced motion preferences.',
      style: 'gradientShift',
      background: '#0f172a',
      accent: '#5eead4',
      paddingTop: 'lg',
      paddingBottom: 'lg',
    }),
    fields: [
      { key: 'text', label: 'Headline', type: 'text', tab: 'content', group: 'Text' },
      { key: 'sub', label: 'Subline', type: 'text', tab: 'content', group: 'Text' },
      {
        key: 'style',
        label: 'Animation',
        type: 'buttonGroup',
        tab: 'style',
        group: 'Motion',
        options: [
          { value: 'gradientShift', label: 'Gradient' },
          { value: 'fadeRise', label: 'Rise' },
          { value: 'none', label: 'None' },
        ],
      },
      accentField,
      ...universalFields,
    ],
  },

  audioPlayer: {
    type: 'audioPlayer',
    name: 'Audio',
    description: 'Hosted audio file with native controls.',
    preview: 'MP3 / podcast',
    category: 'media',
    defaultProps: baseDefaults({
      title: 'Episode snippet',
      src: '',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'md',
      paddingBottom: 'md',
    }),
    fields: [
      { key: 'title', label: 'Title', type: 'text', tab: 'content', group: 'Track' },
      { key: 'src', label: 'Audio URL (.mp3, .ogg)', type: 'text', tab: 'content', group: 'Track', placeholder: 'https://...' },
      accentField,
      ...universalFields,
    ],
  },

  beforeAfter: {
    type: 'beforeAfter',
    name: 'Before / after',
    description: 'Compare two images with a draggable divider.',
    preview: 'Image slider',
    category: 'media',
    defaultProps: baseDefaults({
      beforeImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
      afterImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&q=80',
      beforeLabel: 'Before',
      afterLabel: 'After',
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'md',
      paddingBottom: 'md',
      aspectRatio: '16/9',
    }),
    fields: [
      { key: 'beforeImage', label: 'Before image', type: 'image', tab: 'content', group: 'Images' },
      { key: 'afterImage', label: 'After image', type: 'image', tab: 'content', group: 'Images' },
      { key: 'beforeLabel', label: 'Before label', type: 'text', tab: 'content', group: 'Labels' },
      { key: 'afterLabel', label: 'After label', type: 'text', tab: 'content', group: 'Labels' },
      { key: 'aspectRatio', label: 'Aspect ratio', type: 'text', tab: 'style', group: 'Layout', placeholder: '16/9' },
      accentField,
      ...universalFields,
    ],
  },

  testimonialCarousel: {
    type: 'testimonialCarousel',
    name: 'Testimonial carousel',
    description: 'Rotating quotes with optional avatars.',
    preview: 'Quote slider',
    category: 'social-proof',
    defaultProps: baseDefaults({
      title: 'Loved by teams',
      intervalSec: 6,
      background: '#ffffff',
      accent: '#0f766e',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      items: [
        {
          quote: 'We went from blank canvas to launch in a weekend.',
          name: 'Jamie Chen',
          role: 'Product lead',
          image: '',
        },
        {
          quote: 'Finally a builder that does not fight our design system.',
          name: 'Alex Rivera',
          role: 'Engineer',
          image: '',
        },
        {
          quote: 'Publishing feels safe — draft and go live when we are ready.',
          name: 'Sam Okonkwo',
          role: 'Marketing',
          image: '',
        },
      ],
    }),
    fields: [
      titleField,
      {
        key: 'intervalSec',
        label: 'Auto-advance (seconds)',
        type: 'range',
        tab: 'style',
        group: 'Carousel',
        min: 3,
        max: 20,
        step: 1,
      },
      accentField,
      {
        key: 'items',
        label: 'Slides',
        type: 'list',
        tab: 'content',
        group: 'Quotes',
        itemLabel: 'Testimonial',
        defaultItem: { quote: '', name: '', role: '', image: '' },
        itemFields: [
          { key: 'quote', label: 'Quote', type: 'textarea' },
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'role', label: 'Role', type: 'text' },
          { key: 'image', label: 'Avatar', type: 'image' },
        ],
      },
      ...universalFields,
    ],
  },

  marquee: {
    type: 'marquee',
    name: 'Marquee',
    description: 'Horizontally scrolling announcement line.',
    preview: 'Ticker text',
    category: 'content',
    defaultProps: baseDefaults({
      text: 'Ship faster with Vibe — design once, publish everywhere — ',
      seconds: 22,
      background: '#0f172a',
      accent: '#5eead4',
      paddingTop: 'sm',
      paddingBottom: 'sm',
      paddingX: 'none',
    }),
    fields: [
      { key: 'text', label: 'Text', type: 'textarea', tab: 'content', group: 'Ticker' },
      {
        key: 'seconds',
        label: 'Loop duration (s)',
        type: 'range',
        tab: 'style',
        group: 'Motion',
        min: 8,
        max: 60,
        step: 1,
      },
      accentField,
      ...universalFields,
    ],
  },
};

const formatBytes = (n: number) => {
  if (n < 10) return n.toFixed(0);
  return n.toString();
};

const Countdown = ({ target, color }: { target: string; color: string }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const targetMs = new Date(target).getTime();
  const diff = Math.max(0, targetMs - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const cells: [string, number][] = [
    ['Days', days],
    ['Hours', hours],
    ['Minutes', minutes],
    ['Seconds', seconds],
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cells.map(([label, value]) => (
        <div
          key={label}
          className="rounded-2xl px-4 py-5 text-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)' }}
        >
          <p className="text-4xl font-semibold tabular-nums" style={{ color }}>
            {formatBytes(value).padStart(2, '0')}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(247,244,234,0.55)]">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
};

const renderEmbed = (url: string) => {
  if (!url) return null;
  let src = url;
  const youtubeMatch = url.match(/(?:youtu\.be\/|v=)([\w-]{6,})/);
  if (youtubeMatch) {
    src = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  return (
    <iframe
      src={src}
      title="Embed"
      className="h-full w-full rounded-2xl border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      loading="lazy"
    />
  );
};

export const VibeBlockRenderer = ({ block }: { block: VibeBlock }) => {
  const injectChild = useBuilderChildRenderer();
  const accent = prop(block, 'accent', '#0f766e');
  const tokens = contrastTokens(prop(block, 'background', '#ffffff'));

  if (block.type === 'hero') {
    const layout = prop(block, 'heroLayout', 'split');
    const align = prop(block, 'align', 'left');
    const minHeight = `${numberProp(block, 'heroHeight', 620)}px`;
    const media = safeImageUrl(block.props.media);
    const headline = prop(block, 'headline');
    const showBody = !boolProp(block, 'hideBody', false);
    const headlineSize = prop(block, 'headlineSize', 'lg');
    const mediaFit = prop(block, 'mediaFit', 'cover') as 'cover' | 'contain';
    const mediaPos = prop(block, 'mediaPosition', 'center');
    const overlayStrength = numberProp(block, 'overlayStrength', 55);
    const ctaUrl = prop(block, 'ctaUrl', '');
    const secondaryUrl = prop(block, 'secondaryUrl', '');
    const ctaNewTab = boolProp(block, 'ctaNewTab', false);
    const secondaryNewTab = boolProp(block, 'secondaryNewTab', false);
    const primaryVariant = prop(block, 'primaryButtonStyle', 'solid');
    const primarySize = prop(block, 'primaryButtonSize', 'md');

    const headlineClasses: Record<string, string> = {
      sm: 'text-3xl font-semibold leading-tight sm:text-4xl',
      md: 'text-3xl font-semibold leading-tight sm:text-5xl',
      lg: 'text-4xl font-semibold leading-tight sm:text-6xl',
      xl: 'text-4xl font-semibold leading-tight sm:text-6xl md:text-7xl',
    };
    const hCls = headlineClasses[headlineSize] ?? headlineClasses.lg;

    const bgPos =
      mediaPos === 'top' ? 'center top' : mediaPos === 'bottom' ? 'center bottom' : 'center';

    const overlayAlpha = Math.max(0, Math.min(1, overlayStrength / 100));
    const overlayGradient = media
      ? `linear-gradient(rgba(15,23,42,${0.32 + overlayAlpha * 0.35}), rgba(15,23,42,${0.42 + overlayAlpha * 0.38})), url(${media})`
      : undefined;

    const alignClass =
      align === 'center'
        ? 'items-center text-center'
        : align === 'right'
          ? 'items-end text-right'
          : 'items-start text-left';
    const justifyClass =
      align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start';

    const inner = (
      <div className={`flex flex-col gap-7 ${alignClass}`}>
        {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
        <h1 className={`vibe-hero-title break-words text-balance ${hCls}`} style={{ color: tokens.strong }}>
          {headline}
        </h1>
        {showBody && (
          <p className={`max-w-2xl text-lg leading-relaxed ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`} style={{ color: tokens.body }}>
            {prop(block, 'body')}
          </p>
        )}
        <div className={`flex flex-wrap items-center gap-3 ${justifyClass}`}>
          {prop(block, 'cta') &&
            (ctaUrl ? (
              <HeroPrimaryCta
                label={prop(block, 'cta')}
                href={ctaUrl}
                newTab={ctaNewTab}
                accent={accent}
                variant={primaryVariant}
                size={primarySize}
              />
            ) : (
              <PrimaryButton background={accent} label={prop(block, 'cta')} />
            ))}
          {prop(block, 'secondaryCta') &&
            (secondaryUrl ? (
              <a
                href={secondaryUrl}
                className="text-sm font-semibold underline-offset-4 hover:underline"
                style={{ color: tokens.strong }}
                target={secondaryNewTab ? '_blank' : undefined}
                rel={secondaryNewTab ? 'noopener noreferrer' : undefined}
              >
                {prop(block, 'secondaryCta')}
              </a>
            ) : (
              <button
                type="button"
                className="text-sm font-semibold underline-offset-4 hover:underline"
                style={{ color: tokens.strong }}
              >
                {prop(block, 'secondaryCta')}
              </button>
            ))}
        </div>
      </div>
    );

    return (
      <Section block={block} fallbackBackground="#0f172a">
        {layout === 'overlay' && media && overlayGradient ? (
          <div
            className="relative max-w-full overflow-hidden rounded-3xl"
            style={{
              minHeight,
              backgroundImage: overlayGradient,
              backgroundSize: 'cover',
              backgroundPosition: bgPos,
            }}
          >
            <div className="px-6 py-16 text-[#f7f4ea] sm:px-10 sm:py-24">{inner}</div>
          </div>
        ) : layout === 'split' ? (
          <div
            className="grid min-w-0 max-w-full items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
            style={{ minHeight }}
          >
            <div className="min-w-0">{inner}</div>
            <div
              className="relative min-w-0 max-w-full overflow-hidden rounded-3xl border"
              style={{ borderColor: tokens.surfaceBorder, background: tokens.surface }}
            >
              {media ? (
                <img
                  src={media}
                  alt=""
                  className="aspect-[5/4] max-h-[min(80dvh,900px)] w-full max-w-full object-cover"
                  style={{ objectFit: mediaFit, objectPosition: bgPos }}
                />
              ) : (
                <div className="grid aspect-[5/4] place-items-center" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.18), rgba(124,58,237,0.18))' }}>
                  <Sparkles className="size-12" style={{ color: accent }} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ minHeight }} className="grid place-items-center">
            <div
              className={`max-w-3xl ${
                align === 'center' ? 'text-center' : align === 'right' ? 'ml-auto text-right' : 'text-left'
              }`}
            >
              {inner}
            </div>
          </div>
        )}
      </Section>
    );
  }

  if (block.type === 'heading') {
    const Tag = (prop(block, 'level', 'h2') as 'h1' | 'h2' | 'h3' | 'h4');
    const align = prop(block, 'align', 'left');
    return (
      <Section block={block}>
        <div className={align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}>
          {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
          <Tag className="text-balance text-4xl font-semibold leading-tight sm:text-5xl" style={{ color: tokens.strong }}>
            {prop(block, 'title')}
          </Tag>
        </div>
      </Section>
    );
  }

  if (block.type === 'paragraph') {
    const size = prop(block, 'size', 'md');
    const align = prop(block, 'align', 'left');
    const sizes = { sm: 'text-sm leading-7', md: 'text-base leading-8', lg: 'text-lg leading-8' } as const;
    return (
      <Section block={block}>
        <p
          className={`${sizes[size as keyof typeof sizes] ?? sizes.md} ${align === 'center' ? 'mx-auto text-center' : align === 'right' ? 'text-right' : 'text-left'}`}
          style={{ color: tokens.body, maxWidth: align === 'center' ? '720px' : undefined }}
        >
          {prop(block, 'body')}
        </p>
      </Section>
    );
  }

  if (block.type === 'text') {
    const twoColumns = prop(block, 'columns', 'two') === 'two';
    return (
      <Section block={block}>
        <div className={`grid gap-8 ${twoColumns ? 'sm:grid-cols-[0.5fr_1fr]' : ''}`}>
          <div>
            {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
            <h2 className="break-words text-3xl font-semibold leading-tight" style={{ color: tokens.strong }}>
              {prop(block, 'title')}
            </h2>
          </div>
          <p className="whitespace-pre-line text-base leading-8" style={{ color: tokens.body }}>
            {prop(block, 'body')}
          </p>
        </div>
      </Section>
    );
  }

  if (block.type === 'features' || block.type === 'cardGrid') {
    const isCardGrid = block.type === 'cardGrid';
    const items = listProp<Record<string, string>>(block, 'items', []);
    const columns = numberProp(block, 'columns', 3);
    const cardStyle = prop(block, 'cardStyle', 'soft');
    const iconStyle = prop(block, 'iconStyle', 'tile');

    const gridCols = columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

    const normalizedCardStyle = cardStyle === 'glass' ? 'solid' : cardStyle;
    const cardClass = normalizedCardStyle === 'elevated'
      ? 'shadow-xl shadow-slate-950/10 border-transparent'
      : normalizedCardStyle === 'outlined'
        ? ''
        : '';

    return (
      <Section block={block}>
        <div className={`max-w-3xl ${prop(block, 'align', 'left') === 'center' ? 'mx-auto text-center' : ''}`}>
          {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
          {prop(block, 'title') && (
            <h2 className="text-3xl font-semibold leading-tight" style={{ color: tokens.strong }}>
              {prop(block, 'title')}
            </h2>
          )}
          {prop(block, 'body') && (
            <p className="mt-4 leading-7" style={{ color: tokens.body }}>
              {prop(block, 'body')}
            </p>
          )}
        </div>
        <div className={`mt-8 grid gap-5 ${gridCols}`}>
          {items.map((item, index) => {
            const cardImageUrl = safeImageUrl(item.image);
            const IconComponent =
              isCardGrid
                ? null
                : (item.icon && (lucideIconMap as Record<string, typeof Sparkles>)[item.icon]) ?? Sparkles;

            return (
              <article
                key={index}
                className={`relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1 ${cardClass}`}
                style={{
                  background: normalizedCardStyle === 'solid' ? withAlpha(tokens.surface, 0.82) : tokens.surface,
                  borderColor: tokens.surfaceBorder,
                }}
              >
                {isCardGrid ? (
                  <>
                    <div className="overflow-hidden rounded-xl">
                      {cardImageUrl ? (
                        <img
                          src={cardImageUrl}
                          alt={item.title}
                          className="aspect-[4/3] w-full max-w-full object-cover"
                        />
                      ) : (
                        <PlaceholderImage accent={accent} ratio="aspect-[4/3]" rounded="rounded-xl" isDark={tokens.isDark} />
                      )}
                    </div>
                    {item.tag && (
                      <p
                        className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em]"
                        style={{ color: accent }}
                      >
                        {item.tag}
                      </p>
                    )}
                    <h3 className="mt-2 text-lg font-semibold" style={{ color: tokens.strong }}>
                      {item.title}
                    </h3>
                    {item.body && (
                      <p className="mt-2 text-sm leading-6" style={{ color: tokens.body }}>
                        {item.body}
                      </p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                        style={{ color: accent }}
                      >
                        Read more <ArrowRight className="size-3.5" />
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      className={`mb-5 inline-flex size-11 items-center justify-center ${iconStyle === 'circle' ? 'rounded-full' : iconStyle === 'plain' ? '' : 'rounded-xl'}`}
                      style={
                        iconStyle === 'plain'
                          ? { color: accent }
                          : { backgroundColor: withAlpha(accent, 0.18), color: accent }
                      }
                    >
                      {IconComponent && <IconComponent className="size-5" />}
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: tokens.strong }}>
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6" style={{ color: tokens.body }}>
                      {item.body}
                    </p>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </Section>
    );
  }

  if (block.type === 'iconBox') {
    const Icon = (lucideIconMap as Record<string, typeof Sparkles>)[prop(block, 'icon', 'Sparkles')] ?? Sparkles;
    const iconStyle = prop(block, 'iconStyle', 'tile');
    const align = prop(block, 'align', 'center');
    return (
      <Section block={block}>
        <div className={`flex flex-col gap-4 ${align === 'center' ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start'}`}>
          <div
            className={`inline-flex size-12 items-center justify-center ${iconStyle === 'circle' ? 'rounded-full' : iconStyle === 'plain' ? '' : 'rounded-xl'}`}
            style={
              iconStyle === 'plain'
                ? { color: accent }
                : { backgroundColor: withAlpha(accent, 0.18), color: accent }
            }
          >
            <Icon className="size-6" />
          </div>
          <h3 className="text-2xl font-semibold leading-tight" style={{ color: tokens.strong }}>
            {prop(block, 'title')}
          </h3>
          <p className="max-w-prose leading-7" style={{ color: tokens.body }}>
            {prop(block, 'body')}
          </p>
        </div>
      </Section>
    );
  }

  if (block.type === 'stats') {
    const items = listProp<Record<string, string>>(block, 'items', []);
    const cardStyle = prop(block, 'cardStyle', 'solid');
    const normalizedCardStyle = cardStyle === 'glass' ? 'solid' : cardStyle;
    const cols = items.length === 4 ? 'sm:grid-cols-4' : items.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3';

    return (
      <Section block={block} fallbackBackground="#0f172a">
        <div className={`max-w-3xl ${prop(block, 'align', 'left') === 'center' ? 'mx-auto text-center' : ''}`}>
          {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
          {prop(block, 'title') && (
            <h2 className="text-3xl font-semibold leading-tight" style={{ color: tokens.strong }}>
              {prop(block, 'title')}
            </h2>
          )}
        </div>
        <div className={`mt-8 grid gap-4 ${cols}`}>
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border px-6 py-7"
              style={{
                background: normalizedCardStyle === 'plain' ? 'transparent' : tokens.surface,
                borderColor: normalizedCardStyle === 'plain' ? 'transparent' : tokens.surfaceBorder,
              }}
            >
              <p className="text-5xl font-semibold tracking-tight" style={{ color: accent }}>
                {item.value}
              </p>
              <p className="mt-3 text-sm font-medium" style={{ color: tokens.body }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (block.type === 'gallery') {
    const items = listProp<Record<string, string>>(block, 'items', []);
    const layout = prop(block, 'layout', 'masonry');
    const columns = numberProp(block, 'columns', 3);
    const grid = layout === 'masonry'
      ? columns === 2 ? 'sm:grid-cols-2' : columns === 4 ? 'sm:grid-cols-[1.1fr_1fr_1fr_0.9fr]' : 'sm:grid-cols-[1.2fr_1fr_1fr]'
      : columns === 2 ? 'sm:grid-cols-2' : columns === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3';

    return (
      <Section block={block}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            {prop(block, 'title') && (
              <h2 className="text-3xl font-semibold" style={{ color: tokens.strong }}>
                {prop(block, 'title')}
              </h2>
            )}
            {prop(block, 'body') && (
              <p className="mt-3 max-w-2xl leading-7" style={{ color: tokens.body }}>
                {prop(block, 'body')}
              </p>
            )}
          </div>
          <div className="h-1 w-20 rounded-full" style={{ backgroundColor: accent }} />
        </div>
        <div className={`grid min-w-0 gap-4 ${grid}`}>
          {items.map((item, index) => {
            const gallerySrc = safeImageUrl(item.image);
            return (
            <figure
              key={index}
              className={`min-w-0 overflow-hidden rounded-2xl border bg-[#f7f4ea] shadow-sm ${layout === 'masonry' && index === 0 ? 'sm:row-span-2' : ''}`}
              style={{ borderColor: tokens.surfaceBorder, background: tokens.surface }}
            >
              {gallerySrc ? (
                <img
                  src={gallerySrc}
                  alt={item.caption}
                  className={`max-h-[min(85dvh,1200px)] w-full max-w-full object-cover ${layout === 'masonry' && index === 0 ? 'aspect-[4/5] h-full' : 'aspect-[4/3]'}`}
                />
              ) : (
                <PlaceholderImage
                  accent={accent}
                  ratio={layout === 'masonry' && index === 0 ? 'aspect-[4/5]' : 'aspect-[4/3]'}
                  rounded="rounded-none"
                  isDark={tokens.isDark}
                />
              )}
              {item.caption && (
                <figcaption className="px-4 py-3 text-sm font-medium" style={{ color: tokens.body }}>
                  {item.caption}
                </figcaption>
              )}
            </figure>
            );
          })}
        </div>
      </Section>
    );
  }

  if (block.type === 'image') {
    const aspect = prop(block, 'aspect', '16/9');
    const align = prop(block, 'align', 'center');
    const wrapAlign = align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';
    const aspectClass: Record<string, string> = {
      '16/9': 'aspect-video',
      '4/3': 'aspect-[4/3]',
      '1/1': 'aspect-square',
      '3/4': 'aspect-[3/4]',
      auto: '',
    };
    const imageBlockUrl = safeImageUrl(block.props.image);

    return (
      <Section block={block}>
        <div className={`min-w-0 max-w-4xl ${wrapAlign}`}>
          {imageBlockUrl ? (
            <img
              src={imageBlockUrl}
              alt={prop(block, 'caption')}
              className={`w-full max-w-full overflow-hidden rounded-3xl object-cover ${aspectClass[aspect] ?? ''}`}
            />
          ) : (
            <PlaceholderImage
              accent={accent}
              ratio={aspectClass[aspect] || 'aspect-video'}
              rounded="rounded-3xl"
              isDark={tokens.isDark}
            />
          )}
          {prop(block, 'caption') && (
            <p className="mt-3 text-center text-sm" style={{ color: tokens.muted }}>
              {prop(block, 'caption')}
            </p>
          )}
        </div>
      </Section>
    );
  }

  if (block.type === 'testimonial') {
    const tone = prop(block, 'tone', 'card');
    const isMinimal = tone === 'minimal';
    const isGradient = tone === 'gradient';

    const testimonialAvatar = safeImageUrl(block.props.avatar);

    return (
      <Section block={block} fallbackBackground="#fff7ed">
        <figure
          className={`mx-auto max-w-4xl ${isMinimal ? 'border-l-4 pl-6' : 'rounded-3xl border p-10'} ${isGradient ? 'text-[#f7f4ea]' : ''}`}
          style={{
            borderColor: accent,
            background: isMinimal
              ? 'transparent'
              : isGradient
                ? `linear-gradient(135deg, ${accent}, ${withAlpha(accent, 0.45)})`
                : tokens.surface,
            boxShadow: tone === 'card' ? '0 18px 60px -28px rgba(15,23,42,0.15)' : undefined,
          }}
        >
          <MessageSquareQuote className="mb-6 size-9" style={{ color: isGradient ? '#ffffff' : accent }} />
          <blockquote
            className="text-2xl font-semibold leading-snug"
            style={{ color: isGradient ? '#ffffff' : tokens.strong }}
          >
            &ldquo;{prop(block, 'quote')}&rdquo;
          </blockquote>
          <figcaption className="mt-7 flex items-center gap-3 text-sm">
            {testimonialAvatar ? (
              <img src={testimonialAvatar} alt={prop(block, 'name')} className="size-10 max-w-full rounded-full object-cover" />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full" style={{ background: withAlpha(accent, 0.2), color: accent }}>
                {prop(block, 'name', '?').slice(0, 1)}
              </div>
            )}
            <div style={{ color: isGradient ? 'rgba(255,255,255,0.85)' : tokens.body }}>
              <p className="font-semibold" style={{ color: isGradient ? '#ffffff' : tokens.strong }}>
                {prop(block, 'name')}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: isGradient ? 'rgba(255,255,255,0.75)' : tokens.muted }}>
                {prop(block, 'role')}
              </p>
            </div>
          </figcaption>
        </figure>
      </Section>
    );
  }

  if (block.type === 'pricing') {
    const items = listProp<Record<string, string>>(block, 'items', []);
    const featured = boolProp(block, 'featured', false);
    return (
      <Section block={block}>
        <div className="grid items-center gap-8 md:grid-cols-[1fr_400px]">
          <div>
            {prop(block, 'label') && (
              <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>
                {prop(block, 'label')}
              </p>
            )}
            <h2 className="mt-3 text-4xl font-semibold leading-tight" style={{ color: tokens.strong }}>
              {prop(block, 'title')}
            </h2>
            {prop(block, 'body') && (
              <p className="mt-4 max-w-xl leading-7" style={{ color: tokens.body }}>
                {prop(block, 'body')}
              </p>
            )}
          </div>
          <article
            className={`relative overflow-hidden rounded-3xl border p-8 ${featured ? 'shadow-2xl shadow-slate-950/15' : ''}`}
            style={{
              background: featured ? `linear-gradient(160deg, ${withAlpha(accent, 0.08)}, ${tokens.surface})` : tokens.surface,
              borderColor: featured ? accent : tokens.surfaceBorder,
            }}
          >
            {featured && (
              <span className="absolute right-5 top-5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ background: accent, color: isDarkColor(accent) ? '#ffffff' : '#0f172a' }}>
                Popular
              </span>
            )}
            <p className="text-5xl font-semibold leading-none" style={{ color: tokens.strong }}>
              {prop(block, 'price')}
              {prop(block, 'period') && (
                <span className="ml-2 text-sm font-medium" style={{ color: tokens.muted }}>
                  {prop(block, 'period')}
                </span>
              )}
            </p>
            <div className="mt-6 grid gap-3">
              {items.map((item, index) => (
                <p key={index} className="flex gap-3 text-sm" style={{ color: tokens.body }}>
                  <Check className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />
                  {item.text}
                </p>
              ))}
            </div>
            <button
              className="mt-7 h-11 w-full rounded-xl text-sm font-semibold shadow-md"
              style={{ backgroundColor: accent, color: isDarkColor(accent) ? '#ffffff' : '#0f172a' }}
              type="button"
            >
              {prop(block, 'cta')}
            </button>
          </article>
        </div>
      </Section>
    );
  }

  if (block.type === 'pricingTable') {
    const items = listProp<Record<string, unknown>>(block, 'items', []);
    return (
      <Section block={block}>
        <div className="mx-auto max-w-3xl text-center">
          {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
          {prop(block, 'title') && (
            <h2 className="text-balance text-4xl font-semibold leading-tight" style={{ color: tokens.strong }}>
              {prop(block, 'title')}
            </h2>
          )}
          {prop(block, 'body') && (
            <p className="mt-4 leading-7" style={{ color: tokens.body }}>
              {prop(block, 'body')}
            </p>
          )}
        </div>
        <div className={`mt-10 grid gap-5 ${items.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          {items.map((plan, index) => {
            const featured = Boolean(plan.featured);
            const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
            return (
              <article
                key={index}
                className={`relative flex flex-col rounded-3xl border p-7 ${featured ? 'shadow-2xl shadow-slate-950/15' : ''}`}
                style={{
                  background: featured ? `linear-gradient(160deg, ${withAlpha(accent, 0.1)}, ${tokens.surface})` : tokens.surface,
                  borderColor: featured ? accent : tokens.surfaceBorder,
                }}
              >
                {featured && (
                  <span className="absolute -top-3 left-7 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ background: accent, color: isDarkColor(accent) ? '#ffffff' : '#0f172a' }}>
                    Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold" style={{ color: tokens.strong }}>{String(plan.name ?? '')}</h3>
                <div className="mt-3 flex items-end gap-2">
                  <p className="text-4xl font-semibold" style={{ color: tokens.strong }}>{String(plan.price ?? '')}</p>
                  <p className="pb-1 text-sm" style={{ color: tokens.muted }}>{String(plan.period ?? '')}</p>
                </div>
                {plan.body != null && String(plan.body).trim() !== '' && (
                  <p className="mt-3 text-sm leading-6" style={{ color: tokens.body }}>{String(plan.body)}</p>
                )}
                <div className="mt-5 grid flex-1 gap-2.5">
                  {features.map((feature, i) => (
                    <p key={i} className="flex items-start gap-2 text-sm" style={{ color: tokens.body }}>
                      <Check className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />
                      {feature}
                    </p>
                  ))}
                </div>
                <button
                  className="mt-7 h-11 w-full rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: featured ? accent : 'transparent', color: featured ? (isDarkColor(accent) ? '#ffffff' : '#0f172a') : tokens.strong, border: featured ? 'none' : `1px solid ${tokens.surfaceBorder}` }}
                >
                  {String(plan.cta ?? 'Choose')}
                </button>
              </article>
            );
          })}
        </div>
      </Section>
    );
  }

  if (block.type === 'faq' || block.type === 'accordion') {
    const items = listProp<Record<string, string>>(block, 'items', []);
    const accordionStyle = prop(block, 'style', 'plain');

    return (
      <Section block={block}>
        <div className="grid gap-10 md:grid-cols-[0.6fr_1fr]">
          <div>
            {block.type === 'faq' && <CircleHelp className="mb-5 size-8" style={{ color: accent }} />}
            {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
            <h2 className="text-3xl font-semibold leading-tight" style={{ color: tokens.strong }}>
              {prop(block, 'title')}
            </h2>
            {prop(block, 'body') && (
              <p className="mt-4 leading-7" style={{ color: tokens.body }}>
                {prop(block, 'body')}
              </p>
            )}
          </div>
          <div className={`grid ${accordionStyle === 'separated' ? 'gap-3' : 'gap-0 divide-y'}`} style={{ '--tw-divide-opacity': 1, borderColor: tokens.divider } as React.CSSProperties}>
            {items.map((item, index) => (
              <details
                key={index}
                className={`group ${accordionStyle === 'cards' ? 'rounded-2xl border p-5' : accordionStyle === 'separated' ? 'rounded-2xl border p-5' : 'p-5'}`}
                style={{
                  borderColor: accordionStyle === 'plain' ? 'transparent' : tokens.surfaceBorder,
                  background: accordionStyle === 'plain' ? 'transparent' : tokens.surface,
                }}
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold" style={{ color: tokens.strong }}>
                  {item.question}
                  <ChevronDown className="size-4 transition group-open:rotate-180" style={{ color: accent }} />
                </summary>
                <p className="mt-3 text-sm leading-6" style={{ color: tokens.body }}>
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  if (block.type === 'tabs') {
    return <TabsBlock block={block} accent={accent} tokens={tokens} />;
  }

  if (block.type === 'logoStrip') {
    const items = listProp<Record<string, string>>(block, 'items', []);
    const layout = prop(block, 'layout', 'grid');

    return (
      <Section block={block}>
        {prop(block, 'eyebrow') && (
          <p className="text-center text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: accent }}>
            {prop(block, 'eyebrow')}
          </p>
        )}
        <div
          className={`mt-6 grid items-center gap-3 ${layout === 'inline' ? 'grid-flow-col auto-cols-[minmax(120px,_1fr)] overflow-x-auto pb-2 [scrollbar-width:none]' : layout === 'cards' ? 'sm:grid-cols-3 md:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-center px-4 py-5 text-center text-sm font-semibold uppercase tracking-[0.18em] ${layout === 'cards' ? 'rounded-2xl border bg-[#f7f4ea] shadow-sm' : ''}`}
              style={{
                color: tokens.body,
                borderColor: tokens.surfaceBorder,
                background: layout === 'cards' ? tokens.surface : 'transparent',
              }}
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-8 object-contain" />
              ) : (
                item.name
              )}
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (block.type === 'process') {
    const items = listProp<Record<string, string>>(block, 'items', []);
    const cards = prop(block, 'layout', 'rail') === 'cards';
    return (
      <Section block={block}>
        <div className="max-w-3xl">
          <Rocket className="mb-4 size-8" style={{ color: accent }} />
          {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
          <h2 className="text-3xl font-semibold leading-tight" style={{ color: tokens.strong }}>
            {prop(block, 'title')}
          </h2>
          {prop(block, 'body') && (
            <p className="mt-4 leading-7" style={{ color: tokens.body }}>
              {prop(block, 'body')}
            </p>
          )}
        </div>
        <div className={`mt-8 grid gap-5 ${cards ? 'md:grid-cols-3' : ''}`}>
          {items.map((item, index) => (
            <article
              key={index}
              className="relative rounded-3xl border p-6"
              style={{ background: tokens.surface, borderColor: tokens.surfaceBorder }}
            >
              <div
                className="mb-4 inline-flex size-10 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: accent, color: isDarkColor(accent) ? '#ffffff' : '#0f172a' }}
              >
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold" style={{ color: tokens.strong }}>{item.title}</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: tokens.body }}>{item.body}</p>
            </article>
          ))}
        </div>
      </Section>
    );
  }

  if (block.type === 'team') {
    const items = listProp<Record<string, string>>(block, 'items', []);
    const layout = prop(block, 'layout', 'cards');
    return (
      <Section block={block}>
        <div className="mb-8 max-w-3xl">
          <UsersRound className="mb-4 size-8" style={{ color: accent }} />
          {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
          {prop(block, 'title') && (
            <h2 className="text-3xl font-semibold leading-tight" style={{ color: tokens.strong }}>
              {prop(block, 'title')}
            </h2>
          )}
          {prop(block, 'body') && (
            <p className="mt-4 leading-7" style={{ color: tokens.body }}>
              {prop(block, 'body')}
            </p>
          )}
        </div>
        <div className={`grid gap-4 ${layout === 'compact' ? 'md:grid-cols-2' : layout === 'avatar' ? 'sm:grid-cols-2 md:grid-cols-4' : 'md:grid-cols-3'}`}>
          {items.map((item, index) => (
            <article
              key={index}
              className={`rounded-3xl border p-4 ${layout === 'compact' ? 'flex items-center gap-4' : ''}`}
              style={{ background: tokens.surface, borderColor: tokens.surfaceBorder }}
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className={`${layout === 'compact' || layout === 'avatar' ? 'size-20' : 'aspect-[4/3] w-full'} rounded-2xl object-cover`} />
              ) : (
                <div
                  className={`${layout === 'compact' || layout === 'avatar' ? 'size-20' : 'aspect-[4/3] w-full'} flex items-center justify-center rounded-2xl`}
                  style={{ background: withAlpha(accent, 0.18), color: accent }}
                >
                  <UsersRound className="size-8" />
                </div>
              )}
              <div className={layout === 'compact' ? '' : 'mt-4'}>
                <h3 className="text-lg font-semibold" style={{ color: tokens.strong }}>{item.name}</h3>
                <p className="text-sm" style={{ color: tokens.muted }}>{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    );
  }

  if (block.type === 'timeline') {
    const items = listProp<Record<string, string>>(block, 'items', []);
    const horizontal = prop(block, 'orientation', 'vertical') === 'horizontal';

    return (
      <Section block={block} fallbackBackground="#0f172a">
        <CalendarDays className="mb-4 size-8" style={{ color: accent }} />
        <h2 className="text-3xl font-semibold" style={{ color: tokens.strong }}>{prop(block, 'title')}</h2>
        <div className={`mt-8 ${horizontal ? 'grid gap-3 sm:grid-cols-3 md:grid-cols-4' : 'relative grid gap-5'}`}>
          {!horizontal && (
            <span
              className="absolute left-3 top-2 bottom-2 w-px"
              style={{ background: tokens.divider }}
              aria-hidden
            />
          )}
          {items.map((item, index) => (
            <article
              key={index}
              className={horizontal ? 'rounded-2xl border p-5' : 'relative rounded-2xl border p-5 pl-9'}
              style={{ background: tokens.surface, borderColor: tokens.surfaceBorder }}
            >
              {!horizontal && (
                <span
                  className="absolute left-2 top-7 size-2.5 rounded-full"
                  style={{ background: accent }}
                  aria-hidden
                />
              )}
              <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>
                {item.date}
              </p>
              <h3 className="mt-2 text-lg font-semibold" style={{ color: tokens.strong }}>{item.title}</h3>
              {item.body && (
                <p className="mt-2 text-sm leading-6" style={{ color: tokens.body }}>{item.body}</p>
              )}
            </article>
          ))}
        </div>
      </Section>
    );
  }

  if (block.type === 'newsletter') {
    const layout = prop(block, 'layout', 'inline');

    return (
      <Section block={block} fallbackBackground="#fef3c7">
        <div className={`grid gap-6 rounded-3xl border p-8 ${layout === 'card' ? 'shadow-2xl shadow-slate-950/10' : ''} ${layout === 'inline' ? 'md:grid-cols-[1fr_auto] md:items-end' : ''}`}
          style={{ background: tokens.surface, borderColor: tokens.surfaceBorder }}
        >
          <div>
            <Newspaper className="mb-4 size-8" style={{ color: accent }} />
            {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
            <h2 className="text-3xl font-semibold" style={{ color: tokens.strong }}>{prop(block, 'title')}</h2>
            <p className="mt-3 max-w-xl leading-7" style={{ color: tokens.body }}>{prop(block, 'body')}</p>
          </div>
          <form className={`grid gap-3 ${layout === 'inline' ? 'sm:grid-cols-[260px_auto]' : ''}`} onSubmit={(event) => event.preventDefault()}>
            <input
              className="h-11 rounded-xl border px-4 text-sm"
              style={{ background: tokens.surface, borderColor: tokens.surfaceBorder, color: tokens.strong }}
              placeholder={prop(block, 'placeholder')}
            />
            <button
              type="submit"
              className="h-11 rounded-xl px-6 text-sm font-semibold"
              style={{ backgroundColor: accent, color: isDarkColor(accent) ? '#ffffff' : '#0f172a' }}
            >
              {prop(block, 'cta')}
            </button>
          </form>
        </div>
      </Section>
    );
  }

  if (block.type === 'video') {
    const layout = prop(block, 'layout', 'media-right');
    const url = prop(block, 'videoUrl');
    const isOverlay = layout === 'overlay';

    const media = (
      <div className="aspect-video overflow-hidden rounded-2xl border bg-slate-950 shadow-xl shadow-black/20" style={{ borderColor: tokens.surfaceBorder }}>
        {url ? (
          renderEmbed(url)
        ) : (
          <div className="grid h-full place-items-center text-[rgba(247,244,234,0.65)]">
            <div className="grid place-items-center gap-3">
              <div className="grid size-14 place-items-center rounded-full" style={{ background: withAlpha(accent, 0.2), color: accent }}>
                <Clapperboard className="size-7" />
              </div>
              <span className="text-xs uppercase tracking-[0.22em] text-[rgba(247,244,234,0.6)]">Video preview</span>
            </div>
          </div>
        )}
      </div>
    );

    if (isOverlay) {
      return (
        <Section block={block} fallbackBackground="#0f172a">
          <div className="grid gap-8">
            {media}
            <div className="max-w-3xl">
              <h2 className="text-4xl font-semibold leading-tight" style={{ color: tokens.strong }}>{prop(block, 'title')}</h2>
              <p className="mt-4 leading-7" style={{ color: tokens.body }}>{prop(block, 'body')}</p>
              <PrimaryButton background={accent} label={prop(block, 'cta')} className="mt-6" />
            </div>
          </div>
        </Section>
      );
    }

    return (
      <Section block={block}>
        <div className={`grid items-center gap-10 ${layout === 'media-left' ? 'md:grid-cols-[0.95fr_1.05fr]' : 'md:grid-cols-[1.05fr_0.95fr]'}`}>
          {layout === 'media-left' && media}
          <div>
            <h2 className="text-4xl font-semibold leading-tight" style={{ color: tokens.strong }}>{prop(block, 'title')}</h2>
            <p className="mt-4 leading-7" style={{ color: tokens.body }}>{prop(block, 'body')}</p>
            <PrimaryButton background={accent} label={prop(block, 'cta')} className="mt-6" />
          </div>
          {layout === 'media-right' && media}
        </div>
      </Section>
    );
  }

  if (block.type === 'embed') {
    const url = prop(block, 'url');
    const aspectClass: Record<string, string> = {
      '16/9': 'aspect-video',
      '4/3': 'aspect-[4/3]',
      '1/1': 'aspect-square',
      '21/9': 'aspect-[21/9]',
    };
    return (
      <Section block={block}>
        {prop(block, 'title') && (
          <h2 className="text-3xl font-semibold leading-tight" style={{ color: tokens.strong }}>{prop(block, 'title')}</h2>
        )}
        {prop(block, 'body') && (
          <p className="mt-3 max-w-2xl leading-7" style={{ color: tokens.body }}>{prop(block, 'body')}</p>
        )}
        <div className={`mt-6 overflow-hidden rounded-2xl border ${aspectClass[prop(block, 'aspect', '16/9')] ?? 'aspect-video'}`} style={{ background: '#000', borderColor: tokens.surfaceBorder }}>
          {url ? (
            renderEmbed(url)
          ) : (
            <div className="grid h-full place-items-center" style={{ color: tokens.muted }}>
              <Code2 className="size-10" />
            </div>
          )}
        </div>
      </Section>
    );
  }

  if (block.type === 'comparison') {
    const style = prop(block, 'style', 'split');
    return (
      <Section block={block}>
        <GitCompare className="mb-4 size-8" style={{ color: accent }} />
        {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
        {prop(block, 'title') && (
          <h2 className="max-w-3xl text-3xl font-semibold leading-tight" style={{ color: tokens.strong }}>
            {prop(block, 'title')}
          </h2>
        )}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            [prop(block, 'leftTitle'), prop(block, 'leftBody'), false],
            [prop(block, 'rightTitle'), prop(block, 'rightBody'), true],
          ].map(([title, body, isRight], index) => (
            <article
              key={index}
              className={`rounded-3xl border p-7 ${isRight && style === 'cards' ? 'shadow-xl shadow-slate-950/10' : ''}`}
              style={{ background: tokens.surface, borderColor: isRight ? accent : tokens.surfaceBorder }}
            >
              <div
                className="mb-4 inline-flex size-9 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: isRight ? accent : '#64748b', color: '#ffffff' }}
              >
                {style === 'checklist' && isRight ? <Check className="size-4" /> : index + 1}
              </div>
              <h3 className="text-xl font-semibold" style={{ color: tokens.strong }}>{title}</h3>
              <p className="mt-3 leading-7" style={{ color: tokens.body }}>{body}</p>
            </article>
          ))}
        </div>
      </Section>
    );
  }

  if (block.type === 'cta') {
    const align = prop(block, 'align', 'center');
    const style = prop(block, 'style', 'solid');
    const background = prop(block, 'background', '#0f172a');
    const ctaBackground = style === 'gradient'
      ? `linear-gradient(135deg, ${accent}, ${withAlpha(accent, 0.55)})`
      : style === 'outline'
        ? 'transparent'
        : accent;
    const ctaTextColor = style === 'outline' ? accent : isDarkColor(typeof ctaBackground === 'string' ? accent : '#000') ? '#ffffff' : '#0f172a';

    return (
      <Section block={block} fallbackBackground={background}>
        <div className={`max-w-4xl ${align === 'center' ? 'mx-auto text-center' : align === 'right' ? 'ml-auto text-right' : 'text-left'}`}>
          <Megaphone
            className={`mb-4 size-8 ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`}
            style={{ color: accent }}
          />
          {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
          <h2 className="text-balance text-4xl font-semibold leading-tight" style={{ color: tokens.strong }}>
            {prop(block, 'title')}
          </h2>
          {prop(block, 'body') && (
            <p
              className={`mt-4 leading-7 ${
                align === 'center' ? 'mx-auto max-w-2xl' : align === 'right' ? 'ml-auto max-w-2xl' : ''
              }`}
              style={{ color: tokens.body }}
            >
              {prop(block, 'body')}
            </p>
          )}
          <div className={`mt-7 flex flex-wrap items-center gap-3 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : ''}`}>
            <button
              type="button"
              className="rounded-xl px-6 py-3 text-sm font-semibold shadow-md transition hover:-translate-y-0.5"
              style={{
                background: ctaBackground,
                color: ctaTextColor,
                border: style === 'outline' ? `1px solid ${accent}` : 'none',
              }}
            >
              {prop(block, 'cta')}
            </button>
            {prop(block, 'secondaryCta') && (
              <button
                type="button"
                className="text-sm font-semibold underline-offset-4 hover:underline"
                style={{ color: tokens.strong }}
              >
                {prop(block, 'secondaryCta')}
              </button>
            )}
          </div>
        </div>
      </Section>
    );
  }

  if (block.type === 'button') {
    const align = prop(block, 'align', 'left');
    const size = prop(block, 'size', 'md');
    const style = prop(block, 'style', 'solid');
    const sizes = { sm: 'h-9 px-4 text-sm', md: 'h-11 px-6 text-sm', lg: 'h-14 px-8 text-base' } as const;

    return (
      <Section block={block}>
        <div className={`flex ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
          <a
            href={prop(block, 'url', '#')}
            className={`inline-flex items-center gap-2 rounded-xl font-semibold transition ${sizes[size as keyof typeof sizes] ?? sizes.md}`}
            style={
              style === 'solid'
                ? { background: accent, color: isDarkColor(accent) ? '#ffffff' : '#0f172a', boxShadow: '0 12px 40px -16px rgba(0,0,0,.3)' }
                : style === 'outline'
                  ? { color: accent, border: `1px solid ${accent}` }
                  : { color: accent, background: 'transparent' }
            }
          >
            {prop(block, 'label')}
            <ArrowRight className="size-4" />
          </a>
        </div>
      </Section>
    );
  }

  if (block.type === 'location') {
    const minimal = prop(block, 'mapStyle', 'grid') === 'minimal';
    const satellite = prop(block, 'mapStyle', 'grid') === 'satellite';
    return (
      <Section block={block}>
        <div className="grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <MapPin className="mb-4 size-8" style={{ color: accent }} />
            <h2 className="text-3xl font-semibold" style={{ color: tokens.strong }}>{prop(block, 'title')}</h2>
            {prop(block, 'body') && <p className="mt-4 leading-7" style={{ color: tokens.body }}>{prop(block, 'body')}</p>}
            <p className="mt-6 font-semibold" style={{ color: tokens.strong }}>{prop(block, 'address')}</p>
            <p className="mt-1 text-sm" style={{ color: tokens.muted }}>{prop(block, 'hours')}</p>
          </div>
          <div
            className="overflow-hidden rounded-3xl border p-6"
            style={{
              background: satellite
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(15, 23, 42, 0.85))'
                : minimal
                  ? tokens.surface
                  : 'transparent',
              backgroundImage: !minimal && !satellite
                ? 'linear-gradient(90deg, rgba(15,23,42,.08) 1px, transparent 1px), linear-gradient(rgba(15,23,42,.08) 1px, transparent 1px)'
                : undefined,
              backgroundSize: '28px 28px',
              borderColor: tokens.surfaceBorder,
            }}
          >
            <div
              className="grid h-64 place-items-center rounded-2xl border border-dashed"
              style={{ borderColor: tokens.surfaceBorder, background: tokens.surface }}
            >
              <MapPin className="size-12" style={{ color: accent }} />
            </div>
          </div>
        </div>
      </Section>
    );
  }

  if (block.type === 'socialProof') {
    const items = listProp<Record<string, string>>(block, 'items', []);
    const rating = numberProp(block, 'rating', 5);
    return (
      <Section block={block}>
        <ShieldCheck className="mb-4 size-8" style={{ color: accent }} />
        <h2 className="text-3xl font-semibold" style={{ color: tokens.strong }}>{prop(block, 'title')}</h2>
        <div className={`mt-8 grid gap-4 ${items.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
          {items.map((item, index) => (
            <article
              key={index}
              className="rounded-2xl border p-6"
              style={{ background: tokens.surface, borderColor: tokens.surfaceBorder }}
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" style={{ color: accent }} />
                ))}
              </div>
              <p className="text-sm leading-6" style={{ color: tokens.strong }}>&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-3 text-xs font-semibold" style={{ color: tokens.muted }}>
                {item.name} {item.role && <span className="opacity-60">· {item.role}</span>}
              </p>
            </article>
          ))}
        </div>
      </Section>
    );
  }

  if (block.type === 'socialIcons') {
    const items = listProp<Record<string, string>>(block, 'items', []);
    const align = prop(block, 'align', 'center');
    const shape = prop(block, 'shape', 'circle');
    const sz = prop(block, 'size', 'md');
    const sizeMap = { sm: 'size-9', md: 'size-11', lg: 'size-14' } as const;
    const iconSize = { sm: 'size-4', md: 'size-5', lg: 'size-6' } as const;

    return (
      <Section block={block}>
        <div className={`flex flex-wrap items-center gap-3 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
          {items.map((item, index) => {
            const Icon = (socialIconMap as Record<string, typeof Globe>)[item.platform] ?? Globe;
            return (
              <a
                key={index}
                href={item.url || '#'}
                className={`grid ${sizeMap[sz as keyof typeof sizeMap]} place-items-center transition hover:-translate-y-0.5 ${shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-xl' : ''}`}
                style={
                  shape === 'plain'
                    ? { color: accent }
                    : { background: withAlpha(accent, 0.18), color: accent }
                }
              >
                <Icon className={iconSize[sz as keyof typeof iconSize]} />
              </a>
            );
          })}
        </div>
      </Section>
    );
  }

  if (block.type === 'spacer') {
    const preset = prop(block, 'sizePreset', 'custom');
    const presetHeights: Record<string, number> = { tight: 32, comfort: 72, section: 160 };
    const height =
      preset !== 'custom' && presetHeights[preset] !== undefined
        ? presetHeights[preset]
        : numberProp(block, 'height', 96);
    return (
      <Section block={block}>
        <div className="grid place-items-center" style={{ minHeight: `${height}px` }}>
          {prop(block, 'label') && (
            <span className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: tokens.muted }}>
              {prop(block, 'label')}
            </span>
          )}
        </div>
      </Section>
    );
  }

  if (block.type === 'divider') {
    const style = prop(block, 'style', 'line');
    const thickness = numberProp(block, 'thickness', 1);
    const borderStyle = style === 'dots' ? 'dotted' : style === 'dashed' ? 'dashed' : 'solid';
    const widthMode = prop(block, 'dividerWidth', 'full');
    const lineWidth = widthMode === 'narrow' ? '38%' : widthMode === 'medium' ? '68%' : '100%';

    return (
      <Section block={block}>
        <div className="mx-auto flex w-full justify-center">
          <div className="flex max-w-full items-center gap-4" style={{ width: lineWidth }}>
            {style === 'wave' ? (
              <svg width="100%" height="24" viewBox="0 0 600 24" preserveAspectRatio="none" className="flex-1">
                <path d="M0 12 Q 50 0, 100 12 T 200 12 T 300 12 T 400 12 T 500 12 T 600 12" fill="none" stroke={accent} strokeWidth={thickness} />
              </svg>
            ) : (
              <span
                className="h-px flex-1"
                style={{ borderTop: `${thickness}px ${borderStyle} ${accent}` }}
              />
            )}
            {prop(block, 'label') && (
              <span className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: tokens.muted }}>
                {prop(block, 'label')}
              </span>
            )}
            {prop(block, 'label') && style !== 'wave' && (
              <span
                className="h-px flex-1"
                style={{ borderTop: `${thickness}px ${borderStyle} ${accent}` }}
              />
            )}
          </div>
        </div>
      </Section>
    );
  }

  if (block.type === 'alert') {
    const kind = prop(block, 'kind', 'info');
    const colors: Record<string, { bg: string; fg: string }> = {
      info: { bg: '#0ea5e9', fg: '#ffffff' },
      success: { bg: '#10b981', fg: '#ffffff' },
      warning: { bg: '#f59e0b', fg: '#0f172a' },
      error: { bg: '#ef4444', fg: '#ffffff' },
      neutral: { bg: '#64748b', fg: '#ffffff' },
    };
    const palette = colors[kind] ?? colors.info;
    const Icon = kind === 'warning' || kind === 'error' ? AlertTriangle : kind === 'success' ? Check : Info;

    return (
      <Section block={block}>
        <div
          className="flex flex-wrap items-center gap-4 rounded-2xl border p-5"
          style={{ background: withAlpha(palette.bg, 0.12), borderColor: withAlpha(palette.bg, 0.4) }}
        >
          <div className="grid size-10 place-items-center rounded-full" style={{ background: palette.bg, color: palette.fg }}>
            <Icon className="size-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold" style={{ color: tokens.strong }}>{prop(block, 'title')}</p>
            {prop(block, 'body') && (
              <p className="mt-1 text-sm leading-6" style={{ color: tokens.body }}>{prop(block, 'body')}</p>
            )}
          </div>
          {prop(block, 'cta') && (
            <a
              href={prop(block, 'url', '#')}
              className="rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ background: palette.bg, color: palette.fg }}
            >
              {prop(block, 'cta')}
            </a>
          )}
        </div>
      </Section>
    );
  }

  if (block.type === 'quote') {
    const align = prop(block, 'align', 'center');
    const style = prop(block, 'style', 'serif');
    const fontFamily = style === 'serif' ? 'Georgia, "Times New Roman", serif' : style === 'mono' ? 'ui-monospace, SFMono-Regular, monospace' : undefined;
    return (
      <Section block={block}>
        <figure className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : align === 'right' ? 'ml-auto text-right' : ''}`}>
          <QuoteIcon
            className={`mb-5 size-10 ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`}
            style={{ color: accent }}
          />
          <blockquote className="text-3xl font-semibold leading-tight sm:text-4xl" style={{ color: tokens.strong, fontFamily }}>
            &ldquo;{prop(block, 'quote')}&rdquo;
          </blockquote>
          {prop(block, 'attribution') && (
            <figcaption className="mt-6 text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: tokens.muted }}>
              — {prop(block, 'attribution')}
            </figcaption>
          )}
        </figure>
      </Section>
    );
  }

  if (block.type === 'columns') {
    const items = listProp<Record<string, string>>(block, 'items', []);
    const cols = numberProp(block, 'columns', 2);
    const align = prop(block, 'align', 'left');
    const grid = cols === 4 ? 'md:grid-cols-4' : cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

    return (
      <Section block={block}>
        {prop(block, 'title') && (
          <h2 className={`text-3xl font-semibold leading-tight ${alignClass}`} style={{ color: tokens.strong }}>
            {prop(block, 'title')}
          </h2>
        )}
        <div className={`mt-8 grid gap-8 ${grid} ${alignClass}`}>
          {items.map((item, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold" style={{ color: tokens.strong }}>{item.title}</h3>
              <p className="mt-3 text-base leading-7" style={{ color: tokens.body }}>{item.body}</p>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (block.type === 'progressBars') {
    const items = listProp<Record<string, unknown>>(block, 'items', []);
    return (
      <Section block={block}>
        {prop(block, 'title') && (
          <h2 className="text-3xl font-semibold" style={{ color: tokens.strong }}>{prop(block, 'title')}</h2>
        )}
        <div className="mt-7 grid gap-5">
          {items.map((item, index) => {
            const value = Math.max(0, Math.min(100, Number(item.value ?? 0)));
            return (
              <div key={index}>
                <div className="flex items-center justify-between text-sm font-semibold" style={{ color: tokens.body }}>
                  <span>{String(item.label ?? '')}</span>
                  <span style={{ color: accent }}>{value}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: tokens.divider }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${value}%`, background: accent }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    );
  }

  if (block.type === 'countdown') {
    const target = prop(block, 'target', new Date().toISOString());
    return (
      <Section block={block} fallbackBackground="#0f172a">
        <div className="mx-auto max-w-3xl text-center">
          {prop(block, 'eyebrow') && <Eyebrow color={accent}>{prop(block, 'eyebrow')}</Eyebrow>}
          {prop(block, 'title') && (
            <h2 className="text-4xl font-semibold leading-tight" style={{ color: tokens.strong }}>{prop(block, 'title')}</h2>
          )}
          <Countdown target={target} color={accent} />
          {prop(block, 'cta') && <PrimaryButton background={accent} label={prop(block, 'cta')} className="mx-auto mt-7" />}
        </div>
      </Section>
    );
  }

  if (block.type === 'navbar') {
    const items = listProp<Record<string, string>>(block, 'items', []);
    return (
      <Section block={block}>
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <a className="text-lg font-semibold" style={{ color: tokens.strong }} href="#">
            {prop(block, 'brand')}
          </a>
          <ul className="flex flex-wrap gap-1">
            {items.map((item, index) => (
              <li key={index}>
                <a
                  href={item.url || '#'}
                  className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-current/10"
                  style={{ color: tokens.body }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          {prop(block, 'cta') && (
            <a
              href={prop(block, 'url', '#')}
              className="rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ background: accent, color: isDarkColor(accent) ? '#ffffff' : '#0f172a' }}
            >
              {prop(block, 'cta')}
            </a>
          )}
        </nav>
      </Section>
    );
  }

  if (block.type === 'footer') {
    const items = listProp<Record<string, unknown>>(block, 'items', []);
    return (
      <Section block={block} fallbackBackground="#0f172a">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="text-2xl font-semibold" style={{ color: tokens.strong }}>{prop(block, 'brand')}</p>
            <p className="mt-3 text-sm leading-6" style={{ color: tokens.body }}>{prop(block, 'tagline')}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {items.map((column, index) => {
              const links = Array.isArray(column.links) ? (column.links as Array<{ label: string; url: string }>) : [];
              return (
                <div key={index}>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>
                    {String(column.heading ?? '')}
                  </p>
                  <ul className="mt-4 grid gap-2.5">
                    {links.map((link, j) => (
                      <li key={j}>
                        <a href={link.url || '#'} className="text-sm" style={{ color: tokens.body }}>
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6" style={{ borderColor: tokens.divider }}>
          <p className="text-xs" style={{ color: tokens.muted }}>{prop(block, 'copyright')}</p>
        </div>
      </Section>
    );
  }

  if (block.type === 'section') {
    const minH = numberProp(block, 'minHeight', 120);
    const renderNested = () =>
      block.children?.map((c, i, arr) =>
        injectChild ? (
          <Fragment key={c.id}>{injectChild(c, i, arr.length)}</Fragment>
        ) : (
          <VibeBlockRenderer key={c.id} block={c} />
        )
      ) ?? [];
    const nested = renderNested();
    return (
      <Section block={block}>
        {nested.length > 0 ? (
          <div className="flex w-full flex-col gap-4">{nested}</div>
        ) : (
          <div
            className="flex w-full items-center justify-center rounded-2xl border border-dashed"
            style={{
              minHeight: minH,
              borderColor: tokens.surfaceBorder,
              background: withAlpha(accent, tokens.isDark ? 0.08 : 0.05),
            }}
          >
            {boolProp(block, 'showHelperLabel', false) && (
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: tokens.muted }}>
                Section
              </span>
            )}
          </div>
        )}
      </Section>
    );
  }

  if (block.type === 'container') {
    const minH = numberProp(block, 'minHeight', 80);
    const renderNested = () =>
      block.children?.map((c, i, arr) =>
        injectChild ? (
          <Fragment key={c.id}>{injectChild(c, i, arr.length)}</Fragment>
        ) : (
          <VibeBlockRenderer key={c.id} block={c} />
        )
      ) ?? [];
    const nested = renderNested();
    return (
      <Section block={block}>
        {nested.length > 0 ? (
          <div className="flex w-full flex-col gap-4 px-0">{nested}</div>
        ) : (
          <div
            className="flex w-full items-center justify-center rounded-2xl border border-dashed px-4"
            style={{
              minHeight: minH,
              borderColor: tokens.surfaceBorder,
            }}
          >
            {boolProp(block, 'showHelperLabel', false) && (
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: tokens.muted }}>
                Container
              </span>
            )}
          </div>
        )}
      </Section>
    );
  }

  if (block.type === 'stack') {
    const direction = prop(block, 'direction', 'column') === 'row' ? 'row' : 'column';
    const gapKey = prop(block, 'gap', 'md');
    const gapPx =
      gapKey === 'none' ? 0 : gapKey === 'sm' ? 8 : gapKey === 'lg' ? 24 : gapKey === 'xl' ? 32 : 16;
    const justify = prop(block, 'justify', 'start');
    const justifyMap: Record<string, string> = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
    };
    const alignItems = prop(block, 'alignItems', 'stretch');
    const alignMap: Record<string, string> = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
    };
    const minH = numberProp(block, 'minHeight', 72);
    const renderNested = () =>
      block.children?.map((c, i, arr) =>
        injectChild ? (
          <Fragment key={c.id}>{injectChild(c, i, arr.length)}</Fragment>
        ) : (
          <VibeBlockRenderer key={c.id} block={c} />
        )
      ) ?? [];
    const nested = renderNested();
    return (
      <Section block={block}>
        <div
          className="flex w-full rounded-2xl border border-dashed p-2"
          style={{
            flexDirection: direction,
            gap: gapPx,
            justifyContent: justifyMap[justify] ?? 'flex-start',
            alignItems: alignMap[alignItems] ?? 'stretch',
            flexWrap: boolProp(block, 'wrap', false) ? 'wrap' : 'nowrap',
            minHeight: nested.length ? undefined : minH,
            borderColor: tokens.surfaceBorder,
          }}
        >
          {nested.length > 0 ? (
            nested
          ) : (
            boolProp(block, 'showHelperLabel', false) && (
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: tokens.muted }}>
                Flex {direction}
              </span>
            )
          )}
        </div>
      </Section>
    );
  }

  if (block.type === 'imageCaption') {
    const align = prop(block, 'align', 'center');
    const ratioRaw = prop(block, 'ratio', '16/9');
    const ar = ratioRaw.includes('/') ? ratioRaw.replace('/', ' / ') : '16 / 9';
    return (
      <Section block={block}>
        <figure
          className={
            align === 'center'
              ? 'mx-auto max-w-3xl text-center'
              : align === 'right'
                ? 'ml-auto max-w-3xl text-right'
                : 'max-w-3xl text-left'
          }
        >
          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: tokens.surfaceBorder }}>
            {prop(block, 'image') ? (
              <img src={prop(block, 'image')} alt="" className="w-full object-cover" style={{ aspectRatio: ar }} />
            ) : (
              <PlaceholderImage accent={accent} ratio="aspect-video" rounded="rounded-none" isDark={tokens.isDark} />
            )}
          </div>
          {prop(block, 'caption') && (
            <figcaption className="mt-3 text-sm leading-relaxed" style={{ color: tokens.body }}>
              {prop(block, 'caption')}
            </figcaption>
          )}
        </figure>
      </Section>
    );
  }

  if (block.type === 'htmlSnippet') {
    const frameH = numberProp(block, 'frameHeight', 200);
    const html = prop(block, 'html');
    const srcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;color:#0f172a;background:transparent;padding:12px;}</style></head><body>${html}</body></html>`;
    return (
      <Section block={block}>
        <iframe
          title="Custom HTML"
          srcDoc={srcDoc}
          sandbox=""
          className="w-full rounded-2xl border bg-white"
          style={{ borderColor: tokens.surfaceBorder, height: frameH }}
        />
      </Section>
    );
  }

  if (block.type === 'contact') {
    const formStyle = prop(block, 'formStyle', 'solid');
    const normalizedFormStyle = formStyle === 'glass' ? 'solid' : formStyle;
    const formSurface = tokens.isDark ? 'rgba(7,10,18,0.72)' : 'rgba(255,255,255,0.92)';
    const inputSurface = tokens.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.04)';
    return (
      <Section block={block} fallbackBackground="#10201d">
        <div className="grid items-start gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Mail className="mb-5 size-8" style={{ color: accent }} />
            <h2 className="text-3xl font-semibold leading-tight" style={{ color: tokens.strong }}>{prop(block, 'title')}</h2>
            <p className="mt-4 leading-7" style={{ color: tokens.body }}>{prop(block, 'body')}</p>
            <p className="mt-6 text-sm font-semibold" style={{ color: accent }}>{prop(block, 'email')}</p>
          </div>
          <form
            className={`grid gap-3 rounded-3xl p-5 ${normalizedFormStyle === 'split' ? 'sm:grid-cols-2' : ''}`}
            style={{
              background: normalizedFormStyle === 'solid' ? formSurface : tokens.surface,
              border: `1px solid ${tokens.surfaceBorder}`,
            }}
            onSubmit={(event) => event.preventDefault()}
          >
            <input className="h-11 rounded-xl border px-3 text-sm" style={{ borderColor: tokens.surfaceBorder, background: inputSurface, color: tokens.strong }} placeholder="Name" />
            <input className="h-11 rounded-xl border px-3 text-sm" style={{ borderColor: tokens.surfaceBorder, background: inputSurface, color: tokens.strong }} placeholder="Email" />
            <textarea className={`min-h-32 rounded-xl border px-3 py-3 text-sm ${normalizedFormStyle === 'split' ? 'sm:col-span-2' : ''}`} style={{ borderColor: tokens.surfaceBorder, background: inputSurface, color: tokens.strong }} placeholder="Project details" />
            <button
              type="submit"
              className={`h-11 rounded-xl text-sm font-semibold ${normalizedFormStyle === 'split' ? 'sm:col-span-2' : ''}`}
              style={{ backgroundColor: accent, color: isDarkColor(accent) ? '#ffffff' : '#0f172a' }}
            >
              <Send className="mr-2 inline size-4" />
              {prop(block, 'ctaLabel', 'Send')}
            </button>
          </form>
        </div>
      </Section>
    );
  }

  if (block.type === 'iconList') {
    const items = listProp<{ icon?: string; text?: string }>(block, 'items', []);
    return (
      <Section block={block}>
        <div className="mx-auto max-w-xl">
          {prop(block, 'title') && (
            <h3 className="mb-4 text-xl font-semibold" style={{ color: tokens.strong }}>
              {prop(block, 'title')}
            </h3>
          )}
          <ul className="grid gap-3">
            {items.map((item, i) => {
              const Icon = lucideIcon(item.icon ?? 'Check');
              return (
                <li key={i} className="flex gap-3">
                  <Icon className="mt-0.5 size-5 shrink-0" style={{ color: accent }} aria-hidden />
                  <span className="text-sm leading-relaxed" style={{ color: tokens.body }}>
                    {item.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>
    );
  }

  if (block.type === 'starRating') {
    const max = Math.max(1, Math.min(10, numberProp(block, 'maxStars', 5)));
    const value = Math.max(0, Math.min(max, numberProp(block, 'value', 4)));
    const showNum = boolProp(block, 'showNumeric', true);
    const rounded = Math.round(value * 2) / 2;
    return (
      <Section block={block}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-0.5" aria-label={`Rating ${value} of ${max}`}>
            {Array.from({ length: max }).map((_, i) => {
              const starVal = i + 1;
              const filled = rounded >= starVal;
              const half = !filled && rounded >= starVal - 0.5;
              return (
                <Star
                  key={i}
                  className="size-6"
                  style={{
                    color: filled || half ? accent : tokens.surfaceBorder,
                    opacity: filled ? 1 : half ? 0.85 : 0.35,
                  }}
                />
              );
            })}
          </div>
          {showNum && (
            <span className="text-sm font-semibold tabular-nums" style={{ color: tokens.strong }}>
              {value.toFixed(1)} / {max}
            </span>
          )}
          {prop(block, 'label') && (
            <span className="text-sm" style={{ color: tokens.muted }}>
              {prop(block, 'label')}
            </span>
          )}
        </div>
      </Section>
    );
  }

  if (block.type === 'badgeRow') {
    const badges = listProp<{ label?: string }>(block, 'badges', []);
    return (
      <Section block={block}>
        <div className="flex flex-wrap gap-2">
          {badges.map((b, i) => (
            <span
              key={i}
              className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{
                borderColor: tokens.surfaceBorder,
                color: tokens.strong,
                background: withAlpha(accent, tokens.isDark ? 0.12 : 0.08),
              }}
            >
              {b.label}
            </span>
          ))}
        </div>
      </Section>
    );
  }

  if (block.type === 'breadcrumbs') {
    const crumbs = listProp<{ label?: string; url?: string }>(block, 'items', []);
    const sep = prop(block, 'separator', 'chevron');
    const sepChar = sep === 'slash' ? '/' : sep === 'dot' ? '·' : null;
    return (
      <Section block={block}>
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex flex-wrap items-center gap-1" style={{ color: tokens.muted }}>
            {crumbs.map((c, i) => (
              <li key={i} className="inline-flex items-center gap-1">
                {i > 0 &&
                  (sepChar ? (
                    <span className="px-0.5 opacity-60" aria-hidden>
                      {sepChar}
                    </span>
                  ) : (
                    <CrumbChevronR className="size-3 shrink-0 opacity-50" aria-hidden />
                  ))}
                {c.url ? (
                  <a href={c.url} className="font-medium hover:underline" style={{ color: accent }}>
                    {c.label}
                  </a>
                ) : (
                  <span className="font-semibold" style={{ color: tokens.strong }}>
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </Section>
    );
  }

  if (block.type === 'backToTop') {
    const threshold = numberProp(block, 'threshold', 400);
    const label = prop(block, 'label', 'Top');
    return <BackToTopSection block={block} accent={accent} threshold={threshold} label={label} />;
  }

  if (block.type === 'simpleTable') {
    const headers = listProp<{ text?: string }>(block, 'headers', []);
    const rows = listProp<{ cells?: { text?: string }[] }>(block, 'rows', []);
    const striped = boolProp(block, 'striped', true);
    const caption = prop(block, 'caption');
    return (
      <Section block={block}>
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[280px] border-collapse text-left text-sm"
            style={{ borderColor: tokens.surfaceBorder }}
          >
            {caption && (
              <caption className="mb-2 text-left font-semibold" style={{ color: tokens.strong }}>
                {caption}
              </caption>
            )}
            <thead>
              <tr style={{ background: withAlpha(accent, tokens.isDark ? 0.15 : 0.1) }}>
                {headers.map((h, i) => (
                  <th key={i} className="border px-3 py-2 font-semibold" style={{ borderColor: tokens.surfaceBorder, color: tokens.strong }}>
                    {h.text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    background: striped && ri % 2 === 1 ? withAlpha(tokens.surfaceBorder, 0.12) : undefined,
                  }}
                >
                  {(row.cells ?? []).map((cell, ci) => (
                    <td key={ci} className="border px-3 py-2" style={{ borderColor: tokens.surfaceBorder, color: tokens.body }}>
                      {cell.text}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    );
  }

  if (block.type === 'marquee') {
    const text = prop(block, 'text', '');
    const sec = Math.max(8, numberProp(block, 'seconds', 22));
    const kid = `vm_${block.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    return (
      <Section block={block}>
        <style>{`@keyframes ${kid} { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        <div className="overflow-hidden py-2">
          <div
            className="flex w-max gap-16 whitespace-nowrap"
            style={{
              animation: `${kid} ${sec}s linear infinite`,
            }}
          >
            <span className="text-sm font-semibold" style={{ color: accent }}>
              {text}
            </span>
            <span className="text-sm font-semibold" aria-hidden="true" style={{ color: accent }}>
              {text}
            </span>
          </div>
        </div>
      </Section>
    );
  }

  if (block.type === 'toggleContent') {
    return <ToggleContentBlock block={block} accent={accent} tokens={tokens} />;
  }

  if (block.type === 'lightboxImage') {
    return <LightboxImageBlock block={block} accent={accent} tokens={tokens} />;
  }

  if (block.type === 'animatedHeadline') {
    return <AnimatedHeadlineBlock block={block} accent={accent} tokens={tokens} />;
  }

  if (block.type === 'audioPlayer') {
    const src = prop(block, 'src');
    const title = prop(block, 'title', 'Audio');
    return (
      <Section block={block}>
        <div className="mx-auto max-w-xl rounded-2xl border p-5" style={{ borderColor: tokens.surfaceBorder, background: tokens.surface }}>
          <p className="mb-3 text-sm font-semibold" style={{ color: tokens.strong }}>
            {title}
          </p>
          {src ? (
            <audio controls className="w-full" src={src} style={{ accentColor: accent }} />
          ) : (
            <p className="text-sm" style={{ color: tokens.muted }}>
              Add an audio URL in the inspector.
            </p>
          )}
        </div>
      </Section>
    );
  }

  if (block.type === 'beforeAfter') {
    return <BeforeAfterBlock block={block} accent={accent} tokens={tokens} />;
  }

  if (block.type === 'testimonialCarousel') {
    return <TestimonialCarouselBlock block={block} accent={accent} tokens={tokens} />;
  }

  return (
    <Section block={block}>
      <div style={{ color: tokens.body }}>Unknown block: {block.type}</div>
    </Section>
  );
};

const BackToTopSection = ({
  block,
  accent,
  threshold,
  label,
}: {
  block: VibeBlock;
  accent: string;
  threshold: number;
  label: string;
}) => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = document.scrollingElement ?? document.documentElement;
    const onScroll = () => setShown(el.scrollTop > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  if (!shown) return null;

  return (
    <Section block={block}>
      <button
        type="button"
        className="fixed bottom-6 right-6 z-[40] rounded-full px-4 py-2 text-sm font-semibold shadow-lg"
        style={{
          background: accent,
          color: isDarkColor(accent) ? '#ffffff' : '#0f172a',
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        {label}
      </button>
    </Section>
  );
};

const ToggleContentBlock = ({
  block,
  accent,
  tokens,
}: {
  block: VibeBlock;
  accent: string;
  tokens: ReturnType<typeof contrastTokens>;
}) => {
  const [showBack, setShowBack] = useState(false);
  const minH = numberProp(block, 'minHeight', 180);
  return (
    <Section block={block}>
      <div
        className="relative mx-auto max-w-xl overflow-hidden rounded-2xl border p-6"
        style={{ borderColor: tokens.surfaceBorder, background: tokens.surface, minHeight: minH }}
      >
        <div
          className="transition-opacity duration-300"
          style={{ opacity: showBack ? 0 : 1, pointerEvents: showBack ? 'none' : 'auto' }}
          aria-hidden={showBack}
        >
          <h3 className="text-xl font-semibold" style={{ color: tokens.strong }}>
            {prop(block, 'frontTitle')}
          </h3>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: tokens.body }}>
            {prop(block, 'frontBody')}
          </p>
        </div>
        <div
          className="absolute inset-0 flex flex-col justify-center p-6 transition-opacity duration-300"
          style={{ opacity: showBack ? 1 : 0, pointerEvents: showBack ? 'auto' : 'none' }}
          aria-hidden={!showBack}
        >
          <h3 className="text-xl font-semibold" style={{ color: tokens.strong }}>
            {prop(block, 'backTitle')}
          </h3>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: tokens.body }}>
            {prop(block, 'backBody')}
          </p>
        </div>
        <button
          type="button"
          className="relative z-10 mt-4 rounded-full px-4 py-2 text-sm font-semibold"
          style={{
            background: accent,
            color: isDarkColor(accent) ? '#ffffff' : '#0f172a',
          }}
          onClick={() => setShowBack((v) => !v)}
        >
          {showBack ? prop(block, 'flipBackLabel', 'Flip back') : prop(block, 'flipLabel', 'Flip')}
        </button>
      </div>
    </Section>
  );
};

const LightboxImageBlock = ({
  block,
  accent,
  tokens,
}: {
  block: VibeBlock;
  accent: string;
  tokens: ReturnType<typeof contrastTokens>;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const full = prop(block, 'image');
  const thumb = prop(block, 'thumb') || full;
  const alt = prop(block, 'alt', '');
  const caption = prop(block, 'caption');
  const triggerStyle = prop(block, 'triggerStyle', 'thumb');

  return (
    <Section block={block}>
      <figure className="mx-auto max-w-lg">
        {triggerStyle === 'button' ? (
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-semibold"
            style={{
              background: accent,
              color: isDarkColor(accent) ? '#ffffff' : '#0f172a',
            }}
            onClick={() => dialogRef.current?.showModal()}
          >
            {caption || 'View image'}
          </button>
        ) : (
          <button
            type="button"
            className="block w-full overflow-hidden rounded-2xl border focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={
              {
                borderColor: tokens.surfaceBorder,
                ['--tw-ring-color' as string]: accent,
              } as CSSProperties
            }
            onClick={() => dialogRef.current?.showModal()}
            aria-haspopup="dialog"
            aria-expanded={false}
          >
            {thumb ? (
              <img src={thumb} alt={alt || caption || ''} className="w-full object-cover" />
            ) : (
              <div className="grid h-40 place-items-center text-sm" style={{ color: tokens.muted }}>
                Add an image
              </div>
            )}
          </button>
        )}
        {caption && triggerStyle === 'thumb' && (
          <figcaption className="mt-2 text-center text-sm" style={{ color: tokens.muted }}>
            {caption}
          </figcaption>
        )}
      </figure>
      <dialog
        ref={dialogRef}
        className="max-h-[90dvh] max-w-[min(96vw,56rem)] rounded-xl border-0 bg-black/90 p-4 text-white backdrop:bg-black/70"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <form method="dialog" className="mb-2 flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20"
          >
            Close
          </button>
        </form>
        {full && (
          <img src={full} alt={alt} className="mx-auto max-h-[80dvh] w-auto max-w-full object-contain" />
        )}
      </dialog>
    </Section>
  );
};

const AnimatedHeadlineBlock = ({
  block,
  accent,
  tokens,
}: {
  block: VibeBlock;
  accent: string;
  tokens: ReturnType<typeof contrastTokens>;
}) => {
  const text = prop(block, 'text', '');
  const sub = prop(block, 'sub', '');
  const motion = prop(block, 'style', 'gradientShift');
  const kid = `vh_${block.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;

  const animStyle =
    motion === 'fadeRise'
      ? `
        @keyframes ${kid}_rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .${kid}_head { animation: ${kid}_rise 0.9s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .${kid}_head { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `
      : motion === 'gradientShift'
        ? `
        @keyframes ${kid}_grad {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .${kid}_grad {
          background: linear-gradient(90deg, ${tokens.strong}, ${accent}, ${tokens.strong});
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: ${kid}_grad 8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .${kid}_grad { animation: none !important; color: ${tokens.strong} !important; background: none !important; }
        }
      `
        : '';

  return (
    <Section block={block}>
      {animStyle ? <style>{animStyle}</style> : null}
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className={`font-display text-4xl font-bold leading-tight sm:text-5xl ${
            motion === 'fadeRise' ? `${kid}_head` : motion === 'gradientShift' ? `${kid}_grad` : ''
          }`}
          style={
            motion === 'none' || !motion ? { color: tokens.strong } : motion === 'fadeRise' ? { color: tokens.strong } : undefined
          }
        >
          {text}
        </h2>
        {sub && (
          <p className="mt-4 text-base" style={{ color: tokens.body }}>
            {sub}
          </p>
        )}
      </div>
    </Section>
  );
};

const BeforeAfterBlock = ({
  block,
  accent,
  tokens,
}: {
  block: VibeBlock;
  accent: string;
  tokens: ReturnType<typeof contrastTokens>;
}) => {
  const [pos, setPos] = useState(50);
  const before = prop(block, 'beforeImage');
  const after = prop(block, 'afterImage');
  const beforeL = prop(block, 'beforeLabel', 'Before');
  const afterL = prop(block, 'afterLabel', 'After');
  const arRaw = prop(block, 'aspectRatio', '16/9');
  const ar = arRaw.includes('/') ? arRaw.replace('/', ' / ') : '16 / 9';

  return (
    <Section block={block}>
      <div className="mx-auto max-w-3xl">
        <div
          className="relative w-full overflow-hidden rounded-2xl border"
          style={{ borderColor: tokens.surfaceBorder, aspectRatio: ar }}
        >
          {before && after && (
            <>
              <img src={before} alt="" className="absolute inset-0 size-full object-cover" aria-hidden />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
              >
                <img src={after} alt="" className="size-full object-cover" />
              </div>
              <div
                className="pointer-events-none absolute bottom-2 left-2 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
              >
                {beforeL}
              </div>
              <div
                className="pointer-events-none absolute bottom-2 right-2 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
              >
                {afterL}
              </div>
              <div
                className="absolute bottom-0 top-0 w-0.5 cursor-ew-resize shadow-[0_0_0_2px_rgba(0,0,0,0.35)]"
                style={{ left: `calc(${pos}% - 1px)`, background: accent }}
              />
            </>
          )}
          {!before || !after ? (
            <div className="grid size-full min-h-[200px] place-items-center text-sm" style={{ color: tokens.muted }}>
              Add before and after images
            </div>
          ) : null}
        </div>
        <label className="mt-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide" style={{ color: tokens.muted }}>
          <span className="sr-only">Compare position</span>
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            className="h-2 w-full cursor-ew-resize appearance-none rounded-full accent-[var(--accent)]"
            style={{ accentColor: accent } as CSSProperties}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-valuetext={`${pos}% after visible`}
          />
        </label>
      </div>
    </Section>
  );
};

const TestimonialCarouselBlock = ({
  block,
  accent,
  tokens,
}: {
  block: VibeBlock;
  accent: string;
  tokens: ReturnType<typeof contrastTokens>;
}) => {
  const items = listProp<{ quote?: string; name?: string; role?: string; image?: string }>(block, 'items', []);
  const intervalSec = Math.max(3, numberProp(block, 'intervalSec', 6));
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, intervalSec * 1000);
    return () => window.clearInterval(id);
  }, [items.length, intervalSec]);

  const item = items[idx] ?? { quote: '', name: '', role: '', image: '' };

  return (
    <Section block={block}>
      <div className="mx-auto max-w-2xl text-center">
        {prop(block, 'title') && (
          <h2 className="text-3xl font-semibold" style={{ color: tokens.strong }}>
            {prop(block, 'title')}
          </h2>
        )}
        <div
          className="mt-8 rounded-3xl border px-8 py-10"
          style={{ borderColor: tokens.surfaceBorder, background: tokens.surface }}
        >
          <blockquote className="text-lg leading-relaxed" style={{ color: tokens.body }}>
            “{item.quote}”
          </blockquote>
          <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            {item.image ? (
              <img src={item.image} alt="" className="size-12 rounded-full object-cover ring-2 ring-white/20" />
            ) : null}
            <div className="text-left">
              <p className="font-semibold" style={{ color: tokens.strong }}>
                {item.name}
              </p>
              <p className="text-sm" style={{ color: tokens.muted }}>
                {item.role}
              </p>
            </div>
          </div>
          {items.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                className="rounded-full border px-3 py-1 text-xs font-semibold"
                style={{ borderColor: tokens.surfaceBorder, color: tokens.strong }}
                onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
                aria-label="Previous quote"
              >
                Prev
              </button>
              <div className="flex gap-1.5">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className="size-2 rounded-full transition"
                    style={{
                      background: i === idx ? accent : tokens.surfaceBorder,
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setIdx(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="rounded-full border px-3 py-1 text-xs font-semibold"
                style={{ borderColor: tokens.surfaceBorder, color: tokens.strong }}
                onClick={() => setIdx((i) => (i + 1) % items.length)}
                aria-label="Next quote"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};

const TabsBlock = ({ block, accent, tokens }: { block: VibeBlock; accent: string; tokens: ReturnType<typeof contrastTokens> }) => {
  const items = listProp<Record<string, string>>(block, 'items', []);
  const [active, setActive] = useState(0);
  const style = prop(block, 'style', 'pill');

  useEffect(() => {
    if (active >= items.length && items.length > 0) {
      setActive(0);
    }
  }, [active, items.length]);

  const activeItem = items[active];

  return (
    <Section block={block}>
      <div className="mx-auto max-w-3xl text-center">
        {prop(block, 'title') && (
          <h2 className="text-3xl font-semibold leading-tight" style={{ color: tokens.strong }}>
            {prop(block, 'title')}
          </h2>
        )}
      </div>
      <div className={`mt-7 flex flex-wrap items-center justify-center gap-2 ${style === 'underline' ? 'border-b' : ''}`} style={style === 'underline' ? { borderColor: tokens.divider } : undefined}>
        {items.map((item, index) => {
          const isActive = index === active;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${
                style === 'segmented' ? 'rounded-md' : style === 'underline' ? 'rounded-none' : ''
              }`}
              style={
                style === 'underline'
                  ? {
                      color: isActive ? accent : tokens.muted,
                      borderBottom: isActive ? `2px solid ${accent}` : '2px solid transparent',
                    }
                  : isActive
                    ? { background: accent, color: isDarkColor(accent) ? '#ffffff' : '#0f172a' }
                    : { color: tokens.body, background: tokens.surface, border: `1px solid ${tokens.surfaceBorder}` }
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {activeItem && (
        <div
          className="mt-7 grid items-center gap-8 rounded-3xl border p-6 sm:grid-cols-[1fr_1fr]"
          style={{ background: tokens.surface, borderColor: tokens.surfaceBorder }}
        >
          <div className="overflow-hidden rounded-2xl">
            {activeItem.media ? (
              <img src={activeItem.media} alt={activeItem.label} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <PlaceholderImage accent={accent} ratio="aspect-[4/3]" rounded="rounded-none" isDark={tokens.isDark} />
            )}
          </div>
          <p className="text-base leading-8" style={{ color: tokens.body }}>{activeItem.body}</p>
        </div>
      )}
    </Section>
  );
};

const lucideIconMap: Record<string, typeof Sparkles> = {
  Sparkles,
  Zap,
  Layers3,
  Rocket,
  Star,
  Award,
  BadgeDollarSign,
  BarChart3,
  CalendarDays,
  Check,
  Clapperboard,
  CircleHelp,
  GitCompare,
  Globe,
  Image: ImageIcon,
  LayoutGrid,
  LayoutList,
  Mail,
  MapPin,
  Megaphone,
  MousePointer2,
  MessageSquareQuote,
  Newspaper,
  PanelTop,
  Palette,
  Quote: QuoteIcon,
  Send,
  Share2,
  ShieldCheck,
  TimerReset,
  Type: TypeIcon,
  UsersRound,
  Wand2,
  Code2,
  Box,
  Info,
  Minus,
};

export const iconNames = Object.keys(lucideIconMap);
export const lucideIcon = (name: string) => lucideIconMap[name] ?? Sparkles;

export const componentCategoryMeta: Record<ComponentCategory, { label: string; description: string }> = {
  hero: { label: 'Hero', description: 'Big, opinionated above-the-fold sections.' },
  content: { label: 'Content', description: 'Headings, paragraphs, and editorial blocks.' },
  layout: { label: 'Layout', description: 'Spacing, dividers, and structural helpers.' },
  media: { label: 'Media', description: 'Images, video, and embeds.' },
  'social-proof': { label: 'Social proof', description: 'Stats, logos, and reviews.' },
  commerce: { label: 'Commerce', description: 'Pricing, CTAs, and conversion blocks.' },
  interactive: { label: 'Interactive', description: 'Tabs, accordions, progress, and countdown.' },
  navigation: { label: 'Navigation', description: 'Headers and footers.' },
  forms: { label: 'Forms', description: 'Contact and lead-capture forms.' },
  utility: { label: 'Utility', description: 'Buttons, icons, comparisons, locations.' },
};

export const categoryOrder: ComponentCategory[] = [
  'hero',
  'content',
  'media',
  'layout',
  'social-proof',
  'commerce',
  'interactive',
  'navigation',
  'utility',
  'forms',
];
