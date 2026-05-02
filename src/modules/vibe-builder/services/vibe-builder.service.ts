import graphqlClient from '@/lib/graphql-client';
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

/** Demo token or DEV GraphQL failure: use local snapshot instead of throwing (prod throws on real errors). */
const runWithDemoFallback = async <T,>(operation: () => Promise<T>, fallback: () => T): Promise<T> => {
  if (isLocalDemoToken(useAuthStore.getState().accessToken)) {
    return fallback();
  }

  try {
    return await operation();
  } catch (err) {
    if (import.meta.env.DEV) {
      return fallback();
    }

    throw err;
  }
};

const websiteInput = (website: Website) => ({
  ItemId: website.id,
  OwnerId: website.ownerId,
  Slug: website.slug,
  Payload: JSON.stringify(website),
  CreatedDate: website.createdAt,
  LastUpdatedDate: website.updatedAt,
});

const pageInput = (page: WebsitePage) => ({
  ItemId: page.id,
  WebsiteId: page.websiteId,
  OwnerId: page.ownerId,
  Slug: page.slug,
  Payload: JSON.stringify(page),
  CreatedDate: page.createdAt,
  LastUpdatedDate: page.updatedAt,
});

const assetInput = (asset: Asset) => ({
  ItemId: asset.id,
  OwnerId: asset.ownerId,
  WebsiteId: asset.websiteId,
  FileName: asset.fileName,
  Payload: JSON.stringify(asset),
  CreatedDate: asset.createdAt,
});

export const vibeBuilderService = {
  async listWebsites(ownerId: string): Promise<Website[]> {
    return runWithDemoFallback(
      async () => {
        const data = await graphqlClient.query<{ VibeWebsites: { items: BlocksWebsite[] } }>({
          query: `
            query GetWebsites($input: DynamicQueryInput) {
              VibeWebsites(input: $input) {
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
              filter: JSON.stringify({ OwnerId: ownerId, IsDeleted: false }),
              sort: JSON.stringify({ LastUpdatedDate: -1 }),
              pageNo: 1,
              pageSize: 100,
            },
          },
        });

        return (data.VibeWebsites?.items ?? []).map(mapWebsite);
      },
      () => loadSnapshot().websites.filter((website) => website.ownerId === ownerId)
    );
  },

  async listPages(websiteId: string): Promise<WebsitePage[]> {
    return runWithDemoFallback(
      async () => {
        const data = await graphqlClient.query<{ VibePages: { items: BlocksPage[] } }>({
          query: `
            query GetPages($input: DynamicQueryInput) {
              VibePages(input: $input) {
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
              filter: JSON.stringify({ WebsiteId: websiteId, IsDeleted: false }),
              sort: JSON.stringify({ LastUpdatedDate: 1 }),
              pageNo: 1,
              pageSize: 100,
            },
          },
        });

        return (data.VibePages?.items ?? []).map(mapPage).sort((a, b) => a.sortOrder - b.sortOrder);
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

        await graphqlClient.mutate({
          query: `
            mutation InsertWebsite($input: VibeWebsiteInsertInput!) {
              insertVibeWebsite(input: $input) {
                itemId
              }
            }
          `,
          variables: { input: websiteInput(website) },
        });
        await graphqlClient.mutate({
          query: `
            mutation InsertPage($input: VibePageInsertInput!) {
              insertVibePage(input: $input) {
                itemId
              }
            }
          `,
          variables: { input: pageInput(page) },
        });

        return { website, page };
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
        await graphqlClient.mutate({
          query: `
            mutation InsertPage($input: VibePageInsertInput!) {
              insertVibePage(input: $input) {
                itemId
              }
            }
          `,
          variables: { input: pageInput(page) },
        });

        return page;
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
            input: { IsDeleted: true, LastUpdatedDate: now() },
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
            input: pageInput(updatedPage),
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
            input: pageInput(updatedPage),
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
            input: websiteInput(updatedWebsite),
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
            input: pageInput(updatedPage),
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
        const websites = await graphqlClient.query<{ VibeWebsites: { items: BlocksWebsite[] } }>({
          query: `
            query GetPublicWebsite($input: DynamicQueryInput) {
              VibeWebsites(input: $input) {
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
              filter: JSON.stringify({ Slug: siteSlug, IsDeleted: false }),
              pageNo: 1,
              pageSize: 1,
            },
          },
        });
        const website = websites.VibeWebsites?.items?.[0] ? mapWebsite(websites.VibeWebsites.items[0]) : undefined;

        if (!website || website.status !== 'published') {
          return { website: undefined, pages: [], page: undefined };
        }

        const pages = await this.listPages(website.id);
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
            input: websiteInput(updated),
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
            input: { IsDeleted: true, LastUpdatedDate: now() },
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
          VibeAssets: { items: BlocksAsset[] };
        }>({
          query: `
            query GetAssets($input: DynamicQueryInput) {
              VibeAssets(input: $input) {
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
              filter: JSON.stringify({ WebsiteId: websiteId, IsDeleted: false }),
              sort: JSON.stringify({ CreatedDate: -1 }),
              pageNo: 1,
              pageSize: 200,
            },
          },
        });

        return (data.VibeAssets?.items ?? []).map((item) => {
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
      moduleName: 0,
      metaData: JSON.stringify({ websiteId, ownerId, source: 'vibebuilder' }),
    });

    if (!response.uploadUrl) {
      throw new Error('Blocks Storage did not return an upload URL.');
    }

    await fetch(response.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });

    const asset: Asset = {
      id: response.fileId ?? createId('asset'),
      ownerId,
      websiteId,
      fileName: file.name,
      url: response.uploadUrl.split('?')[0],
      mimeType: file.type,
      size: file.size,
      createdAt: now(),
    };

    return runWithDemoFallback(
      async () => {
        await graphqlClient.mutate({
          query: `
            mutation InsertAsset($input: VibeAssetInsertInput!) {
              insertVibeAsset(input: $input) {
                itemId
              }
            }
          `,
          variables: { input: assetInput(asset) },
        });

        return asset;
      },
      () => {
        const snapshot = loadSnapshot();
        saveSnapshot({ ...snapshot, assets: [...snapshot.assets, asset] });
        return asset;
      }
    );
  },
};
