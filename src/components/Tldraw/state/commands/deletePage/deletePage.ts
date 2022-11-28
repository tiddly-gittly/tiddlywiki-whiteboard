import type { TldrawApp } from '@tldr/state/TldrawApp';
import type { TldrawCommand } from '@tldr/types';

export function deletePage(app: TldrawApp, pageId: string): TldrawCommand {
  const {
    currentPageId,
    document: { pages, pageStates },
  } = app;

  const pagesArray = Object.values(pages).sort((a, b) => (a.childIndex || 0) - (b.childIndex || 0));

  const currentIndex = pagesArray.findIndex((page) => page.id === pageId);

  let nextCurrentPageId: string;

  if (pageId === currentPageId) {
    if (currentIndex === pagesArray.length - 1) {
      nextCurrentPageId = pagesArray[pagesArray.length - 2].id;
    } else {
      nextCurrentPageId = pagesArray[currentIndex + 1].id;
    }
  } else {
    nextCurrentPageId = currentPageId;
  }

  return {
    id: 'delete_page',
    before: {
      appState: {
        currentPageId: pageId,
      },
      document: {
        pages: {
          [pageId]: { ...pages[pageId] },
        },
        pageStates: {
          [pageId]: { ...pageStates[pageId] },
        },
      },
    },
    after: {
      appState: {
        currentPageId: nextCurrentPageId,
      },
      document: {
        pages: {
          [pageId]: undefined,
        },
        pageStates: {
          [pageId]: undefined,
        },
      },
    },
  };
}
