import * as React from 'react';
import { Panel } from '@tldr/components/Primitives/Panel';
import { ToolButton } from '@tldr/components/Primitives/ToolButton';
import { UndoIcon } from '@tldr/components/Primitives/icons';
import { useTldrawApp } from '@tldr/hooks';
import { styled } from '@tldr/styles';
import { Menu } from './Menu/Menu';
import { MultiplayerMenu } from './MultiplayerMenu';
import { PageMenu } from './PageMenu';
import { StyleMenu } from './StyleMenu';
import { ZoomMenu } from './ZoomMenu';

interface TopPanelProps {
  readOnly: boolean;
  showMenu: boolean;
  showMultiplayerMenu: boolean;
  showPages: boolean;
  showStyles: boolean;
  showZoom: boolean;
}

export function _TopPanel({ readOnly, showPages, showMenu, showStyles, showZoom, showMultiplayerMenu }: TopPanelProps) {
  const app = useTldrawApp();

  return (
    <StyledTopPanel>
      {(showMenu || showPages) && (
        <Panel side="left" id="TD-MenuPanel">
          {showMenu && <Menu readOnly={readOnly} />}
          {showMultiplayerMenu && <MultiplayerMenu />}
          {showPages && <PageMenu />}
        </Panel>
      )}
      <StyledSpacer />
      {(showStyles || showZoom) && (
        <Panel side="right">
          {app.readOnly ? (
            <ReadOnlyLabel>Read Only</ReadOnlyLabel>
          ) : (
            <>
              <ToolButton>
                <UndoIcon onClick={app.undo} />
              </ToolButton>
              <ToolButton>
                <UndoIcon onClick={app.redo} flipHorizontal />
              </ToolButton>
            </>
          )}
          {showZoom && <ZoomMenu />}
          {showStyles && !readOnly && <StyleMenu />}
        </Panel>
      )}
    </StyledTopPanel>
  );
}

const StyledTopPanel = styled('div', {
  width: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  display: 'flex',
  flexDirection: 'row',
  pointerEvents: 'none',
  '& > *': {
    pointerEvents: 'all',
  },
});

const StyledSpacer = styled('div', {
  flexGrow: 2,
  pointerEvents: 'none',
});

const ReadOnlyLabel = styled('div', {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '$ui',
  fontSize: '$1',
  paddingLeft: '$4',
  paddingRight: '$1',
  userSelect: 'none',
});

export const TopPanel = React.memo(_TopPanel);
