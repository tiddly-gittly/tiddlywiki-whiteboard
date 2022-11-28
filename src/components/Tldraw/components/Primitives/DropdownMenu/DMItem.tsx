import { Item } from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import { RowButton, RowButtonProps } from '@tldr/components/Primitives/RowButton';

export function DMItem({ onSelect, id, ...rest }: RowButtonProps & { id?: string; onSelect?: (event: Event) => void }) {
  return (
    <Item dir="ltr" asChild onSelect={onSelect} id={id}>
      <RowButton {...rest} />
    </Item>
  );
}
