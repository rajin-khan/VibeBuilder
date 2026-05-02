import graphqlClient from '@/lib/graphql-client';
import { HttpError } from '@/lib/https';
import { getPreSignedUrlForUpload } from '@/lib/api/services/storage.service';
import {
  Asset,
  BuilderSnapshot,
  defaultWebsiteTheme,
  VibePageLayout,
  Website,
  WebsitePage,
} from '../types';
import { createId, toSlug, uniqueSlug } from '../utils/slug';
import { migrateLayoutToV2 } from '../utils/block-tree';
import { useAuthStore } from '@/state/store/auth';
import { isLocalDemoToken } from '@/modules/auth/utils/demo-session';
import { ModuleName } from '@/constant/modules.constants';

const STORAGE_KEY = 'vibebuilder-demo-snapshot-v1';

type BlocksWebsite = {
  ItemId?: string;
  OwnerId?: string;
  Slug?: string;
  Payload?: string;
  CreatedDate?: string;
  LastUpdatedDate?: string;
};

type BlocksPage = {
  ItemId?: string;
  WebsiteId?: string;
  OwnerId?: string;
  Slug?: string;
  Payload?: string;
  CreatedDate?: string;
  LastUpdatedDate?: string;
};

const emptyLayout = (): VibePageLayout => ({ version: 2, blocks: [] });

const now = () => new Date().toISOString();

/** Storage/CDN URLs must be absolute so <img src> is never a bare path (avoids ERR_FILE_NOT_FOUND on /site/...). */
const assertHttpsPublicUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Upload did not return a public file URL.');
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error('File URL must be http(s).');
    }
    return trimmed;
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error('File URL must be an absolute http(s) address.');
    }
    throw e;
  }
};

const preSignedPut = async (uploadUrl: string, file: File) => {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'x-ms-blob-type': 'BlockBlob',
    },
  });
  if (!res.ok) {
    throw new Error(`Storage upload failed (${res.status}).`);
  }
};

const parseLayout = (value: VibePageLayout | string | undefined): VibePageLayout => {
  if (!value) {
    return emptyLayout();
  }

  let raw: VibePageLayout;
  if (typeof value !== 'string') {
    raw = value;
  } else {
    try {
      raw = JSON.parse(value) as VibePageLayout;
    } catch {
      return emptyLayout();
    }
  }

  return migrateLayoutToV2(raw);
};

const parsePayload = <T,>(payload: string | undefined, fallback: T): T => {
  if (!payload) {
    return fallback;
  }

  try {
    return { ...fallback, ...(JSON.parse(payload) as Partial<T>) };
  } catch {
    return fallback;
  }
};

const mapWebsite = (item: BlocksWebsite): Website => {
  const fallback: Website = {
    id: item.ItemId ?? createId('site'),
    ownerId: item.OwnerId ?? '',
    name: 'Untitled site',
    slug: item.Slug ?? 'site',
    status: 'draft',
    createdAt: item.CreatedDate ?? now(),
    updatedAt: item.LastUpdatedDate ?? now(),
    theme: defaultWebsiteTheme,
  };
  const website = parsePayload(item.Payload, fallback);

  return {
    ...website,
    id: item.ItemId ?? website.id,
    ownerId: item.OwnerId ?? website.ownerId,
    slug: item.Slug ?? website.slug,
    createdAt: item.CreatedDate ?? website.createdAt,
    updatedAt: item.LastUpdatedDate ?? website.updatedAt,
  };
};

const mapPage = (item: BlocksPage): WebsitePage => {
  const fallback: WebsitePage = {
    id: item.ItemId ?? createId('page'),
    websiteId: item.WebsiteId ?? '',
    ownerId: item.OwnerId ?? '',
    name: 'Untitled page',
    slug: item.Slug ?? 'page',
    sortOrder: 0,
    draftLayout: emptyLayout(),
    createdAt: item.CreatedDate ?? now(),
    updatedAt: item.LastUpdatedDate ?? now(),
  };
  const page = parsePayload(item.Payload, fallback);

  return {
    ...page,
    id: item.ItemId ?? page.id,
    websiteId: item.WebsiteId ?? page.websiteId,
    ownerId: item.OwnerId ?? page.ownerId,
    slug: item.Slug ?? page.slug,
    draftLayout: parseLayout(page.draftLayout),
    publishedLayout: page.publishedLayout ? parseLayout(page.publishedLayout) : undefined,
    createdAt: item.CreatedDate ?? page.createdAt,
    updatedAt: item.LastUpdatedDate ?? page.updatedAt,
  };
};

