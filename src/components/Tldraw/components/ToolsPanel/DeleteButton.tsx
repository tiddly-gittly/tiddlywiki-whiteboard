import * as React from 'react';
import { useIntl } from 'react-intl';
import { ToolButton } from '@tldr/components/Primitives/ToolButton';
import { Tooltip } from '@tldr/components/Primitives/Tooltip';
import { TrashIcon } from '@tldr/components/Primitives/icons';
import { useTldrawApp } from '@tldr/hooks';

export function DeleteButton() {
  const app = useTldrawApp();
  const intl = useIntl();

  const handleDelete = React.useCallback(() => {
    app.delete();
  }, [app]);

  const hasSelection = app.useStore((s) => s.appState.status === 'idle' && s.document.pageStates[s.appState.currentPageId].selectedIds.length > 0);

  return (
    <Tooltip label={intl.formatMessage({ id: 'delete' })} kbd="⌫" id="TD-Delete">
      <ToolButton variant="circle" disabled={!hasSelection} onSelect={handleDelete}>
        <TrashIcon />
      </ToolButton>
    </Tooltip>
  );
}
