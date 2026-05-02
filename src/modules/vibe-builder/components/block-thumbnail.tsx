import { memo, type ReactNode } from 'react';
import type { VibeBlockType } from '../types';

type ThumbTheme = {
  primary: string;
  accent: string;
  ink: string;
  paper: string;
  surface: string;
  surface2: string;
  muted: string;
  line: string;
};

const categoryTheme: Partial<Record<VibeBlockType, { primary: string; accent: string }>> = {
  hero: { primary: '#14b8a6', accent: '#8b5cf6' },
  heading: { primary: '#38bdf8', accent: '#14b8a6' },
  paragraph: { primary: '#94a3b8', accent: '#38bdf8' },
  text: { primary: '#f59e0b', accent: '#14b8a6' },
  section: { primary: '#6366f1', accent: '#14b8a6' },
  container: { primary: '#64748b', accent: '#38bdf8' },
  stack: { primary: '#14b8a6', accent: '#8b5cf6' },
  features: { primary: '#14b8a6', accent: '#a3e635' },
  iconBox: { primary: '#8b5cf6', accent: '#14b8a6' },
  imageCaption: { primary: '#38bdf8', accent: '#f59e0b' },
  htmlSnippet: { primary: '#a3e635', accent: '#38bdf8' },
  stats: { primary: '#facc15', accent: '#14b8a6' },
  gallery: { primary: '#38bdf8', accent: '#f97316' },
  image: { primary: '#38bdf8', accent: '#a78bfa' },
  testimonial: { primary: '#f97316', accent: '#facc15' },
  pricing: { primary: '#8b5cf6', accent: '#14b8a6' },
  pricingTable: { primary: '#14b8a6', accent: '#8b5cf6' },
  faq: { primary: '#38bdf8', accent: '#14b8a6' },
  accordion: { primary: '#06b6d4', accent: '#8b5cf6' },
  tabs: { primary: '#8b5cf6', accent: '#f97316' },
  logoStrip: { primary: '#94a3b8', accent: '#14b8a6' },
  process: { primary: '#06b6d4', accent: '#a3e635' },
  team: { primary: '#a78bfa', accent: '#14b8a6' },
  timeline: { primary: '#38bdf8', accent: '#facc15' },
  newsletter: { primary: '#f59e0b', accent: '#14b8a6' },
  video: { primary: '#ef4444', accent: '#38bdf8' },
  embed: { primary: '#a3e635', accent: '#38bdf8' },
  comparison: { primary: '#22c55e', accent: '#f97316' },
  cta: { primary: '#14b8a6', accent: '#f97316' },
  button: { primary: '#14b8a6', accent: '#8b5cf6' },
  location: { primary: '#22c55e', accent: '#38bdf8' },
  socialProof: { primary: '#f59e0b', accent: '#f97316' },
  socialIcons: { primary: '#38bdf8', accent: '#8b5cf6' },
  spacer: { primary: '#38bdf8', accent: '#14b8a6' },
  divider: { primary: '#14b8a6', accent: '#8b5cf6' },
  alert: { primary: '#f97316', accent: '#facc15' },
  quote: { primary: '#f97316', accent: '#8b5cf6' },
  columns: { primary: '#14b8a6', accent: '#38bdf8' },
  cardGrid: { primary: '#8b5cf6', accent: '#14b8a6' },
  progressBars: { primary: '#14b8a6', accent: '#a3e635' },
  countdown: { primary: '#f97316', accent: '#facc15' },
  navbar: { primary: '#14b8a6', accent: '#8b5cf6' },
  footer: { primary: '#64748b', accent: '#14b8a6' },
  contact: { primary: '#14b8a6', accent: '#38bdf8' },
  iconList: { primary: '#a3e635', accent: '#14b8a6' },
  starRating: { primary: '#f59e0b', accent: '#facc15' },
  badgeRow: { primary: '#a3e635', accent: '#14b8a6' },
  breadcrumbs: { primary: '#38bdf8', accent: '#14b8a6' },
  backToTop: { primary: '#14b8a6', accent: '#8b5cf6' },
  simpleTable: { primary: '#38bdf8', accent: '#14b8a6' },
  marquee: { primary: '#8b5cf6', accent: '#f97316' },
  toggleContent: { primary: '#8b5cf6', accent: '#14b8a6' },
  lightboxImage: { primary: '#38bdf8', accent: '#f97316' },
  animatedHeadline: { primary: '#14b8a6', accent: '#8b5cf6' },
  audioPlayer: { primary: '#f97316', accent: '#38bdf8' },
  beforeAfter: { primary: '#38bdf8', accent: '#f97316' },
  testimonialCarousel: { primary: '#f97316', accent: '#14b8a6' },
};

