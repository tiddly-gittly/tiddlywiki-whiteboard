import { CheckboxItem } from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import { RowButton, RowButtonProps } from '@tldr/components/Primitives/RowButton';
import { preventEvent } from '@tldr/components/preventEvent';

interface DMCheckboxItemProps {
  checked: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  id?: string;
  kbd?: string;
  onCheckedChange: (isChecked: boolean) => void;
  variant?: RowButtonProps['variant'];
}

export function DMCheckboxItem({ checked, disabled = false, variant, onCheckedChange, kbd, id, children }: DMCheckboxItemProps) {
  return (
    <CheckboxItem dir="ltr" onSelect={preventEvent} onCheckedChange={onCheckedChange} checked={checked} disabled={disabled} asChild id={id}>
      <RowButton kbd={kbd} variant={variant} hasIndicator>
        {children}
      </RowButton>
    </CheckboxItem>
  );
}
