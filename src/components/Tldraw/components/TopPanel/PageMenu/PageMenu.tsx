import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CheckIcon, PlusIcon } from '@radix-ui/react-icons';
import * as React from 'react';
import { FormattedMessage, useIntl } from '@tldr/translations/FormattedMessage';
import { Divider } from '@tldr/components/Primitives/Divider';
import { DMContent } from '@tldr/components/Primitives/DropdownMenu';
import { RowButton } from '@tldr/components/Primitives/RowButton';
import { SmallIcon } from '@tldr/components/Primitives/SmallIcon';
import { ToolButton } from '@tldr/components/Primitives/ToolButton';
import { useTldrawApp } from '@tldr/hooks';
import { styled } from '@tldr/styles';
import type { TDSnapshot } from '@tldr/types';
import { PageOptionsDialog } from '../PageOptionsDialog';

const sortedSelector = (s: TDSnapshot) => Object.values(s.document.pages).sort((a, b) => (a.childIndex || 0) - (b.childIndex || 0));

const currentPageNameSelector = (s: TDSnapshot) => s.document.pages[s.appState.currentPageId].name;

const currentPageIdSelector = (s: TDSnapshot) => s.document.pages[s.appState.currentPageId].id;

export function PageMenu() {
  const app = useTldrawApp();

  const intl = useIntl();

  const rIsOpen = React.useRef(false);

  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (rIsOpen.current !== isOpen) {
      rIsOpen.current = isOpen;
    }
  }, [isOpen]);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      if (rIsOpen.current !== isOpen) {
        setIsOpen(isOpen);
      }
    },
    [setIsOpen],
  );
  const currentPageName = app.useStore(currentPageNameSelector);

  return (
    <DropdownMenu.Root dir="ltr" open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger dir="ltr" asChild id="TD-Page">
        <ToolButton variant="text">{currentPageName || intl.formatMessage({ id: 'page' })}</ToolButton>
      </DropdownMenu.Trigger>
      <DMContent variant="menu" align="start" sideOffset={4}>
        {isOpen && <PageMenuContent onClose={handleClose} />}
      </DMContent>
    </DropdownMenu.Root>
  );
}

function PageMenuContent({ onClose }: { onClose: () => void }) {
  const app = useTldrawApp();
  const intl = useIntl();

  const sortedPages = app.useStore(sortedSelector);

  const currentPageId = app.useStore(currentPageIdSelector);

  const defaultPageName = intl.formatMessage({ id: 'page' });

  const handleCreatePage = React.useCallback(() => {
    const pageName = defaultPageName + ' ' + (Object.keys(app.document.pages).length + 1);
    app.createPage(undefined, pageName);
  }, [app]);

  const handleChangePage = React.useCallback(
    (id: string) => {
      onClose();
      app.changePage(id);
    },
    [app],
  );

  const [dragId, setDragId] = React.useState<null | string>(null);

  const [dropIndex, setDropIndex] = React.useState<null | number>(null);

  const handleDragStart = React.useCallback((event_: React.DragEvent<HTMLDivElement>) => {
    setDragId(event_.currentTarget.id);
    setDropIndex(sortedPages.findIndex((p) => p.id === event_.currentTarget.id));
    event_.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrag = React.useCallback(
    (event_: React.DragEvent<HTMLDivElement>) => {
      event_.preventDefault();

      let dropIndex = sortedPages.findIndex((p) => p.id === event_.currentTarget.id);

      const rect = event_.currentTarget.getBoundingClientRect();
      const ny = (event_.clientY - rect.top) / rect.height;

      dropIndex = ny < 0.5 ? dropIndex : dropIndex + 1;

      setDropIndex(dropIndex);
    },
    [dragId, sortedPages],
  );

  const handleDrop = React.useCallback(() => {
    if (dragId !== null && dropIndex !== null) {
      app.movePage(dragId, dropIndex);
    }

    setDragId(null);
    setDropIndex(null);
  }, [dragId, dropIndex]);

  return (
    <>
      <DropdownMenu.RadioGroup dir="ltr" value={currentPageId} onValueChange={handleChangePage}>
        {sortedPages.map((page, index) => (
          <ButtonWithOptions key={page.id} isDropAbove={index === dropIndex && index === 0} isDropBelow={dropIndex !== null && index === dropIndex - 1}>
            <DropdownMenu.RadioItem
              title={page.name || defaultPageName}
              value={page.id}
              key={page.id}
              id={page.id}
              asChild
              onDragOver={handleDrag}
              onDragStart={handleDragStart}
              // onDrag={handleDrag}
              onDrop={handleDrop}
              draggable={true}>
              <PageButton>
                <span id={page.id}>{page.name || defaultPageName}</span>
                <DropdownMenu.ItemIndicator>
                  <SmallIcon>
                    <CheckIcon />
                  </SmallIcon>
                </DropdownMenu.ItemIndicator>
              </PageButton>
            </DropdownMenu.RadioItem>
            <PageOptionsDialog page={page} onClose={onClose} />
          </ButtonWithOptions>
        ))}
      </DropdownMenu.RadioGroup>
      <Divider />
      <DropdownMenu.Item onSelect={handleCreatePage} asChild>
        <RowButton>
          <span>
            <FormattedMessage id="create.page" />
          </span>
          <SmallIcon>
            <PlusIcon />
          </SmallIcon>
        </RowButton>
      </DropdownMenu.Item>
    </>
  );
}

const ButtonWithOptions = styled('div', {
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gridAutoFlow: 'column',
  margin: 0,

  '& > *[data-shy="true"]': {
    opacity: 0,
  },

  '&:hover > *[data-shy="true"]': {
    opacity: 1,
  },

  variants: {
    isDropAbove: {
      true: {
        '&::after': {
          content: '',
          display: 'block',
          position: 'absolute',
          top: 0,
          width: '100%',
          height: '1px',
          backgroundColor: '$selected',
          zIndex: 999,
          pointerEvents: 'none',
        },
      },
    },
    isDropBelow: {
      true: {
        '&::after': {
          content: '',
          display: 'block',
          position: 'absolute',
          width: '100%',
          height: '1px',
          top: '100%',
          backgroundColor: '$selected',
          zIndex: 999,
          pointerEvents: 'none',
        },
      },
    },
  },
});

export const PageButton = styled(RowButton, {
  minWidth: 128,
});
