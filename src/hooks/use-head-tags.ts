import { useEffect } from 'react';

type MetaTag =
  | { name: string; content: string }
  | { property: string; content: string };

interface HeadTags {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterImage?: string;
  faviconUrl?: string;
  canonicalUrl?: string;
}

const upsertMeta = (selector: string, attrs: Record<string, string>) => {
  let node = document.head.querySelector<HTMLMetaElement>(selector);
  if (!node) {
    node = document.createElement('meta');
    document.head.appendChild(node);
  }
  const el = node;
  Object.entries(attrs).forEach(([key, value]) => {
    if (value) {
      el.setAttribute(key, value);
    } else {
      el.removeAttribute(key);
    }
  });
  return el;
};

const upsertLink = (rel: string, href: string) => {
  let node = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!node) {
    node = document.createElement('link');
    node.rel = rel;
    document.head.appendChild(node);
  }
  node.href = href;
  return node;
};

export const useHeadTags = (tags: HeadTags) => {
  useEffect(() => {
    const created: HTMLElement[] = [];
    const updates: { node: HTMLMetaElement; previous: string | null }[] = [];

    const setMeta = (descriptor: MetaTag) => {
      const isProperty = 'property' in descriptor;
      const selector = isProperty
        ? `meta[property="${descriptor.property}"]`
        : `meta[name="${descriptor.name}"]`;
      const existing = document.head.querySelector<HTMLMetaElement>(selector);
      const previous = existing?.getAttribute('content') ?? null;
      const node = upsertMeta(selector, {
        ...(isProperty
          ? { property: descriptor.property }
          : { name: descriptor.name }),
        content: descriptor.content,
      });
      if (existing) updates.push({ node, previous });
      else created.push(node);
    };

    if (tags.description) setMeta({ name: 'description', content: tags.description });
    if (tags.ogTitle ?? tags.title) {
      setMeta({ property: 'og:title', content: tags.ogTitle ?? tags.title ?? '' });
    }
    if (tags.ogDescription ?? tags.description) {
      setMeta({
        property: 'og:description',
        content: tags.ogDescription ?? tags.description ?? '',
      });
    }
    if (tags.ogImage) setMeta({ property: 'og:image', content: tags.ogImage });
    if (tags.ogUrl) setMeta({ property: 'og:url', content: tags.ogUrl });
    if (tags.twitterCard) setMeta({ name: 'twitter:card', content: tags.twitterCard });
    if (tags.twitterImage) setMeta({ name: 'twitter:image', content: tags.twitterImage });

    let createdLink: HTMLLinkElement | undefined;
    let prevHref: string | null = null;
    if (tags.faviconUrl) {
      const existing = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
      prevHref = existing?.getAttribute('href') ?? null;
      const node = upsertLink('icon', tags.faviconUrl);
      if (existing) {
        // restore on unmount
      } else {
        createdLink = node;
      }
    }

    let createdCanonical: HTMLLinkElement | undefined;
    let prevCanonical: string | null = null;
    if (tags.canonicalUrl) {
      const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      prevCanonical = existing?.getAttribute('href') ?? null;
      const node = upsertLink('canonical', tags.canonicalUrl);
      if (!existing) createdCanonical = node;
    }

    return () => {
      updates.forEach(({ node, previous }) => {
        if (previous === null) node.removeAttribute('content');
        else node.setAttribute('content', previous);
      });
      created.forEach((node) => node.remove());
      if (createdLink) createdLink.remove();
      else if (prevHref) upsertLink('icon', prevHref);
      if (createdCanonical) createdCanonical.remove();
      else if (prevCanonical) upsertLink('canonical', prevCanonical);
    };
  }, [
    tags.title,
    tags.description,
    tags.ogTitle,
    tags.ogDescription,
    tags.ogImage,
    tags.ogUrl,
    tags.twitterCard,
    tags.twitterImage,
    tags.faviconUrl,
    tags.canonicalUrl,
  ]);
};
