import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vibeBuilderService } from '../services/vibe-builder.service';
import { VibePageLayout, Website, WebsitePage } from '../types';

export const vibeBuilderKeys = {
  websites: (ownerId: string) => ['vibe-builder', 'websites', ownerId] as const,
  pages: (websiteId: string) => ['vibe-builder', 'pages', websiteId] as const,
  assets: (websiteId: string) => ['vibe-builder', 'assets', websiteId] as const,
  publicPage: (siteSlug: string, pageSlug: string) =>
    ['vibe-builder', 'public', siteSlug, pageSlug] as const,
};

export const useWebsites = (ownerId: string) =>
  useQuery({
    queryKey: vibeBuilderKeys.websites(ownerId),
    queryFn: () => vibeBuilderService.listWebsites(ownerId),
    enabled: Boolean(ownerId),
  });

export const useWebsitePages = (websiteId: string) =>
  useQuery({
    queryKey: vibeBuilderKeys.pages(websiteId),
    queryFn: () => vibeBuilderService.listPages(websiteId),
    enabled: Boolean(websiteId),
  });

type CreateWebsiteInput = { name: string; templateLayout?: VibePageLayout };

export const useCreateWebsite = (ownerId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, templateLayout }: CreateWebsiteInput) => {
      const result = await vibeBuilderService.createWebsite(ownerId, name);
      if (templateLayout && templateLayout.blocks.length > 0) {
        const seededPage = await vibeBuilderService.updateDraftLayout(
          result.page,
          templateLayout
        );
        return { website: result.website, page: seededPage };
      }
      return result;
    },
    onSuccess: ({ page, website }) => {
      queryClient.invalidateQueries({ queryKey: vibeBuilderKeys.websites(ownerId) });
      queryClient.invalidateQueries({ queryKey: vibeBuilderKeys.pages(website.id) });
      queryClient.setQueryData(vibeBuilderKeys.pages(website.id), [page]);
    },
  });
};

export const useCreatePage = (website?: Website) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => {
      if (!website) {
        throw new Error('A website is required to create a page.');
      }
      return vibeBuilderService.createPage(website, name);
    },
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: vibeBuilderKeys.pages(page.websiteId) });
    },
  });
};

export const useDeletePage = (websiteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => vibeBuilderService.deletePage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vibeBuilderKeys.pages(websiteId) });
    },
  });
};

export const useRenamePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ page, name }: { page: WebsitePage; name: string }) =>
      vibeBuilderService.renamePage(page, name),
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: vibeBuilderKeys.pages(page.websiteId) });
    },
  });
};

export const useSaveDraftLayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ page, layout }: { page: WebsitePage; layout: VibePageLayout }) =>
      vibeBuilderService.updateDraftLayout(page, layout),
    onSuccess: (page) => {
      queryClient.setQueryData<WebsitePage[]>(
        vibeBuilderKeys.pages(page.websiteId),
        (old = []) => old.map((item) => (item.id === page.id ? page : item))
      );
    },
  });
};

export const usePublishPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ website, page }: { website: Website; page: WebsitePage }) =>
      vibeBuilderService.publishPage(website, page),
    onSuccess: ({ website, page }) => {
      queryClient.invalidateQueries({ queryKey: vibeBuilderKeys.websites(website.ownerId) });
      queryClient.invalidateQueries({ queryKey: vibeBuilderKeys.pages(page.websiteId) });
    },
  });
};

export const usePublicPage = (siteSlug = '', pageSlug = '') =>
  useQuery({
    queryKey: vibeBuilderKeys.publicPage(siteSlug, pageSlug),
    queryFn: () => vibeBuilderService.findPublishedPage(siteSlug, pageSlug),
    enabled: Boolean(siteSlug),
  });

export const useUploadAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, websiteId, ownerId }: { file: File; websiteId: string; ownerId: string }) =>
      vibeBuilderService.uploadAsset(file, websiteId, ownerId),
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: vibeBuilderKeys.assets(asset.websiteId) });
    },
  });
};

export const useUpdateWebsite = (ownerId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (website: Website) => vibeBuilderService.updateWebsite(website),
    onSuccess: (website) => {
      if (ownerId) {
        queryClient.invalidateQueries({ queryKey: vibeBuilderKeys.websites(ownerId) });
      }
      queryClient.invalidateQueries({ queryKey: vibeBuilderKeys.pages(website.id) });
    },
  });
};

export const useDeleteWebsite = (ownerId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (websiteId: string) => vibeBuilderService.deleteWebsite(websiteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vibeBuilderKeys.websites(ownerId) });
    },
  });
};

export const useAssets = (websiteId: string) =>
  useQuery({
    queryKey: vibeBuilderKeys.assets(websiteId),
    queryFn: () => vibeBuilderService.listAssets(websiteId),
    enabled: Boolean(websiteId),
  });