/** Anonymous published-site reads: env JWT when gateway requires Bearer; omit when using IAM anonymous access. */
const visitorReadBearer = (): string | undefined => {
  const pub = import.meta.env.VITE_VIBE_PUBLIC_READ_TOKEN;
  if (typeof pub === 'string' && pub.trim()) return pub.trim();
  return undefined;
};

const listPagesWithVisitorBearer = async (
  websiteId: string,
  bearer: string | undefined
): Promise<WebsitePage[]> => {
  const data = await graphqlClient.queryWithVisitorBearer<{
    getVibePages: { items: BlocksPage[] };
  }>(
    {
      query: `
            query GetPagesPublic($input: DynamicQueryInput) {
              getVibePages(input: $input) {
                items {
                  ItemId
                  WebsiteId
                  OwnerId
                  Slug
                  Payload
                  CreatedDate
                  LastUpdatedDate
                }
              }
            }
          `,
      variables: {
        input: {
          filter: JSON.stringify({ WebsiteId: websiteId }),
          sort: JSON.stringify({ LastUpdatedDate: 1 }),
          pageNo: 1,
          pageSize: 100,
        },
      },
    },
    bearer
  );

  return (data.getVibePages?.items ?? []).map(mapPage).sort((a, b) => a.sortOrder - b.sortOrder);
};

const loadSnapshot = (): BuilderSnapshot => {
  if (typeof window === 'undefined') {
    return { websites: [], pages: [], assets: [] };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { websites: [], pages: [], assets: [] };
  }

  try {
    return JSON.parse(raw) as BuilderSnapshot;
  } catch {
    return { websites: [], pages: [], assets: [] };
  }
};

const saveSnapshot = (snapshot: BuilderSnapshot) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read image file.'));
      }
    });
    reader.addEventListener('error', () =>
      reject(reader.error ?? new Error('Could not read image file.'))
    );
    reader.readAsDataURL(file);
  });

let warnedVibeGatewayMissing = false;

/** True when GraphQL schema has no Vibe* entities (not created/published in Data Gateway). */
const isVibeDataGatewayUnavailable = (error: unknown): boolean => {
  const parts: string[] = [];
  if (error instanceof HttpError) {
    parts.push(error.message);
    try {
      parts.push(JSON.stringify(error.error));
    } catch {
      /* ignore */
    }
  } else if (error instanceof Error) {
    parts.push(error.message);
  } else {
    parts.push(String(error));
  }
  const text = parts.join('\n');
  if (!text.includes('does not exist')) {
    return false;
  }
  return (
    /\bVibe(Website|Page|Asset)s?\b/i.test(text) ||
    /\bgetVibe(Website|Page|Asset)s?\b/i.test(text) ||
    /\binsertVibe/i.test(text) ||
    /\b(update|delete)Vibe/i.test(text)
  );
};

/** Demo token, dev build, or production without Data Gateway: use local snapshot. */
const runWithDemoFallback = async <T,>(operation: () => Promise<T>, fallback: () => T): Promise<T> => {
  if (isLocalDemoToken(useAuthStore.getState().accessToken)) {
    return fallback();
  }

  try {
    return await operation();
  } catch (err) {
    if (import.meta.env.DEV || isVibeDataGatewayUnavailable(err)) {
      if (isVibeDataGatewayUnavailable(err) && !warnedVibeGatewayMissing) {
        warnedVibeGatewayMissing = true;
        console.warn(
          '[VibeBuilder] Data Gateway has no published VibeWebsite / VibePage / VibeAsset schemas. Using browser localStorage. Define those entities in Blocks Cloud → Data → Schemas and click Publish (see DEPLOYMENT.md).'
        );
      }
      return fallback();
    }

    throw err;
  }
};

