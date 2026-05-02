import { InspectorField, SelectOption } from '../types';

export const styleTabFields: InspectorField[] = [
  {
    key: 'background',
    label: 'Background color',
    type: 'color',
    tab: 'style',
    group: 'Background',
  },
  {
    key: 'backgroundImage',
    label: 'Background image',
    type: 'image',
    tab: 'style',
    group: 'Background',
  },
  {
    key: 'backgroundOverlay',
    label: 'Overlay color',
    type: 'color',
    tab: 'style',
    group: 'Background',
    visibleWhen: (props) => Boolean(props.backgroundImage),
  },
  {
    key: 'backgroundOverlayOpacity',
    label: 'Overlay opacity',
    type: 'range',
    tab: 'style',
    group: 'Background',
    min: 0,
    max: 1,
    step: 0.05,
    visibleWhen: (props) => Boolean(props.backgroundImage),
  },
  {
    key: 'paddingTop',
    label: 'Padding top',
    type: 'spacing',
    tab: 'style',
    group: 'Spacing',
  },
  {
    key: 'paddingBottom',
    label: 'Padding bottom',
    type: 'spacing',
    tab: 'style',
    group: 'Spacing',
  },
  {
    key: 'paddingX',
    label: 'Padding left/right',
    type: 'spacing',
    tab: 'style',
    group: 'Spacing',
  },
  {
    key: 'maxWidth',
    label: 'Inner max width',
    type: 'select',
    tab: 'style',
    group: 'Layout',
    options: ['narrow', 'default', 'wide', 'full'] satisfies string[],
  },
  {
    key: 'borderRadius',
    label: 'Border radius',
    type: 'select',
    tab: 'style',
    group: 'Layout',
    options: ['none', 'sm', 'md', 'lg', 'xl', 'pill'],
  },
  {
    key: 'shadow',
    label: 'Section shadow',
    type: 'select',
    tab: 'style',
    group: 'Layout',
    options: ['none', 'soft', 'medium', 'bold', 'glow'],
  },
];

export const advancedTabFields: InspectorField[] = [
  {
    key: 'animation',
    label: 'Entrance animation',
    type: 'select',
    tab: 'advanced',
    group: 'Motion',
    options: ['none', 'fadeIn', 'rise', 'slide', 'zoom'],
  },
  {
    key: 'marginTop',
    label: 'Margin top',
    type: 'spacing',
    tab: 'advanced',
    group: 'Spacing',
  },
  {
    key: 'marginBottom',
    label: 'Margin bottom',
    type: 'spacing',
    tab: 'advanced',
    group: 'Spacing',
  },
  {
    key: 'hideOnDesktop',
    label: 'Hide on desktop',
    type: 'boolean',
    tab: 'advanced',
    group: 'Responsive visibility',
  },
  {
    key: 'hideOnTablet',
    label: 'Hide on tablet',
    type: 'boolean',
    tab: 'advanced',
    group: 'Responsive visibility',
  },
  {
    key: 'hideOnMobile',
    label: 'Hide on mobile',
    type: 'boolean',
    tab: 'advanced',
    group: 'Responsive visibility',
  },
  {
    key: 'anchorId',
    label: 'Anchor ID',
    type: 'text',
    tab: 'advanced',
    group: 'Identity',
    placeholder: 'pricing',
  },
  {
    key: 'customClass',
    label: 'Custom CSS class',
    type: 'text',
    tab: 'advanced',
    group: 'Identity',
    placeholder: 'my-section',
  },
];

export const universalDefaults = {
  paddingTop: 'lg',
  paddingBottom: 'lg',
  paddingX: 'sm',
  maxWidth: 'default',
  borderRadius: 'none',
  shadow: 'none',
  animation: 'none',
  marginTop: 'none',
  marginBottom: 'none',
  hideOnDesktop: false,
  hideOnTablet: false,
  hideOnMobile: false,
  anchorId: '',
  customClass: '',
  backgroundImage: '',
  backgroundOverlay: '#0f172a',
  backgroundOverlayOpacity: 0.45,
};

export const alignField = (): InspectorField => ({
  key: 'align',
  label: 'Alignment',
  type: 'buttonGroup',
  tab: 'style',
  group: 'Layout',
  options: [
    { value: 'left', label: 'Left', icon: 'AlignLeft' },
    { value: 'center', label: 'Center', icon: 'AlignCenter' },
    { value: 'right', label: 'Right', icon: 'AlignRight' },
  ] satisfies SelectOption[],
});

export const accentField: InspectorField = {
  key: 'accent',
  label: 'Accent color',
  type: 'color',
  tab: 'style',
  group: 'Theme',
};

export const eyebrowField: InspectorField = {
  key: 'eyebrow',
  label: 'Eyebrow',
  type: 'text',
  tab: 'content',
  group: 'Heading',
  placeholder: 'Optional small label above the title',
};

export const titleField: InspectorField = {
  key: 'title',
  label: 'Title',
  type: 'text',
  tab: 'content',
  group: 'Heading',
};

export const bodyField: InspectorField = {
  key: 'body',
  label: 'Body',
  type: 'textarea',
  tab: 'content',
  group: 'Heading',
};
