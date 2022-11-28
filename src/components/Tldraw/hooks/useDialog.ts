import * as React from 'react';

export type DialogState = 'saveFirstTime' | 'saveAgain';

interface AlertDialogProps {
  dialogState: DialogState | null;
  onCancel: (() => void) | null;
  onNo: (() => void) | null;
  onYes: (() => void) | null;
  openDialog: (dialogState: DialogState, onYes: () => void, onNo: () => void, onCancel: () => void) => void;
  setDialogState: (dialogState: DialogState | null) => void;
}

export const AlertDialogContext = React.createContext<AlertDialogProps>({} as AlertDialogProps);

export const useDialog = () => {
  const context = React.useContext(AlertDialogContext);
  if (!context) throw new Error('useCtx must be inside a Provider with a value');
  return context;
};
