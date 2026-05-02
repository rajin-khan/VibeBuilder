import { createContext, useContext, type ReactNode } from 'react';
import type { VibeBlock } from '../types';

export type BuilderChildRenderer = (
  block: VibeBlock,
  index: number,
  siblingsCount: number
) => ReactNode;

const BuilderChildContext = createContext<BuilderChildRenderer | null>(null);

export const BuilderChildProvider = BuilderChildContext.Provider;

export const useBuilderChildRenderer = () => useContext(BuilderChildContext);