/** Server-generated `ItemId` / `_id` (do not send `ItemId` on insert — same pattern as inventory). */
type GatewayInsertResult = {
  itemId?: string | null;
  acknowledged?: boolean | null;
  message?: string | null;
};

const requireInsertItemId = (row: GatewayInsertResult | null | undefined, operation: string): string => {
  const id = row?.itemId?.trim();
  if (id) {
    return id;
  }
  const hint = row?.message?.trim() ? ` (${row.message})` : '';
  throw new Error(`${operation} did not return itemId${hint}`);
};

/** Omit `ItemId` so the gateway assigns `_id` (client-generated `site_…` / `page_…` ids break inserts). */
const websiteInsertInput = (website: Website) => ({
  OwnerId: website.ownerId,
  Slug: website.slug,
  Payload: JSON.stringify(website),
});

const pageInsertInput = (page: WebsitePage) => ({
  WebsiteId: page.websiteId,
  OwnerId: page.ownerId,
  Slug: page.slug,
  Payload: JSON.stringify(page),
});

const assetInsertInput = (asset: Asset) => ({
  OwnerId: asset.ownerId,
  WebsiteId: asset.websiteId,
  FileName: asset.fileName,
  Payload: JSON.stringify(asset),
});

/** Update inputs: match `VibeWebsiteUpdateInput` / `VibePageUpdateInput` (Data Gateway has no ItemId/timestamps here). */
const websiteUpdateInput = (website: Website) => ({
  OwnerId: website.ownerId,
  Slug: website.slug,
  Payload: JSON.stringify(website),
});

const pageUpdateInput = (page: WebsitePage) => ({
  WebsiteId: page.websiteId,
  OwnerId: page.ownerId,
  Slug: page.slug,
  Payload: JSON.stringify(page),
});

