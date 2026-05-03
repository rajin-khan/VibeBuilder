import { type ReactNode } from 'react';

type StaggerRevealProps = {
  children: ReactNode;
  className?: string;
  /** @deprecated No-op (kept for call-site compatibility). */
  baseDelayMs?: number;
  /** @deprecated No-op (kept for call-site compatibility). */
  stepMs?: number;
};

/**
 * Layout wrapper only. Entrance animations were removed for shell performance
 * (instant paint, no staggered opacity/transform work on route change).
 */
export function StaggerReveal({ children, className }: StaggerRevealProps) {
  return <div className={className}>{children}</div>;
}
