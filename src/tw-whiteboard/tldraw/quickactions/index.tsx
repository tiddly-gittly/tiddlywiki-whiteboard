/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { DefaultQuickActions, DefaultQuickActionsContent, TldrawUiMenuItem } from '@tldraw/tldraw';
import { useContext } from 'react';
import { PropsContext } from 'src/tw-whiteboard/utils/context';
import { lingo } from 'src/tw-whiteboard/utils/lingo';

export function CustomQuickActions() {
  const props = useContext(PropsContext);
  return (
    <DefaultQuickActions>
      <DefaultQuickActionsContent />
      <TldrawUiMenuItem
        id='code'
        icon='code'
        label={lingo('QuickActions/CopyWidgetSnippet')}
        onSelect={() => {
          if (!props?.currentTiddler) return;
          const snippetText = `<$whiteboard tiddler="${props.currentTiddler}" readonly="yes" />`;
          $tw.utils.copyToClipboard(snippetText);
        }}
      />
    </DefaultQuickActions>
  );
}
