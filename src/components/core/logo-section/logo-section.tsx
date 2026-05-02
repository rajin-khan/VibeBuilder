import { Cross2Icon } from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';
import { VibeMark, VibeWordmark } from '@/components/core/vibe-brand/vibe-brand';

interface LogoSectionProps {
  theme: string;
  open: boolean;
  isMobile: boolean;
  onClose: () => void;
}

export const LogoSection = ({ open, isMobile, onClose }: Readonly<LogoSectionProps>) => {
  const showFull = open || isMobile;

  return (
    <div className="relative flex h-10 w-full items-center">
      <Link
        to="/app"
        aria-label="Vibe — Build your site, fast."
        className="flex items-center gap-2 px-3 transition-opacity duration-300"
      >
        {showFull ? (
          <VibeWordmark tagline="Build your site, fast." />
        ) : (
          <VibeMark className="h-6 w-6" />
        )}
      </Link>

      {isMobile && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <Cross2Icon className="size-5" />
        </button>
      )}
    </div>
  );
};