export const vibeBuilderService = {
  async listWebsites(ownerId: string): Promise<Website[]> {
    return runWithDemoFallback(
      async () => {
        const data = await graphqlClient.query<{ getVibeWebsites: { items: BlocksWebsite[] } }>({
          query: `
            query GetWebsites($input: DynamicQueryInput) {
              getVibeWebsites(input: $input) {
                items {
                  ItemId
                  OwnerId
                  Slug
                  Payload
                  CreatedDate
                  LastUpdatedDate
                }
              }
            }
          `,
          variables: {
            input: {
              filter: JSON.stringify({ OwnerId: ownerId }),
              sort: JSON.stringify({ LastUpdatedDate: -1 }),
              pageNo: 1,
              pageSize: 100,
            },
          },
        });

        return (data.getVibeWebsites?.items ?? []).map(mapWebsite);
      },
      () => loadSnapshot().websites.filter((website) => website.ownerId === ownerId)
    );
  },

  async listPages(websiteId: string): Promise<WebsitePage[]> {
    return runWithDemoFallback(
      async () => {
        const data = await graphqlClient.query<{ getVibePages: { items: BlocksPage[] } }>({
          query: `
            query GetPages($input: DynamicQueryInput) {
              getVibePages(input: $input) {
                items {
                  ItemId
                  WebsiteId
                  OwnerId
                  Slug
                  Payload
                  CreatedDate
                  LastUpdatedDate
                }
              }
            }
          `,
          variables: {
            input: {
              filter: JSON.stringify({ WebsiteId: websiteId }),
              sort: JSON.stringify({ LastUpdatedDate: 1 }),
              pageNo: 1,
              pageSize: 100,
            },
          },
        });

        return (data.getVibePages?.items ?? []).map(mapPage).sort((a, b) => a.sortOrder - b.sortOrder);
      },
      () =>
        loadSnapshot()
          .pages.filter((page) => page.websiteId === websiteId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
    );
  },

  async createWebsite(ownerId: string, name: string): Promise<{ website: Website; page: WebsitePage }> {
    const createdAt = now();

    return runWithDemoFallback(
      async () => {
        const existing = await this.listWebsites(ownerId);
        const website: Website = {
          id: createId('site'),
          ownerId,
          name,
          slug: uniqueSlug(name, existing.map((site) => site.slug)),
          status: 'draft',
          createdAt,
          updatedAt: createdAt,
          theme: defaultWebsiteTheme,
        };
        const page = this.createPageShape(website, 'Home', 0);

        const websiteRes = await graphqlClient.mutate<{ insertVibeWebsite?: GatewayInsertResult }>({
          query: `
            mutation InsertWebsite($input: VibeWebsiteInsertInput!) {
              insertVibeWebsite(input: $input) {
                itemId
                acknowledged
                message
              }
            }
          `,
          variables: { input: websiteInsertInput(website) },
        });
        const persistedWebsiteId = requireInsertItemId(websiteRes.insertVibeWebsite, 'insertVibeWebsite');
        const websiteOut: Website = { ...website, id: persistedWebsiteId };

        const pageForInsert: WebsitePage = { ...page, websiteId: persistedWebsiteId };
        const pageRes = await graphqlClient.mutate<{ insertVibePage?: GatewayInsertResult }>({
          query: `
            mutation InsertPage($input: VibePageInsertInput!) {
              insertVibePage(input: $input) {
                itemId
                acknowledged
                message
              }
            }
          `,
          variables: { input: pageInsertInput(pageForInsert) },
        });
        const persistedPageId = requireInsertItemId(pageRes.insertVibePage, 'insertVibePage');
        const pageOut: WebsitePage = { ...pageForInsert, id: persistedPageId };

        return { website: websiteOut, page: pageOut };
      },
      () => {
        const snapshot = loadSnapshot();
        const website: Website = {
          id: createId('site'),
          ownerId,
          name,
          slug: uniqueSlug(name, snapshot.websites.map((site) => site.slug)),
          status: 'draft',
          createdAt,
          updatedAt: createdAt,
          theme: defaultWebsiteTheme,
        };
        const page = this.createPageShape(website, 'Home', 0);

        saveSnapshot({
          ...snapshot,
          websites: [website, ...snapshot.websites],
          pages: [...snapshot.pages, page],
        });

        return { website, page };
      }
    );
  },

  createPageShape(website: Website, name: string, sortOrder: number): WebsitePage {
    const createdAt = now();

    return {
      id: createId('page'),
      websiteId: website.id,
      ownerId: website.ownerId,
      name,
      slug: toSlug(name),
      sortOrder,
      draftLayout: emptyLayout(),
      createdAt,
      updatedAt: createdAt,
    };
  },

  async createPage(website: Website, name: string): Promise<WebsitePage> {
    const pages = await this.listPages(website.id);
    const page = {
      ...this.createPageShape(website, name, pages.length),
      slug: uniqueSlug(name, pages.map((item) => item.slug)),
    };

    return runWithDemoFallback(
      async () => {
        const pageRes = await graphqlClient.mutate<{ insertVibePage?: GatewayInsertResult }>({
          query: `
            mutation InsertPage($input: VibePageInsertInput!) {
              insertVibePage(input: $input) {
                itemId
                acknowledged
                message
              }
            }
          `,
          variables: { input: pageInsertInput(page) },
        });
        const persistedPageId = requireInsertItemId(pageRes.insertVibePage, 'insertVibePage');
        return { ...page, id: persistedPageId };
      },
      () => {
        const snapshot = loadSnapshot();
        saveSnapshot({ ...snapshot, pages: [...snapshot.pages, page] });
        return page;
      }
    );
  },

  async deletePage(pageId: string): Promise<void> {
    return runWithDemoFallback(
      async () => {
        await graphqlClient.mutate({
          query: `
            mutation DeletePage($filter: String!, $input: VibePageDeleteInput!) {
              deleteVibePage(filter: $filter, input: $input) {
                totalImpactedData
              }
            }
          `,
          variables: {
            filter: JSON.stringify({ _id: pageId }),
            input: { isHardDelete: true },
          },
        });
      },
      () => {
        const snapshot = loadSnapshot();
        saveSnapshot({ ...snapshot, pages: snapshot.pages.filter((page) => page.id !== pageId) });
      }
    );
  },

  async renamePage(page: WebsitePage, name: string): Promise<WebsitePage> {
    const pages = await this.listPages(page.websiteId);
    const siblingSlugs = pages.filter((item) => item.id !== page.id).map((item) => item.slug);
    const updatedPage: WebsitePage = {
      ...page,
      name,
      slug: uniqueSlug(name, siblingSlugs),
      updatedAt: now(),
    };

    return runWithDemoFallback(
      async () => {
        await graphqlClient.mutate({
          query: `
            mutation UpdatePage($filter: String!, $input: VibePageUpdateInput!) {
              updateVibePage(filter: $filter, input: $input) {
                totalImpactedData
              }
            }
          `,
          variables: {
            filter: JSON.stringify({ _id: page.id }),
            input: pageUpdateInput(updatedPage),
          },
        });

        return updatedPage;
      },
      () => {
        const snapshot = loadSnapshot();
        saveSnapshot({
          ...snapshot,
          pages: snapshot.pages.map((item) => (item.id === page.id ? updatedPage : item)),
        });

        return updatedPage;
      }
    );
  },

  async updateDraftLayout(page: WebsitePage, layout: VibePageLayout): Promise<WebsitePage> {
    const updatedPage = { ...page, draftLayout: layout, updatedAt: now() };

    return runWithDemoFallback(
      async () => {
        await graphqlClient.mutate({
          query: `
            mutation UpdatePage($filter: String!, $input: VibePageUpdateInput!) {
              updateVibePage(filter: $filter, input: $input) {
                totalImpactedData
              }
            }
          `,
          variables: {
            filter: JSON.stringify({ _id: page.id }),
            input: pageUpdateInput(updatedPage),
          },
        });

        return updatedPage;
      },
      () => {
        const snapshot = loadSnapshot();
        saveSnapshot({
          ...snapshot,
          pages: snapshot.pages.map((item) => (item.id === page.id ? updatedPage : item)),
        });

        return updatedPage;
      }
    );
  },

  async publishPage(website: Website, page: WebsitePage): Promise<{ website: Website; page: WebsitePage }> {
    const publishedAt = now();
    const updatedWebsite: Website = {
      ...website,
      status: 'published',
      updatedAt: publishedAt,
      publishedAt,
    };
    const updatedPage: WebsitePage = {
      ...page,
      publishedLayout: page.draftLayout,
      updatedAt: publishedAt,
    };

    return runWithDemoFallback(
      async () => {
        await graphqlClient.mutate({
          query: `
            mutation UpdateWebsite($filter: String!, $input: VibeWebsiteUpdateInput!) {
              updateVibeWebsite(filter: $filter, input: $input) {
                totalImpactedData
              }
            }
          `,
          variables: {
            filter: JSON.stringify({ _id: website.id }),
            input: websiteUpdateInput(updatedWebsite),
          },
        });
        await graphqlClient.mutate({
          query: `
            mutation UpdatePage($filter: String!, $input: VibePageUpdateInput!) {
              updateVibePage(filter: $filter, input: $input) {
                totalImpactedData
              }
            }
          `,
          variables: {
            filter: JSON.stringify({ _id: page.id }),
            input: pageUpdateInput(updatedPage),
          },
        });

        return { website: updatedWebsite, page: updatedPage };
      },
      () => {
        const snapshot = loadSnapshot();
        saveSnapshot({
          ...snapshot,
          websites: snapshot.websites.map((item) => (item.id === website.id ? updatedWebsite : item)),
          pages: snapshot.pages.map((item) => (item.id === page.id ? updatedPage : item)),
        });

        return { website: updatedWebsite, page: updatedPage };
      }
    );
  },

  async findPublishedPage(siteSlug: string, pageSlug: string): Promise<{
    website?: Website;
    pages: WebsitePage[];
    page?: WebsitePage;
  }> {
    const resolvePage = (
      website: Website | undefined,
      pages: WebsitePage[]
    ): WebsitePage | undefined => {
      if (!website) return undefined;
      const published = pages.filter((page) => page.publishedLayout);
      if (pageSlug) {
        return published.find((page) => page.slug === pageSlug);
      }
      const homeId = website.seo?.homePageId;
      if (homeId) {
        const homeMatch = published.find((page) => page.id === homeId);
        if (homeMatch) return homeMatch;
      }
      return published[0];
    };

    return runWithDemoFallback(
      async () => {
        const sessionToken = useAuthStore.getState().accessToken?.trim();
        const websiteQuery = {
          query: `
            query GetPublicWebsite($input: DynamicQueryInput) {
              getVibeWebsites(input: $input) {
                items {
                  ItemId
                  OwnerId
                  Slug
                  Payload
                  CreatedDate
                  LastUpdatedDate
                }
              }
            }
          `,
          variables: {
            input: {
              filter: JSON.stringify({ Slug: siteSlug }),
              pageNo: 1,
              pageSize: 1,
            },
          },
        };

        const websites = sessionToken
          ? await graphqlClient.query<{ getVibeWebsites: { items: BlocksWebsite[] } }>(websiteQuery)
          : await graphqlClient.queryWithVisitorBearer<{
              getVibeWebsites: { items: BlocksWebsite[] };
            }>(websiteQuery, visitorReadBearer());

        const website = websites.getVibeWebsites?.items?.[0]
          ? mapWebsite(websites.getVibeWebsites.items[0])
          : undefined;

        if (!website || website.status !== 'published') {
          return { website: undefined, pages: [], page: undefined };
        }

        const pages = sessionToken
          ? await this.listPages(website.id)
          : await listPagesWithVisitorBearer(website.id, visitorReadBearer());

        return {
          website,
          pages,
          page: resolvePage(website, pages),
        };
      },
      () => {
        const snapshot = loadSnapshot();
        const website = snapshot.websites.find((site) => site.slug === siteSlug && site.status === 'published');
        const pages = website
          ? snapshot.pages.filter((page) => page.websiteId === website.id).sort((a, b) => a.sortOrder - b.sortOrder)
          : [];

        return {
          website,
          pages,
          page: resolvePage(website, pages),
        };
      }
    );
  },

  async updateWebsite(website: Website): Promise<Website> {
    const updated: Website = { ...website, updatedAt: now() };

    return runWithDemoFallback(
      async () => {
        await graphqlClient.mutate({
          query: `
            mutation UpdateWebsite($filter: String!, $input: VibeWebsiteUpdateInput!) {
              updateVibeWebsite(filter: $filter, input: $input) {
                totalImpactedData
              }
            }
          `,
          variables: {
            filter: JSON.stringify({ _id: website.id }),
            input: websiteUpdateInput(updated),
          },
        });
        return updated;
      },
      () => {
        const snapshot = loadSnapshot();
        saveSnapshot({
          ...snapshot,
          websites: snapshot.websites.map((item) =>
            item.id === website.id ? updated : item
          ),
        });
        return updated;
      }
    );
  },

  async deleteWebsite(websiteId: string): Promise<void> {
    return runWithDemoFallback(
      async () => {
        await graphqlClient.mutate({
          query: `
            mutation DeleteWebsite($filter: String!, $input: VibeWebsiteDeleteInput!) {
              deleteVibeWebsite(filter: $filter, input: $input) {
                totalImpactedData
              }
            }
          `,
          variables: {
            filter: JSON.stringify({ _id: websiteId }),
            input: { isHardDelete: true },
          },
        });
      },
      () => {
        const snapshot = loadSnapshot();
        saveSnapshot({
          ...snapshot,
          websites: snapshot.websites.filter((item) => item.id !== websiteId),
          pages: snapshot.pages.filter((item) => item.websiteId !== websiteId),
          assets: snapshot.assets.filter((item) => item.websiteId !== websiteId),
        });
      }
    );
  },

  async listAssets(websiteId: string): Promise<Asset[]> {
    return runWithDemoFallback(
      async () => {
        type BlocksAsset = {
          ItemId?: string;
          OwnerId?: string;
          WebsiteId?: string;
          FileName?: string;
          Payload?: string;
          CreatedDate?: string;
        };

        const data = await graphqlClient.query<{
          getVibeAssets: { items: BlocksAsset[] };
        }>({
          query: `
            query GetAssets($input: DynamicQueryInput) {
              getVibeAssets(input: $input) {
                items {
                  ItemId
                  OwnerId
                  WebsiteId
                  FileName
                  Payload
                  CreatedDate
                }
              }
            }
          `,
          variables: {
            input: {
              filter: JSON.stringify({ WebsiteId: websiteId }),
              sort: JSON.stringify({ CreatedDate: -1 }),
              pageNo: 1,
              pageSize: 200,
            },
          },
        });

        return (data.getVibeAssets?.items ?? []).map((item) => {
          const fallback: Asset = {
            id: item.ItemId ?? createId('asset'),
            ownerId: item.OwnerId ?? '',
            websiteId: item.WebsiteId ?? websiteId,
            fileName: item.FileName ?? 'asset',
            url: '',
            mimeType: '',
            size: 0,
            createdAt: item.CreatedDate ?? now(),
          };
          const asset = parsePayload(item.Payload, fallback);
          return {
            ...asset,
            id: item.ItemId ?? asset.id,
            ownerId: item.OwnerId ?? asset.ownerId,
            websiteId: item.WebsiteId ?? asset.websiteId,
          };
        });
      },
      () =>
        loadSnapshot().assets.filter((asset) => asset.websiteId === websiteId)
    );
  },

  async uploadAsset(file: File, websiteId: string, ownerId: string): Promise<Asset> {
    const createLocalAsset = async () => {
      const asset: Asset = {
        id: createId('asset'),
        ownerId,
        websiteId,
        fileName: file.name,
        url: await readFileAsDataUrl(file),
        mimeType: file.type,
        size: file.size,
        createdAt: now(),
      };
      const snapshot = loadSnapshot();
      saveSnapshot({ ...snapshot, assets: [...snapshot.assets, asset] });
      return asset;
    };

    if (isLocalDemoToken(useAuthStore.getState().accessToken)) {
      return createLocalAsset();
    }

    const response = await getPreSignedUrlForUpload({
      name: file.name,
      projectKey: import.meta.env.VITE_X_BLOCKS_KEY,
      itemId: '',
      metaData: JSON.stringify({ websiteId, ownerId, source: 'vibebuilder' }),
      accessModifier: 'Public',
      configurationName: 'Default',
      parentDirectoryId: '',
      tags: '',
      moduleName: ModuleName.DefaultConstruct,
    });

    if (!response.isSuccess || !response.uploadUrl) {
      const detail =
        response.errors && Object.keys(response.errors).length > 0
          ? ` ${JSON.stringify(response.errors)}`
          : '';
      throw new Error(`Blocks Storage presign failed.${detail}`);
    }

    await preSignedPut(response.uploadUrl, file);

    const publicUrl = assertHttpsPublicUrl(response.uploadUrl.split('?')[0]);

    const asset: Asset = {
      id: response.fileId ?? createId('asset'),
      ownerId,
      websiteId,
      fileName: file.name,
      url: publicUrl,
      mimeType: file.type,
      size: file.size,
      createdAt: now(),
    };

    return runWithDemoFallback(
      async () => {
        const assetRes = await graphqlClient.mutate<{ insertVibeAsset?: GatewayInsertResult }>({
          query: `
            mutation InsertAsset($input: VibeAssetInsertInput!) {
              insertVibeAsset(input: $input) {
                itemId
                acknowledged
                message
              }
            }
          `,
          variables: { input: assetInsertInput(asset) },
        });
        const persistedAssetId = requireInsertItemId(assetRes.insertVibeAsset, 'insertVibeAsset');
        return { ...asset, id: persistedAssetId };
      },
      () => {
        const snapshot = loadSnapshot();
        saveSnapshot({ ...snapshot, assets: [...snapshot.assets, asset] });
        return asset;
      }
    );
  },
};
