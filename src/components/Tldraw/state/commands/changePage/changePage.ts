import type { TldrawApp } from '@tldr/state/TldrawApp'
import type { TldrawCommand } from '@tldr/types'

export function changePage(app: TldrawApp, pageId: string): TldrawCommand {
  return {
    id: 'change_page',
    before: {
      appState: {
        currentPageId: app.currentPageId,
      },
    },
    after: {
      appState: {
        currentPageId: pageId,
      },
    },
  }
}
