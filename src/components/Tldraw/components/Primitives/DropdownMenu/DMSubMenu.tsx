import { Arrow, Sub, SubContent, SubTrigger } from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import { MenuContent } from '@tldr/components/Primitives/MenuContent';
import { RowButton } from '@tldr/components/Primitives/RowButton';

export interface DMSubMenuProps {
  children: React.ReactNode;
  disabled?: boolean;
  id?: string;
  label: string;
  overflow?: boolean;
  size?: 'small';
}

export function DMSubMenu({ children, size, overflow = false, disabled = false, label, id }: DMSubMenuProps) {
  return (
    <Sub key={id}>
      <SubTrigger dir="ltr" asChild>
        <RowButton disabled={disabled} hasArrow>
          {label}
        </RowButton>
      </SubTrigger>
      <SubContent asChild sideOffset={4} alignOffset={-4}>
        <MenuContent size={size} overflow={overflow}>
          {children}
          <Arrow offset={13} />
        </MenuContent>
      </SubContent>
    </Sub>
  );
}
