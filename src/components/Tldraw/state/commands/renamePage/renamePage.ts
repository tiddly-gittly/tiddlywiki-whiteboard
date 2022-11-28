import type { TldrawApp } from '@tldr/state/TldrawApp'
import type { TldrawCommand } from '@tldr/types'

export function renamePage(app: TldrawApp, pageId: string, name: string): TldrawCommand {
  const { page } = app

  return {
    id: 'rename_page',
    before: {
      document: {
        pages: {
          [pageId]: { name: page.name },
        },
      },
    },
    after: {
      document: {
        pages: {
          [pageId]: { name: name },
        },
      },
    },
  }
}
