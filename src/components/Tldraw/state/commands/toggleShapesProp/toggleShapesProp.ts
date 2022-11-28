import type { TldrawApp } from '@tldr/state';
import type { TDShape, TldrawCommand } from '@tldr/types';

export function toggleShapeProp(app: TldrawApp, ids: string[], property: keyof TDShape): TldrawCommand {
  const { currentPageId } = app;

  const initialShapes = ids.map((id) => app.getShape(id)).filter((shape) => (property === 'isLocked' ? true : !shape.isLocked));

  const isAllToggled = initialShapes.every((shape) => shape[property]);

  const before: Record<string, Partial<TDShape>> = {};
  const after: Record<string, Partial<TDShape>> = {};

  initialShapes.forEach((shape) => {
    before[shape.id] = { [property]: shape[property] };
    after[shape.id] = { [property]: !isAllToggled };
  });

  return {
    id: 'toggle',
    before: {
      document: {
        pages: {
          [currentPageId]: {
            shapes: before,
          },
        },
        pageStates: {
          [currentPageId]: {
            selectedIds: ids,
          },
        },
      },
    },
    after: {
      document: {
        pages: {
          [currentPageId]: {
            shapes: after,
          },
        },
        pageStates: {
          [currentPageId]: {
            selectedIds: ids,
          },
        },
      },
    },
  };
}
