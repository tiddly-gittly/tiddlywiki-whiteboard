import { Utils } from '@tldraw/core';
import { Vec } from '@tldraw/vec';
import { TLDR } from '@tldr/state/TLDR';
import type { TldrawApp } from '@tldr/state/TldrawApp';
import { AlignType, TDShapeType, TldrawCommand } from '@tldr/types';

export function alignShapes(app: TldrawApp, ids: string[], type: AlignType): TldrawCommand {
  const { currentPageId } = app;

  const initialShapes = ids.map((id) => app.getShape(id));

  const boundsForShapes = initialShapes.map((shape) => {
    return {
      id: shape.id,
      point: [...shape.point],
      bounds: TLDR.getBounds(shape),
    };
  });

  const commonBounds = Utils.getCommonBounds(boundsForShapes.map(({ bounds }) => bounds));

  const midX = commonBounds.minX + commonBounds.width / 2;
  const midY = commonBounds.minY + commonBounds.height / 2;

  const deltaMap = Object.fromEntries(
    boundsForShapes.map(({ id, point, bounds }) => {
      return [
        id,
        {
          prev: point,
          next: {
            [AlignType.Top]: [point[0], commonBounds.minY],
            [AlignType.CenterVertical]: [point[0], midY - bounds.height / 2],
            [AlignType.Bottom]: [point[0], commonBounds.maxY - bounds.height],
            [AlignType.Left]: [commonBounds.minX, point[1]],
            [AlignType.CenterHorizontal]: [midX - bounds.width / 2, point[1]],
            [AlignType.Right]: [commonBounds.maxX - bounds.width, point[1]],
          }[type],
        },
      ];
    }),
  );

  const { before, after } = TLDR.mutateShapes(
    app.state,
    ids,
    (shape) => {
      if (!deltaMap[shape.id]) return shape;
      return { point: deltaMap[shape.id].next };
    },
    currentPageId,
    false,
  );

  initialShapes.forEach((shape) => {
    if (shape.type === TDShapeType.Group) {
      const delta = Vec.sub(after[shape.id].point!, before[shape.id].point!);

      shape.children.forEach((id) => {
        const child = app.getShape(id);
        before[child.id] = { point: child.point };
        after[child.id] = { point: Vec.add(child.point, delta) };
      });

      delete before[shape.id];
      delete after[shape.id];
    }
  });

  return {
    id: 'align',
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