const defaultTheme = {
  primary: '#14b8a6',
  accent: '#8b5cf6',
};

const themeFor = (type: VibeBlockType): ThumbTheme => {
  const accents = categoryTheme[type] ?? defaultTheme;
  return {
    ...accents,
    ink: '#e5eefc',
    paper: '#0b111d',
    surface: '#111827',
    surface2: '#172033',
    muted: 'rgba(229, 238, 252, 0.54)',
    line: 'rgba(229, 238, 252, 0.16)',
  };
};

const Frame = ({ children, theme }: { children: ReactNode; theme: ThumbTheme }) => (
  <svg
    viewBox="0 0 96 60"
    role="img"
    aria-hidden="true"
    className="block h-full w-full"
    preserveAspectRatio="xMidYMid meet"
  >
    <rect width="96" height="60" rx="8" fill={theme.paper} />
    <rect x="1" y="1" width="94" height="58" rx="7" fill={theme.primary} opacity="0.035" />
    <rect x="1" y="1" width="94" height="58" rx="7" fill="none" stroke={theme.line} />
    <rect x="8" y="8" width="80" height="44" rx="5" fill={theme.surface} opacity="0.62" />
    {children}
  </svg>
);

const Line = ({
  x,
  y,
  w,
  h = 2,
  fill,
  opacity = 0.52,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  fill: string;
  opacity?: number;
}) => <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} opacity={opacity} />;

const Panel = ({
  x,
  y,
  w,
  h,
  theme,
  active = false,
  opacity = 1,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  theme: ThumbTheme;
  active?: boolean;
  opacity?: number;
}) => (
  <rect
    x={x}
    y={y}
    width={w}
    height={h}
    rx="4"
    fill={active ? theme.primary : theme.surface2}
    fillOpacity={active ? 0.22 : opacity}
    stroke={active ? theme.primary : theme.line}
    strokeOpacity={active ? 0.68 : 1}
  />
);

const Button = ({ x, y, w, theme, outline = false }: { x: number; y: number; w: number; theme: ThumbTheme; outline?: boolean }) => (
  <rect
    x={x}
    y={y}
    width={w}
    height="6"
    rx="2"
    fill={outline ? 'none' : theme.primary}
    stroke={outline ? theme.muted : 'none'}
    strokeOpacity="0.5"
  />
);

const ImageGlyph = ({ x, y, w, h, theme }: { x: number; y: number; w: number; h: number; theme: ThumbTheme }) => (
  <>
    <Panel x={x} y={y} w={w} h={h} theme={theme} />
    <circle cx={x + w * 0.72} cy={y + h * 0.3} r="3" fill={theme.accent} opacity="0.72" />
    <path
      d={`M${x + 4} ${y + h - 6} L${x + w * 0.34} ${y + h * 0.52} L${x + w * 0.52} ${y + h - 9} L${x + w - 4} ${y + h * 0.42}`}
      fill="none"
      stroke={theme.primary}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.9"
    />
  </>
);

const Icon = ({ cx, cy, theme, type = 'circle' }: { cx: number; cy: number; theme: ThumbTheme; type?: 'circle' | 'bolt' | 'cube' | 'play' }) => {
  if (type === 'bolt') {
    return <path d={`M${cx - 2} ${cy - 5} L${cx + 3} ${cy - 5} L${cx} ${cy} L${cx + 4} ${cy} L${cx - 2} ${cy + 6} L${cx} ${cy + 1} L${cx - 4} ${cy + 1} Z`} fill={theme.primary} />;
  }
  if (type === 'cube') {
    return (
      <path
        d={`M${cx} ${cy - 6} L${cx + 6} ${cy - 2} V${cy + 5} L${cx} ${cy + 9} L${cx - 6} ${cy + 5} V${cy - 2} Z M${cx} ${cy - 6} V${cy + 1} M${cx - 6} ${cy - 2} L${cx} ${cy + 1} L${cx + 6} ${cy - 2}`}
        fill="none"
        stroke={theme.primary}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    );
  }
  if (type === 'play') {
    return <polygon points={`${cx - 3},${cy - 5} ${cx - 3},${cy + 5} ${cx + 6},${cy}`} fill={theme.primary} />;
  }
  return <circle cx={cx} cy={cy} r="5" fill={theme.primary} opacity="0.9" />;
};

