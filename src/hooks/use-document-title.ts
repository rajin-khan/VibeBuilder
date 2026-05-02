import { useEffect } from 'react';

const DEFAULT_TITLE = 'Vibe — Build your site, fast.';
const BRAND_SUFFIX = 'Vibe';

/**
 * Sets `document.title` to "{title} · Vibe" while the component is mounted, and
 * restores the previous title on unmount. Falls back to the brand default when
 * title is empty.
 */
export const useDocumentTitle = (title?: string | null) => {
  useEffect(() => {
    const previous = document.title;
    const next = title?.trim()
      ? `${title} · ${BRAND_SUFFIX}`
      : DEFAULT_TITLE;
    document.title = next;
    return () => {
      document.title = previous;
    };
  }, [title]);
};
