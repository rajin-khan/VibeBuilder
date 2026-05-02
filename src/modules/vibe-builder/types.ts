export type WebsiteStatus = 'draft' | 'published';

export type WebsiteThemeMode = 'light' | 'dark';

export type WebsiteTheme = {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  baseRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'pill';
  buttonStyle: 'sharp' | 'soft' | 'pill';
  mode: WebsiteThemeMode;
};

export const defaultWebsiteTheme: WebsiteTheme = {
  primaryColor: '#19D3B5',
  accentColor: '#F97362',
  backgroundColor: '#070A12',
  textColor: '#F7F4EA',
  headingFont: 'Geist',
  bodyFont: 'Inter',
  baseRadius: 'lg',
  buttonStyle: 'pill',
  mode: 'dark',
};

export type WebsiteSeo = {
  title?: string;
  description?: string;
  ogImage?: string;
  twitterImage?: string;
  showVibeFooter?: boolean;
  homePageId?: string;
  faviconUrl?: string;
};

export type Website = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  status: WebsiteStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  theme?: WebsiteTheme;
  seo?: WebsiteSeo;
};

export type VibeBlockType =
  | 'hero'
  | 'heading'
  | 'paragraph'
  | 'text'
  | 'section'
  | 'container'
  | 'stack'
  | 'features'
  | 'iconBox'
  | 'imageCaption'
  | 'htmlSnippet'
  | 'stats'
  | 'gallery'
  | 'image'
  | 'testimonial'
  | 'pricing'
  | 'pricingTable'
  | 'faq'
  | 'accordion'
  | 'tabs'
  | 'logoStrip'
  | 'process'
  | 'team'
  | 'timeline'
  | 'newsletter'
  | 'video'
  | 'embed'
  | 'comparison'
  | 'cta'
  | 'button'
  | 'location'
  | 'socialProof'
  | 'socialIcons'
  | 'spacer'
  | 'divider'
  | 'alert'
  | 'quote'
  | 'columns'
  | 'cardGrid'
  | 'progressBars'
  | 'countdown'
  | 'navbar'
  | 'footer'
  | 'contact'
  | 'iconList'
  | 'starRating'
  | 'badgeRow'
  | 'breadcrumbs'
  | 'backToTop'
  | 'simpleTable'
  | 'marquee'
  | 'toggleContent'
  | 'lightboxImage'
  | 'animatedHeadline'
  | 'audioPlayer'
  | 'beforeAfter'
  | 'testimonialCarousel';

export type VibeBlock = {
  id: string;
  type: VibeBlockType;
  props: Record<string, unknown>;
  /** Nested blocks (layout containers: section, container, stack). */
  children?: VibeBlock[];
};

export type VibePageLayout = {
  /** 1 = legacy flat root only; 2 = nested `children` on containers. */
  version: 1 | 2;
  blocks: VibeBlock[];
};

export type WebsitePage = {
  id: string;
  websiteId: string;
  ownerId: string;
  name: string;
  slug: string;
  sortOrder: number;
  draftLayout: VibePageLayout;
  publishedLayout?: VibePageLayout;
  createdAt: string;
  updatedAt: string;
};

export type Asset = {
  id: string;
  ownerId: string;
  websiteId: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type BuilderSnapshot = {
  websites: Website[];
  pages: WebsitePage[];
  assets: Asset[];
};

export type InspectorFieldType =
  | 'text'
  | 'textarea'
  | 'color'
  | 'image'
  | 'select'
  | 'buttonGroup'
  | 'range'
  | 'number'
  | 'boolean'
  | 'spacing'
  | 'list'
  | 'icon';

export type InspectorTab = 'content' | 'style' | 'advanced';

export type SelectOption = {
  value: string;
  label: string;
  icon?: string;
};

export type InspectorField = {
  key: string;
  label: string;
  type: InspectorFieldType;
  description?: string;
  group?: string;
  tab?: InspectorTab;
  options?: (string | SelectOption)[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  itemLabel?: string;
  itemFields?: InspectorField[];
  defaultItem?: Record<string, unknown>;
  visibleWhen?: (props: Record<string, unknown>) => boolean;
};

export type ComponentCategory =
  | 'hero'
  | 'content'
  | 'layout'
  | 'media'
  | 'social-proof'
  | 'commerce'
  | 'interactive'
  | 'navigation'
  | 'forms'
  | 'utility';

export type VibeComponentDefinition = {
  type: VibeBlockType;
  name: string;
  description: string;
  preview: string;
  category: ComponentCategory;
  defaultProps: Record<string, unknown>;
  fields: InspectorField[];
};
