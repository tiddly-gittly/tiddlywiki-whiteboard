import { useEditor } from '@tldraw/editor';
import { useCallback } from 'react';
import { TranscludeShape } from './type';

const DEFAULT_FOLD_HEIGHT = 40;
export function useOnToggleFold(shape: TranscludeShape) {
  const editor = useEditor();
  const onToggleFold = useCallback(() => {
    editor?.store.update(shape.id, (record) => {
      const oldProps = record.props as TranscludeShape['props'];
      const oldMeta = record.meta as TranscludeShape['meta'];
      return ({
        ...record,
        props: {
          ...oldProps,
          folded: !oldProps.folded,
          h: oldProps.folded ? (oldMeta.unfoldedH ?? oldProps.h) : (oldMeta.foldedH ?? DEFAULT_FOLD_HEIGHT),
          w: oldProps.folded ? (oldMeta.unfoldedW ?? oldProps.w) : (oldMeta.foldedW ?? oldProps.w),
        },
        meta: oldProps.folded
          ? {
            ...oldMeta,
            foldedH: oldProps.h,
            foldedW: oldProps.w,
          }
          : {
            ...oldMeta,
            unfoldedH: oldProps.h,
            unfoldedW: oldProps.w,
          },
      });
    });
  }, [editor?.store, shape.id]);

  return onToggleFold;
}
