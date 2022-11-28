import { Trigger } from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import { ToolButton, ToolButtonProps } from '@tldr/components/Primitives/ToolButton';

interface DMTriggerIconProps extends ToolButtonProps {
  children: React.ReactNode;
  id?: string;
}

export function DMTriggerIcon({ id, children, ...rest }: DMTriggerIconProps) {
  return (
    <Trigger asChild id={id}>
      <ToolButton {...rest}>{children}</ToolButton>
    </Trigger>
  );
}
