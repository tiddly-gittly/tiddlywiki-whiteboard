import * as RadixTooltip from '@radix-ui/react-tooltip';
import * as React from 'react';
import { Kbd } from '@tldr/components/Primitives/Kbd';
import { styled } from '@tldr/styles';

/* -------------------------------------------------- */
/*                       Tooltip                      */
/* -------------------------------------------------- */

interface TooltipProps {
  children: React.ReactNode;
  id?: string;
  kbd?: string;
  label: string;
  side?: 'bottom' | 'left' | 'right' | 'top';
}

export function Tooltip({ children, label, kbd: kbdProperty, id, side = 'top' }: TooltipProps) {
  return (
    <span id={id}>
      <RadixTooltip.Provider>
        <RadixTooltip.Root>
          <RadixTooltip.Trigger dir="ltr" asChild={true}>
            <span>{children}</span>
          </RadixTooltip.Trigger>
          <StyledContent dir="ltr" side={side} sideOffset={8}>
            {label}
            {kbdProperty ? <Kbd variant="tooltip">{kbdProperty}</Kbd> : null}
            <StyledArrow />
          </StyledContent>
        </RadixTooltip.Root>
      </RadixTooltip.Provider>
    </span>
  );
}

const StyledContent = styled(RadixTooltip.Content, {
  borderRadius: 3,
  padding: '$3 $3 $3 $3',
  fontSize: '$1',
  backgroundColor: '$tooltip',
  color: '$tooltipContrast',
  boxShadow: '$3',
  display: 'flex',
  alignItems: 'center',
  fontFamily: '$ui',
  userSelect: 'none',
});

const StyledArrow = styled(RadixTooltip.Arrow, {
  fill: '$tooltip',
  margin: '0 8px',
});
