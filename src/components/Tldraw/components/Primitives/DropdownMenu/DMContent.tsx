import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import { MenuContent } from '@tldr/components/Primitives/MenuContent';
import { stopPropagation } from '@tldr/components/stopPropagation';
import { useContainer } from '@tldr/hooks';
import { styled } from '@tldr/styles/stitches.config';

export interface DMContentProps {
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  children: React.ReactNode;
  id?: string;
  overflow?: boolean;
  side?: 'top' | 'left' | 'right' | 'bottom' | undefined;
  sideOffset?: number;
  variant?: 'menu' | 'horizontal';
}

export function DMContent({ sideOffset = 4, alignOffset = 0, children, align, variant, id, overflow = false, side = 'bottom' }: DMContentProps) {
  const container = useContainer();

  return (
    <DropdownMenu.Portal container={container.current} dir="ltr">
      <DropdownMenu.Content align={align} alignOffset={alignOffset} sideOffset={sideOffset} onEscapeKeyDown={stopPropagation} asChild id={id} side={side}>
        <StyledContent variant={variant} overflow={overflow}>
          {children}
        </StyledContent>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}

export const StyledContent = styled(MenuContent, {
  width: 'fit-content',
  height: 'fit-content',
  minWidth: 0,
  maxHeight: '100vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  '&::webkit-scrollbar': {
    display: 'none',
  },
  '-ms-overflow-style': 'none' /* for Internet Explorer, Edge */,
  scrollbarWidth: 'none',
  variants: {
    variant: {
      horizontal: {
        flexDirection: 'row',
      },
      menu: {
        minWidth: 128,
      },
    },
    overflow: {
      true: {
        maxHeight: '60vh',
      },
    },
  },
});
