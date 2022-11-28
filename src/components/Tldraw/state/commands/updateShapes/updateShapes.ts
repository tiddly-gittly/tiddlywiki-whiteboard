import { TLDR } from '@tldr/state/TLDR';
import type { TldrawApp } from '@tldr/state/TldrawApp';
import type { TDShape, TldrawCommand } from '@tldr/types';

export function updateShapes(app: TldrawApp, updates: Array<{ id: string } & Partial<TDShape>>, pageId: string): TldrawCommand {
  const ids = updates.map((update) => update.id);

  const change = TLDR.mutateShapes(
    app.state,
    ids.filter((id) => !app.getShape(id, pageId).isLocked),
    (_shape, index) => updates[index],
    pageId,
  );

  return {
    id: 'update',
    before: {
      document: {
        pages: {
          [pageId]: {
            shapes: change.before,
          },
        },
      },
    },
    after: {
      document: {
        pages: {
          [pageId]: {
            shapes: change.after,
          },
        },
      },
    },
  };
}
