import type { TLBounds } from '@tldraw/core';
import { TLDR } from '@tldr/state/TLDR';
import type { TldrawApp } from '@tldr/state/TldrawApp';
import { BaseSession } from '@tldr/state/sessions/BaseSession';
import { ArrowShape, EllipseShape, RectangleShape, SessionType, TDStatus, TldrawCommand, TldrawPatch, TriangleShape } from '@tldr/types';

export class TranslateLabelSession extends BaseSession {
  type = SessionType.Handle;
  performanceMode = undefined;
  status = TDStatus.TranslatingHandle;
  initialShape: RectangleShape | TriangleShape | EllipseShape | ArrowShape;
  initialShapeBounds: TLBounds;

  constructor(app: TldrawApp, shapeId: string) {
    super(app);
    this.initialShape = this.app.getShape<RectangleShape | TriangleShape | EllipseShape | ArrowShape>(shapeId);
    this.initialShapeBounds = this.app.getShapeBounds(shapeId);
  }

  start = (): TldrawPatch | undefined => void null;

  update = (): TldrawPatch | undefined => {
    const {
      initialShapeBounds,
      app: { currentPageId, currentPoint },
    } = this;

    const newHandlePoint = [
      Math.max(0, Math.min(1, currentPoint[0] / initialShapeBounds.width)),
      Math.max(0, Math.min(1, currentPoint[1] / initialShapeBounds.height)),
    ];

    // First update the handle's next point
    const change = {
      handlePoint: newHandlePoint,
    } as Partial<RectangleShape | TriangleShape | EllipseShape | ArrowShape>;

    return {
      document: {
        pages: {
          [currentPageId]: {
            shapes: {
              [this.initialShape.id]: change,
            },
          },
        },
      },
    };
  };

  cancel = (): TldrawPatch | undefined => {
    const {
      initialShape,
      app: { currentPageId },
    } = this;

    return {
      document: {
        pages: {
          [currentPageId]: {
            shapes: {
              [initialShape.id]: initialShape,
            },
          },
        },
      },
    };
  };

  complete = (): TldrawPatch | TldrawCommand | undefined => {
    const {
      initialShape,
      app: { currentPageId },
    } = this;

    return {
      before: {
        document: {
          pages: {
            [currentPageId]: {
              shapes: {
                [initialShape.id]: initialShape,
              },
            },
          },
        },
      },
      after: {
        document: {
          pages: {
            [currentPageId]: {
              shapes: {
                [initialShape.id]: TLDR.onSessionComplete(this.app.getShape(this.initialShape.id)),
              },
            },
          },
        },
      },
    };
  };
}
