/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ParentWidgetContext } from '$:/plugins/linonetwo/tw-react/index.js';
import { useCallback, useContext } from 'react';

export function useOpenInStory(title?: string) {
  const parentWidget = useContext(ParentWidgetContext);
  const onOpenInStory = useCallback(() => {
    $tw.wiki.setText('$:/layout', 'text', undefined, '');
    if (title) {
      parentWidget?.dispatchEvent({
        type: 'tm-navigate',
        navigateTo: title,
      });
    }
  }, [parentWidget, title]);
  return onOpenInStory;
}
