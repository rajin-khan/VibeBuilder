export const toSlug = (value: string, fallback = 'untitled') => {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return slug || fallback;
};

export const uniqueSlug = (base: string, existing: string[]) => {
  const normalized = toSlug(base);
  if (!existing.includes(normalized)) {
    return normalized;
  }

  let index = 2;
  while (existing.includes(`${normalized}-${index}`)) {
    index += 1;
  }

  return `${normalized}-${index}`;
};

export const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};