const Star = ({ cx, cy, theme, opacity = 1 }: { cx: number; cy: number; theme: ThumbTheme; opacity?: number }) => (
  <polygon
    points={`${cx},${cy - 7} ${cx + 2},${cy - 2} ${cx + 7},${cy - 2} ${cx + 3},${cy + 1} ${cx + 5},${cy + 6} ${cx},${cy + 3} ${cx - 5},${cy + 6} ${cx - 3},${cy + 1} ${cx - 7},${cy - 2} ${cx - 2},${cy - 2}`}
    fill={theme.primary}
    opacity={opacity}
  />
);

type Recipe = (theme: ThumbTheme) => ReactNode;

const cardWithText = (theme: ThumbTheme, x: number, y: number, w: number, h: number, active = false) => (
  <g key={`${x}-${y}`}>
    <Panel x={x} y={y} w={w} h={h} theme={theme} active={active} />
    <Line x={x + 4} y={y + 6} w={Math.max(8, w - 10)} fill={active ? theme.ink : theme.primary} opacity={active ? 0.78 : 0.85} />
    <Line x={x + 4} y={y + 13} w={Math.max(8, w - 14)} fill={theme.ink} opacity={0.44} />
    <Line x={x + 4} y={y + 18} w={Math.max(8, w - 20)} fill={theme.ink} opacity={0.28} />
  </g>
);

