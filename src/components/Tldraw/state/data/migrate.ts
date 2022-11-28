/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { TDShapeType, TDSnapshot } from '../../types';

/**
 * We started at "version":15.5, so old logics are commented out.
 */
export function migrate(state: TDSnapshot, newVersion: number): TDSnapshot {
  const { document } = state;
  const { version = 0, pages, assets, pageStates } = document;

  if (!('assets' in document)) {
    // @ts-expect-error Property 'assets' does not exist on type 'never'.ts(2339)
    document.assets = {};
  }

  // Remove unused assets when loading a document
  const assetIdsInUse = new Set<string>();

  Object.values(pages).forEach((page) =>
    Object.values(page.shapes).forEach((shape) => {
      const { parentId, children, assetId, id } = shape;

      if (assetId) {
        assetIdsInUse.add(assetId);
      }

      // Fix missing parent bug
      if (parentId !== page.id && !page.shapes[parentId]) {
        console.warn('Encountered a shape with a missing parent!');
        shape.parentId = page.id;
      }

      if (shape.type === TDShapeType.Group && children) {
        children.forEach((childId) => {
          if (!page.shapes[childId]) {
            console.warn('Encountered a parent with a missing child!', id, childId);
            children?.splice(children.indexOf(childId), 1);
          }
        });

        // TODO: Remove the shape if it has no children
      }
    }),
  );

  Object.keys(assets).forEach((assetId) => {
    if (!assetIdsInUse.has(assetId)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete, unicorn/consistent-destructuring
      delete document.assets[assetId];
    }
  });

  if (version !== newVersion) {
    // if (version < 14) {
    //   Object.values(document.pages).forEach((page) => {
    //     Object.values(page.shapes)
    //       .filter((shape) => shape.type === TDShapeType.Text)
    //       .forEach((shape) => (shape as TextShape).style.font === FontStyle.Script);
    //   });
    // }
    // // Lowercase styles, move binding meta to binding
    // if (version <= 13) {
    //   Object.values(document.pages).forEach((page) => {
    //     Object.values(page.bindings).forEach((binding) => {
    //       Object.assign(binding, (binding as any).meta);
    //     });
    //     Object.values(page.shapes).forEach((shape) => {
    //       Object.entries(shape.style).forEach(([id, style]) => {
    //         if (typeof style === 'string') {
    //           // @ts-expect-error
    //           shape.style[id] = style.toLowerCase();
    //         }
    //       });
    //       if (shape.type === TDShapeType.Arrow && shape.decorations) {
    //         Object.entries(shape.decorations).forEach(([id, decoration]) => {
    //           if (decoration === 'Arrow') {
    //             shape.decorations = {
    //               ...shape.decorations,
    //               [id]: Decoration.Arrow,
    //             };
    //           }
    //         });
    //       }
    //     });
    //   });
    // }
    // // Add document name and file system handle
    // if (version <= 13.1) {
    //   document.name = 'New Document';
    // }
    // if (version < 15) {
    //   document.assets = {};
    // }
    // Object.values(document.pages).forEach((page) => {
    //   Object.values(page.shapes).forEach((shape) => {
    //     if (version < 15.2 && (shape.type === TDShapeType.Image || shape.type === TDShapeType.Video)) {
    //       shape.style.isFilled = true;
    //     }
    //     if (
    //       version < 15.3 &&
    //       (shape.type === TDShapeType.Rectangle ||
    //         shape.type === TDShapeType.Triangle ||
    //         shape.type === TDShapeType.Ellipse ||
    //         shape.type === TDShapeType.Arrow)
    //     ) {
    //       shape.label = (shape as any).text || '';
    //       shape.labelPoint = [0.5, 0.5];
    //     }
    //   });
    // });
    // if (version < 15.4) {
    //   settings.dockPosition = 'bottom';
    // }
    // if (version < 15.5) {
    //   settings.exportBackground = TDExportBackground.Transparent;
    // }
  }

  // Cleanup
  Object.values(pageStates).forEach((pageState) => {
    pageState.selectedIds = pageState.selectedIds.filter((id) => {
      // eslint-disable-next-line unicorn/consistent-destructuring
      return document.pages[pageState.id].shapes[id] !== undefined;
    });
    pageState.bindingId = undefined;
    pageState.editingId = undefined;
    pageState.hoveredId = undefined;
    pageState.pointedId = undefined;
  });

  document.version = newVersion;

  return state;
}
