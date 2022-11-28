import { TLDR } from '@tldr/state/TLDR';
import type { TldrawApp } from '@tldr/state/TldrawApp';
import { MoveType, TDShape, TldrawCommand } from '@tldr/types';

export function reorderShapes(app: TldrawApp, ids: string[], type: MoveType): TldrawCommand {
  const { currentPageId, page } = app;

  // Get the unique parent ids for the selected elements
  const parentIds = new Set(ids.map((id) => app.getShape(id).parentId));

  let result: {
    after: Record<string, Partial<TDShape>>;
    before: Record<string, Partial<TDShape>>;
  } = { before: {}, after: {} };

  let startIndex: number;
  let startChildIndex: number;
  let step: number;

  // Collect shapes with common parents into a table under their parent id
  [...parentIds.values()].forEach((parentId) => {
    let sortedChildren: TDShape[] = [];
    if (parentId === page.id) {
      sortedChildren = Object.values(page.shapes).sort((a, b) => a.childIndex - b.childIndex);
    } else {
      const parent = app.getShape(parentId);
      if (!parent.children) throw new Error('No children in parent!');

      sortedChildren = parent.children.map((childId) => app.getShape(childId)).sort((a, b) => a.childIndex - b.childIndex);
    }

    const sortedChildIds = sortedChildren.map((shape) => shape.id);

    const sortedIndicesToMove = ids
      .filter((id) => sortedChildIds.includes(id))
      .map((id) => sortedChildIds.indexOf(id))
      .sort((a, b) => a - b);

    if (sortedIndicesToMove.length === sortedChildIds.length) return;

    switch (type) {
      case MoveType.ToBack: {
        //               a       b  c
        // Initial   1   2    3  4  5  6  7
        // Final   .25  .5  .75  1  3  6  7
        //           a   b    c

        // Find the lowest "open" index
        for (let index = 0; index < sortedChildIds.length; index++) {
          if (sortedIndicesToMove.includes(index)) continue;
          startIndex = index;
          break;
        }

        // Find the lowest child index that isn't in sortedIndicesToMove
        startChildIndex = sortedChildren[startIndex].childIndex;

        // Find the step for each additional child
        step = startChildIndex / (sortedIndicesToMove.length + 1);

        // Get the results of moving the selected shapes below the first open index's shape
        result = TLDR.mutateShapes(
          app.state,
          sortedIndicesToMove.map((index) => sortedChildren[index].id).reverse(),
          (_shape, index) => ({
            childIndex: startChildIndex - (index + 1) * step,
          }),
          currentPageId,
        );

        break;
      }
      case MoveType.ToFront: {
        //              a     b  c
        // Initial   1  2  3  4  5  6   7
        // Final     1  3  6  7  8  9  10
        //                       a  b   c

        // Find the highest "open" index
        for (let index = sortedChildIds.length - 1; index >= 0; index--) {
          if (sortedIndicesToMove.includes(index)) continue;
          startIndex = index;
          break;
        }

        // Find the lowest child index that isn't in sortedIndicesToMove
        startChildIndex = sortedChildren[startIndex].childIndex;

        // Find the step for each additional child
        step = 1;

        // Get the results of moving the selected shapes below the first open index's shape
        result = TLDR.mutateShapes(
          app.state,
          sortedIndicesToMove.map((index) => sortedChildren[index].id),
          (_shape, index) => ({
            childIndex: startChildIndex + (index + 1),
          }),
          currentPageId,
        );

        break;
      }
      case MoveType.Backward: {
        //               a           b  c
        // Initial    1  2     3     4  5  6  7
        // Final     .5  1  1.66  2.33  3  6  7
        //           a         b     c

        const indexMap: Record<string, number> = {};

        // Starting from the top...
        for (let index = sortedChildIds.length - 1; index >= 0; index--) {
          // If we found a moving index...
          if (sortedIndicesToMove.includes(index)) {
            for (let index_ = index; index_ >= 0; index_--) {
              // iterate downward until we find an open spot
              if (!sortedIndicesToMove.includes(index_)) {
                // i = the index of the first closed spot
                // j = the index of the first open spot

                const endChildIndex = sortedChildren[index_].childIndex;
                let startChildIndex: number;
                let step: number;

                if (index_ === 0) {
                  // We're moving below the first child, start from
                  // half of its child index.

                  startChildIndex = endChildIndex / 2;
                  step = endChildIndex / 2 / (index - index_ + 1);
                } else {
                  // Start from the child index of the child below the
                  // child above.
                  startChildIndex = sortedChildren[index_ - 1].childIndex;
                  step = (endChildIndex - startChildIndex) / (index - index_ + 1);
                  startChildIndex += step;
                }

                for (let k = 0; k < index - index_; k++) {
                  indexMap[sortedChildren[index_ + k + 1].id] = startChildIndex + step * k;
                }

                break;
              }
            }
          }
        }

        if (Object.values(indexMap).length > 0) {
          // Get the results of moving the selected shapes below the first open index's shape
          result = TLDR.mutateShapes(
            app.state,
            sortedIndicesToMove.map((index) => sortedChildren[index].id),
            (shape) => ({
              childIndex: indexMap[shape.id],
            }),
            currentPageId,
          );
        }

        break;
      }
      case MoveType.Forward: {
        //             a     b c
        // Initial   1 2   3 4 5 6 7
        // Final     1 3 3.5 6 7 8 9
        //                 a     b c

        const indexMap: Record<string, number> = {};

        // Starting from the top...
        for (let index = 0; index < sortedChildIds.length; index++) {
          // If we found a moving index...
          if (sortedIndicesToMove.includes(index)) {
            // Search for the first open spot above this one
            for (let index_ = index; index_ < sortedChildIds.length; index_++) {
              if (!sortedIndicesToMove.includes(index_)) {
                // i = the low index of the first closed spot
                // j = the high index of the first open spot

                startChildIndex = sortedChildren[index_].childIndex;

                const step = index_ === sortedChildIds.length - 1 ? 1 : (sortedChildren[index_ + 1].childIndex - startChildIndex) / (index_ - index + 1);

                for (let k = 0; k < index_ - index; k++) {
                  indexMap[sortedChildren[index + k].id] = startChildIndex + step * (k + 1);
                }

                break;
              }
            }
          }
        }

        if (Object.values(indexMap).length > 0) {
          // Get the results of moving the selected shapes below the first open index's shape
          result = TLDR.mutateShapes(
            app.state,
            sortedIndicesToMove.map((index) => sortedChildren[index].id),
            (shape) => ({
              childIndex: indexMap[shape.id],
            }),
            currentPageId,
          );
        }

        break;
      }
    }
  });

  return {
    id: 'move',
    before: {
      document: {
        pages: {
          [currentPageId]: { shapes: result.before },
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
          [currentPageId]: { shapes: result.after },
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