const recipes: Record<VibeBlockType, Recipe> = {
  hero: (theme) => (
    <>
      <Line x={14} y={15} w={18} h={2.5} fill={theme.primary} opacity={0.95} />
      <Line x={14} y={23} w={35} h={4.2} fill={theme.ink} opacity={0.9} />
      <Line x={14} y={31} w={28} fill={theme.muted} opacity={0.8} />
      <Line x={14} y={36} w={34} fill={theme.muted} opacity={0.42} />
      <Button x={14} y={44} w={17} theme={theme} />
      <Button x={35} y={44} w={13} theme={theme} outline />
      <ImageGlyph x={57} y={13} w={27} h={34} theme={theme} />
    </>
  ),
  heading: (theme) => (
    <>
      <Line x={14} y={17} w={20} h={2.4} fill={theme.primary} opacity={0.92} />
      <Line x={14} y={27} w={68} h={6} fill={theme.ink} opacity={0.9} />
      <Line x={14} y={39} w={42} fill={theme.muted} opacity={0.72} />
    </>
  ),
  paragraph: (theme) => (
    <>
      {[15, 22, 29, 36, 43].map((y, i) => (
        <Line key={y} x={14} y={y} w={66 - i * 5} h={2.4} fill={theme.ink} opacity={0.64 - i * 0.05} />
      ))}
    </>
  ),
  text: (theme) => (
    <>
      <Line x={14} y={17} w={18} h={2.4} fill={theme.primary} opacity={0.94} />
      <Line x={14} y={25} w={30} h={4} fill={theme.ink} opacity={0.88} />
      <Line x={14} y={34} w={25} fill={theme.muted} />
      {[18, 25, 32, 39].map((y, i) => (
        <Line key={y} x={54} y={y} w={28 - i * 3} fill={theme.ink} opacity={0.55 - i * 0.06} />
      ))}
    </>
  ),
  section: (theme) => (
    <>
      <rect x="13" y="15" width="70" height="30" rx="4" fill="none" stroke={theme.primary} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.78" />
      <Line x={22} y={25} w={38} fill={theme.ink} opacity={0.42} />
      <Line x={22} y={33} w={52} fill={theme.ink} opacity={0.28} />
    </>
  ),
  container: (theme) => (
    <>
      <rect x="22" y="15" width="52" height="30" rx="4" fill={theme.surface2} stroke={theme.line} strokeDasharray="4 4" />
      <Line x={31} y={25} w={34} fill={theme.ink} opacity={0.44} />
      <Line x={31} y={33} w={24} fill={theme.primary} opacity={0.8} />
    </>
  ),
  stack: (theme) => (
    <>
      {[14, 25, 36].map((y, i) => (
        <rect key={y} x="18" y={y} width={60 - i * 8} height="7" rx="2.5" fill={i === 1 ? theme.primary : theme.surface2} opacity={i === 1 ? 0.78 : 1} stroke={theme.line} />
      ))}
    </>
  ),
  features: (theme) => (
    <>
      {[12, 38, 64].map((x, i) => (
        <g key={x}>
          <Panel x={x} y={16} w={20} h={28} theme={theme} active={i === 1} />
          <Icon cx={x + 10} cy={24} theme={theme} type={i === 0 ? 'bolt' : 'circle'} />
          <Line x={x + 4} y={33} w={12} fill={theme.ink} opacity={0.68} />
          <Line x={x + 4} y={38} w={10} fill={theme.muted} opacity={0.54} />
        </g>
      ))}
    </>
  ),
  iconBox: (theme) => (
    <>
      <Panel x={30} y={12} w={36} h={38} theme={theme} active />
      <Icon cx={48} cy={24} theme={theme} type="cube" />
      <Line x={38} y={36} w={20} h={2.6} fill={theme.ink} opacity={0.78} />
      <Line x={34} y={42} w={28} fill={theme.muted} opacity={0.58} />
    </>
  ),
  imageCaption: (theme) => (
    <>
      <ImageGlyph x={16} y={11} w={64} h={28} theme={theme} />
      <Line x={22} y={45} w={52} fill={theme.ink} opacity={0.5} />
      <Line x={31} y={50} w={34} fill={theme.muted} opacity={0.38} />
    </>
  ),
  htmlSnippet: (theme) => (
    <>
      <Panel x={15} y={14} w={66} h={32} theme={theme} />
      <text x="48" y="34" fontSize="12" fontWeight="700" fill={theme.primary} textAnchor="middle">{'</>'}</text>
      <Line x={22} y={20} w={18} fill={theme.accent} opacity={0.5} />
      <Line x={56} y={40} w={18} fill={theme.muted} opacity={0.28} />
    </>
  ),
  stats: (theme) => (
    <>
      {[12, 32, 52, 72].map((x, i) => (
        <g key={x}>
          <Line x={x} y={18} w={12} h={5} fill={i === 1 ? theme.accent : theme.primary} opacity={0.92 - i * 0.08} />
          <Line x={x} y={29} w={15} h={4} fill={theme.ink} opacity={0.82} />
          <Line x={x} y={39} w={11} fill={theme.muted} opacity={0.44} />
        </g>
      ))}
    </>
  ),
  gallery: (theme) => (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ImageGlyph key={i} x={12 + (i % 3) * 25} y={12 + Math.floor(i / 3) * 19} w={20} h={15} theme={theme} />
      ))}
    </>
  ),
  image: (theme) => <ImageGlyph x={13} y={11} w={70} h={38} theme={theme} />,
  testimonial: (theme) => (
    <>
      <text x="15" y="28" fontSize="24" fontWeight="700" fill={theme.primary}>“</text>
      <Line x={28} y={17} w={50} fill={theme.ink} opacity={0.62} />
      <Line x={28} y={24} w={42} fill={theme.ink} opacity={0.46} />
      <circle cx="24" cy="42" r="5" fill={theme.primary} opacity="0.9" />
      <Line x={34} y={39} w={22} fill={theme.ink} opacity={0.65} />
      <Line x={34} y={44} w={15} fill={theme.muted} opacity={0.42} />
    </>
  ),
  pricing: (theme) => (
    <>
      <Panel x={30} y={9} w={36} h={43} theme={theme} active />
      <Line x={37} y={17} w={16} fill={theme.muted} opacity={0.64} />
      <Line x={37} y={24} w={21} h={5} fill={theme.primary} opacity={0.95} />
      {[35, 40, 45].map((y, i) => <Line key={y} x={37} y={y} w={20 - i * 3} fill={theme.ink} opacity={0.44} />)}
      <Button x={37} y={48} w={21} theme={theme} />
    </>
  ),
  pricingTable: (theme) => (
    <>
      {[11, 38, 65].map((x, i) => (
        <g key={x}>
          <Panel x={x} y={11} w={20} h={39} theme={theme} active={i === 1} />
          <Line x={x + 4} y={18} w={12} fill={theme.ink} opacity={0.55} />
          <Line x={x + 4} y={25} w={13} h={4} fill={i === 1 ? theme.primary : theme.accent} opacity={0.86} />
          <Line x={x + 4} y={35} w={12} fill={theme.muted} opacity={0.42} />
          <Line x={x + 4} y={41} w={10} fill={theme.muted} opacity={0.32} />
        </g>
      ))}
    </>
  ),
  faq: (theme) => (
    <>
      {[11, 22, 33, 44].map((y, i) => (
        <g key={y}>
          <Panel x={12} y={y} w={72} h={8} theme={theme} active={i === 0} />
          <Line x={17} y={y + 3} w={42 + i * 4} fill={theme.ink} opacity={0.58} />
          <text x="78" y={y + 6} fontSize="7" fill={theme.primary} textAnchor="middle">+</text>
        </g>
      ))}
    </>
  ),
  accordion: (theme) => (
    <>
      {[11, 22, 36].map((y, i) => (
        <g key={y}>
          <Panel x={12} y={y} w={72} h={i === 1 ? 12 : 8} theme={theme} active={i === 1} />
          <Line x={17} y={y + 3} w={40} fill={theme.ink} opacity={0.58} />
          {i === 1 && <Line x={17} y={y + 8} w={54} fill={theme.muted} opacity={0.34} />}
        </g>
      ))}
    </>
  ),
  tabs: (theme) => (
    <>
      {[12, 35, 58].map((x, i) => (
        <rect key={x} x={x} y="12" width="20" height="7" rx="2" fill={i === 0 ? theme.primary : theme.surface2} stroke={theme.line} />
      ))}
      <Panel x={12} y={23} w={72} h={25} theme={theme} />
      <Line x={18} y={30} w={48} fill={theme.ink} opacity={0.55} />
      <Line x={18} y={37} w={34} fill={theme.muted} opacity={0.38} />
    </>
  ),
  logoStrip: (theme) => (
    <>
      {[12, 29, 46, 63, 80].map((x, i) => (
        <rect key={x} x={x - 6} y="24" width="12" height="12" rx="3" fill={i % 2 ? theme.primary : theme.ink} opacity={i % 2 ? 0.5 : 0.22} />
      ))}
    </>
  ),
  process: (theme) => (
    <>
      <line x1="19" y1="28" x2="77" y2="28" stroke={theme.line} strokeWidth="1.2" />
      {[18, 38, 58, 78].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="28" r="6" fill={i === 0 ? theme.primary : theme.surface2} stroke={theme.primary} strokeOpacity="0.68" />
          <text x={x} y="31" fontSize="6" fontWeight="700" fill={theme.ink} textAnchor="middle">{i + 1}</text>
          <Line x={x - 7} y={39} w={14} fill={theme.muted} opacity={0.38} />
        </g>
      ))}
    </>
  ),
  team: (theme) => (
    <>
      {[13, 34, 55, 76].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="22" r="7" fill={i % 2 ? theme.accent : theme.primary} opacity={0.72} />
          <Line x={x - 8} y={35} w={16} fill={theme.ink} opacity={0.55} />
          <Line x={x - 6} y={41} w={12} fill={theme.muted} opacity={0.34} />
        </g>
      ))}
    </>
  ),
  timeline: (theme) => (
    <>
      <line x1="16" y1="30" x2="80" y2="30" stroke={theme.line} strokeWidth="1.2" strokeDasharray="3 4" />
      {[16, 37, 58, 79].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="30" r="4" fill={i === 2 ? theme.accent : theme.primary} />
          <Line x={x - 8} y={40} w={16} fill={theme.muted} opacity={0.42} />
        </g>
      ))}
    </>
  ),
  newsletter: (theme) => (
    <>
      <Line x={15} y={17} w={38} h={4} fill={theme.ink} opacity={0.82} />
      <Line x={15} y={27} w={58} fill={theme.muted} opacity={0.44} />
      <rect x="15" y="37" width="46" height="8" rx="2" fill={theme.surface2} stroke={theme.line} />
      <rect x="64" y="37" width="17" height="8" rx="2" fill={theme.primary} />
    </>
  ),
  video: (theme) => (
    <>
      <Panel x={14} y={11} w={68} h={38} theme={theme} />
      <Icon cx={48} cy={30} theme={theme} type="play" />
      <Line x={20} y={44} w={56} h={2.5} fill={theme.primary} opacity={0.86} />
    </>
  ),
  embed: (theme) => (
    <>
      <Panel x={14} y={13} w={68} h={34} theme={theme} />
      <text x="48" y="33" fontSize="11" fontWeight="700" fill={theme.primary} textAnchor="middle">{'<iframe />'}</text>
    </>
  ),
  comparison: (theme) => (
    <>
      {[12, 50].map((x, i) => (
        <g key={x}>
          <Panel x={x} y={13} w={34} h={34} theme={theme} active={i === 0} />
          <Line x={x + 5} y={21} w={17} fill={theme.ink} opacity={0.62} />
          <Line x={x + 5} y={30} w={23} fill={theme.muted} opacity={0.42} />
          <Line x={x + 5} y={37} w={18} fill={theme.muted} opacity={0.3} />
        </g>
      ))}
      <line x1="48" y1="15" x2="48" y2="45" stroke={theme.line} />
    </>
  ),
  cta: (theme) => (
    <>
      <rect x="12" y="12" width="72" height="36" rx="5" fill={theme.primary} opacity="0.9" />
      <Line x={20} y={22} w={48} h={4} fill={theme.ink} opacity={0.94} />
      <Line x={20} y={31} w={34} fill={theme.ink} opacity={0.58} />
      <rect x="20" y="39" width="21" height="6" rx="2" fill={theme.ink} opacity="0.92" />
    </>
  ),
  button: (theme) => (
    <>
      <Line x={17} y={23} w={35} fill={theme.muted} opacity={0.4} />
      <Line x={17} y={31} w={23} fill={theme.muted} opacity={0.28} />
      <Button x={56} y={24} w={25} theme={theme} />
    </>
  ),
  location: (theme) => (
    <>
      <Panel x={12} y={12} w={72} h={36} theme={theme} />
      {[25, 43, 61].map((x) => <line key={x} x1={x} y1="12" x2={x - 8} y2="48" stroke={theme.line} />)}
      {[22, 34, 44].map((y) => <line key={y} x1="12" y1={y} x2="84" y2={y + 5} stroke={theme.line} />)}
      <path d="M48 21 C42 21 39 25 39 29 C39 36 48 44 48 44 C48 44 57 36 57 29 C57 25 54 21 48 21 Z" fill={theme.primary} opacity="0.92" />
      <circle cx="48" cy="29" r="3" fill={theme.paper} />
    </>
  ),
  socialProof: (theme) => (
    <>
      {[20, 34, 48, 62, 76].map((x, i) => <Star key={x} cx={x} cy={25} theme={theme} opacity={i < 4 ? 0.92 : 0.36} />)}
      <Line x={25} y={42} w={46} fill={theme.muted} opacity={0.44} />
    </>
  ),
  socialIcons: (theme) => (
    <>
      {[18, 33, 48, 63, 78].map((x, i) => (
        <circle key={x} cx={x} cy="30" r="6" fill={i % 2 ? theme.accent : theme.primary} opacity={0.75} />
      ))}
    </>
  ),
  spacer: (theme) => (
    <>
      <Line x={20} y={18} w={56} fill={theme.muted} opacity={0.34} />
      <line x1="48" y1="24" x2="48" y2="38" stroke={theme.primary} strokeWidth="1.5" strokeDasharray="3 3" />
      <Line x={20} y={43} w={56} fill={theme.muted} opacity={0.34} />
    </>
  ),
  divider: (theme) => (
    <>
      <line x1="14" y1="30" x2="40" y2="30" stroke={theme.muted} strokeWidth="1.2" />
      <circle cx="48" cy="30" r="2.6" fill={theme.primary} />
      <line x1="56" y1="30" x2="82" y2="30" stroke={theme.muted} strokeWidth="1.2" />
    </>
  ),
  alert: (theme) => (
    <>
      <rect x="13" y="20" width="70" height="20" rx="4" fill={theme.primary} opacity="0.18" stroke={theme.primary} strokeOpacity="0.42" />
      <circle cx="23" cy="30" r="4" fill={theme.primary} />
      <text x="23" y="33" fontSize="7" fontWeight="700" fill={theme.paper} textAnchor="middle">!</text>
      <Line x={32} y={26} w={35} fill={theme.ink} opacity={0.62} />
      <Line x={32} y={33} w={42} fill={theme.muted} opacity={0.38} />
    </>
  ),
  quote: (theme) => (
    <>
      <text x="16" y="31" fontSize="26" fontWeight="700" fill={theme.primary}>“</text>
      <Line x={30} y={20} w={48} fill={theme.ink} opacity={0.64} />
      <Line x={30} y={27} w={40} fill={theme.ink} opacity={0.48} />
      <Line x={30} y={39} w={22} fill={theme.muted} opacity={0.4} />
    </>
  ),
  columns: (theme) => (
    <>
      {[12, 38, 64].map((x, i) => (
        <g key={x}>
          <Panel x={x} y={13} w={20} h={34} theme={theme} active={i === 1} />
          <Line x={x + 4} y={21} w={12} fill={theme.ink} opacity={0.55} />
          <Line x={x + 4} y={29} w={11} fill={theme.muted} opacity={0.38} />
          <Line x={x + 4} y={36} w={10} fill={theme.muted} opacity={0.3} />
        </g>
      ))}
    </>
  ),
  cardGrid: (theme) => (
    <>
      {[0, 1, 2, 3].map((i) => cardWithText(theme, 13 + (i % 2) * 37, 11 + Math.floor(i / 2) * 21, 31, 17, i === 0))}
    </>
  ),
  progressBars: (theme) => (
    <>
      {[14, 24, 34, 44].map((y, i) => (
        <g key={y}>
          <Line x={14} y={y} w={18} fill={theme.ink} opacity={0.46} />
          <rect x="38" y={y - 0.5} width="42" height="3" rx="1.5" fill={theme.surface2} />
          <rect x="38" y={y - 0.5} width={18 + i * 7} height="3" rx="1.5" fill={theme.primary} />
        </g>
      ))}
    </>
  ),
  countdown: (theme) => (
    <>
      {[13, 34, 55, 76].map((x, i) => (
        <g key={x}>
          <Panel x={x - 8} y={17} w={16} h={20} theme={theme} active={i === 0} />
          <text x={x} y="31" fontSize="9" fontWeight="700" fill={theme.ink} textAnchor="middle">{['4', '2', '1', '0'][i]}</text>
          <Line x={x - 7} y={43} w={14} fill={theme.muted} opacity={0.38} />
        </g>
      ))}
    </>
  ),
  navbar: (theme) => (
    <>
      <Panel x={11} y={19} w={74} h={14} theme={theme} />
      <Line x={17} y={25} w={17} h={3} fill={theme.primary} opacity={0.92} />
      {[48, 61, 73].map((x) => <Line key={x} x={x} y={25.5} w={8} fill={theme.ink} opacity={0.45} />)}
    </>
  ),
  footer: (theme) => (
    <>
      <Panel x={11} y={16} w={74} h={31} theme={theme} />
      <Line x={17} y={24} w={22} fill={theme.ink} opacity={0.58} />
      <Line x={17} y={31} w={35} fill={theme.muted} opacity={0.34} />
      <Line x={61} y={24} w={15} fill={theme.primary} opacity={0.72} />
      <Line x={61} y={31} w={18} fill={theme.muted} opacity={0.34} />
      <Line x={17} y={41} w={62} fill={theme.line} opacity={0.75} />
    </>
  ),
  contact: (theme) => (
    <>
      <Panel x={13} y={12} w={36} h={36} theme={theme} />
      <Line x={18} y={20} w={20} fill={theme.ink} opacity={0.6} />
      <rect x="18" y="27" width="25" height="6" rx="1.5" fill={theme.surface} stroke={theme.line} />
      <rect x="18" y="37" width="25" height="6" rx="1.5" fill={theme.surface} stroke={theme.line} />
      <Panel x={55} y={12} w={28} h={36} theme={theme} active />
      <Icon cx={69} cy={30} theme={theme} />
    </>
  ),
  iconList: (theme) => (
    <>
      {[16, 28, 40].map((y, i) => (
        <g key={y}>
          <circle cx="18" cy={y} r="4" fill={theme.primary} opacity="0.9" />
          <path d={`M16 ${y} L18 ${y + 2} L21 ${y - 2}`} stroke={theme.paper} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Line x={28} y={y - 1} w={45 - i * 5} fill={theme.ink} opacity={0.55} />
        </g>
      ))}
    </>
  ),
  starRating: (theme) => (
    <>
      {[20, 34, 48, 62, 76].map((x, i) => <Star key={x} cx={x} cy={27} theme={theme} opacity={i < 4 ? 0.94 : 0.38} />)}
      <Line x={28} y={43} w={40} fill={theme.muted} opacity={0.38} />
    </>
  ),
  badgeRow: (theme) => (
    <>
      {[13, 35, 60].map((x, i) => (
        <rect key={x} x={x} y="25" width={18 + i * 3} height="9" rx="4.5" fill={i === 1 ? theme.primary : theme.surface2} stroke={theme.primary} strokeOpacity="0.48" />
      ))}
    </>
  ),
  breadcrumbs: (theme) => (
    <>
      <Line x={12} y={29} w={15} fill={theme.primary} opacity={0.9} />
      <path d="M32 27 L35 30 L32 33" stroke={theme.muted} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x={40} y={29} w={18} fill={theme.ink} opacity={0.55} />
      <path d="M63 27 L66 30 L63 33" stroke={theme.muted} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x={71} y={29} w={13} fill={theme.ink} opacity={0.72} />
    </>
  ),
  backToTop: (theme) => (
    <>
      <Line x={14} y={16} w={46} fill={theme.muted} opacity={0.34} />
      <Line x={14} y={24} w={56} fill={theme.muted} opacity={0.25} />
      <Line x={14} y={32} w={40} fill={theme.muted} opacity={0.2} />
      <circle cx="74" cy="42" r="8" fill={theme.primary} opacity="0.92" />
      <path d="M74 46 V38 M70 42 L74 38 L78 42" stroke={theme.paper} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  simpleTable: (theme) => (
    <>
      <Panel x={13} y={13} w={70} h={34} theme={theme} />
      <rect x="13" y="13" width="70" height="8" rx="4" fill={theme.primary} opacity="0.38" />
      {[28, 39].map((x) => <line key={x} x1={x} y1="13" x2={x} y2="47" stroke={theme.line} />)}
      {[21, 30, 39].map((y) => <line key={y} x1="13" y1={y} x2="83" y2={y} stroke={theme.line} />)}
    </>
  ),
  marquee: (theme) => (
    <>
      <rect x="11" y="22" width="74" height="16" rx="3" fill={theme.primary} opacity="0.14" stroke={theme.primary} strokeOpacity="0.36" />
      <Line x={17} y={29} w={24} h={3} fill={theme.primary} opacity={0.78} />
      <Line x={47} y={29} w={17} h={3} fill={theme.accent} opacity={0.58} />
      <Line x={69} y={29} w={10} h={3} fill={theme.ink} opacity={0.46} />
    </>
  ),
  toggleContent: (theme) => (
    <>
      <Panel x={14} y={14} w={68} h={32} theme={theme} />
      <Line x={21} y={23} w={35} fill={theme.ink} opacity={0.58} />
      <rect x="58" y="20" width="19" height="9" rx="4.5" fill={theme.primary} opacity="0.85" />
      <circle cx="70" cy="24.5" r="3" fill={theme.paper} />
      <Line x={21} y={36} w={48} fill={theme.muted} opacity={0.34} />
    </>
  ),
  lightboxImage: (theme) => (
    <>
      <ImageGlyph x={18} y={12} w={60} h={36} theme={theme} />
      <circle cx="76" cy="17" r="6" fill={theme.paper} opacity="0.95" />
      <path d="M73 17 H79 M76 14 V20" stroke={theme.primary} strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  animatedHeadline: (theme) => (
    <>
      <Line x={14} y={23} w={56} h={6} fill={theme.ink} opacity={0.86} />
      <rect x="70" y="23" width="12" height="6" rx="2" fill={theme.primary} opacity="0.88" />
      <Line x={20} y={39} w={52} fill={theme.muted} opacity={0.38} />
    </>
  ),
  audioPlayer: (theme) => (
    <>
      <Panel x={13} y={20} w={70} h={20} theme={theme} />
      <Icon cx={25} cy={30} theme={theme} type="play" />
      <Line x={38} y={27} w={35} h={3} fill={theme.primary} opacity={0.62} />
      <Line x={38} y={34} w={24} fill={theme.muted} opacity={0.35} />
    </>
  ),
  beforeAfter: (theme) => (
    <>
      <rect x="15" y="12" width="33" height="36" rx="4" fill={theme.primary} opacity="0.28" stroke={theme.line} />
      <rect x="48" y="12" width="33" height="36" rx="4" fill={theme.accent} opacity="0.2" stroke={theme.line} />
      <rect x="46" y="12" width="4" height="36" rx="2" fill={theme.ink} opacity="0.9" />
      <circle cx="48" cy="30" r="5" fill={theme.paper} stroke={theme.ink} strokeOpacity="0.6" />
    </>
  ),
  testimonialCarousel: (theme) => (
    <>
      <Panel x={16} y={13} w={64} h={30} theme={theme} active />
      <text x="24" y="29" fontSize="18" fontWeight="700" fill={theme.primary}>“</text>
      <Line x={35} y={21} w={34} fill={theme.ink} opacity={0.52} />
      <Line x={35} y={28} w={26} fill={theme.muted} opacity={0.38} />
      <circle cx="34" cy="49" r="1.8" fill={theme.primary} />
      <circle cx="42" cy="49" r="1.8" fill={theme.muted} opacity="0.42" />
      <circle cx="50" cy="49" r="1.8" fill={theme.muted} opacity="0.42" />
      <path d="M12 29 L9 32 L12 35 M84 29 L87 32 L84 35" stroke={theme.muted} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

interface BlockThumbnailProps {
  type: VibeBlockType;
  className?: string;
}

const BlockThumbnailInner = ({ type, className }: BlockThumbnailProps) => {
  const theme = themeFor(type);

  return (
    <div
      className={
        'relative aspect-[8/5] w-full overflow-hidden rounded-lg bg-muted/30 ring-1 ring-border/80 transition group-hover:ring-primary/25 ' +
        (className ?? '')
      }
    >
      <Frame theme={theme}>{recipes[type](theme)}</Frame>
    </div>
  );
};

export const BlockThumbnail = memo(BlockThumbnailInner);
