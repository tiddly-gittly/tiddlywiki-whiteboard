import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as React from 'react';
import { FormattedMessage, useIntl } from '@tldr/translations/FormattedMessage';
import { DialogState, useDialog } from '@tldr/hooks';
import { styled } from '@tldr/styles';

interface ContentProps {
  children: React.ReactNode;
  container: any;
  onClose?: () => void;
}

function Content({ children, onClose, container }: ContentProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape': {
        onClose?.();
        break;
      }
    }
  };
  return (
    <AlertDialogPrimitive.Portal container={container}>
      <StyledOverlay />
      <StyledContent onKeyDown={handleKeyDown}>{children}</StyledContent>
    </AlertDialogPrimitive.Portal>
  );
}

const StyledDescription = styled(AlertDialogPrimitive.Description, {
  marginBottom: 20,
  color: '$text',
  fontSize: '$2',
  lineHeight: 1.5,
  textAlign: 'center',
  maxWidth: '62%',
  minWidth: 0,
  alignSelf: 'center',
});

export const AlertDialogRoot = AlertDialogPrimitive.Root;
export const AlertDialogContent = Content;
export const AlertDialogDescription = StyledDescription;
export const AlertDialogAction = AlertDialogPrimitive.Action;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;

export const AlertDialog = ({ container }: { container: any }) => {
  const { setDialogState, dialogState, onCancel, onNo, onYes } = useDialog();
  const intl = useIntl();
  const descriptions: Record<DialogState, string> = {
    saveFirstTime: intl.formatMessage({ id: 'dialog.save.firsttime' }),
    saveAgain: intl.formatMessage({ id: 'dialog.save.again' }),
  };

  return (
    <AlertDialogRoot open={dialogState !== null}>
      <AlertDialogContent onClose={() => setDialogState(null)} container={container}>
        {dialogState && <AlertDialogDescription>{descriptions[dialogState]}</AlertDialogDescription>}
        <div
          style={{
            width: '100%',
            gap: '$6',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
          {onCancel != undefined && (
            <AlertDialogCancel asChild>
              <Button
                css={{ color: '$text' }}
                onClick={() => {
                  onCancel();
                  setDialogState(null);
                }}>
                <FormattedMessage id="dialog.cancel" />
              </Button>
            </AlertDialogCancel>
          )}
          <div style={{ flexShrink: 0 }}>
            {onNo != undefined && (
              <AlertDialogAction asChild>
                <Button
                  onClick={() => {
                    onNo();
                    setDialogState(null);
                  }}>
                  <FormattedMessage id="dialog.no" />
                </Button>
              </AlertDialogAction>
            )}
            {onYes != undefined && (
              <AlertDialogAction asChild>
                <Button
                  css={{ backgroundColor: '#2F80ED', color: 'White' }}
                  onClick={() => {
                    onYes();
                    setDialogState(null);
                  }}>
                  <FormattedMessage id="dialog.yes" />
                </Button>
              </AlertDialogAction>
            )}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
};

const StyledOverlay = styled(AlertDialogPrimitive.Overlay, {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, .15)',
  pointerEvents: 'all',
});

export const StyledDialogOverlay = styled(AlertDialogPrimitive.Overlay, {
  backgroundColor: 'rgba(0, 0, 0, .15)',
  position: 'absolute',
  pointerEvents: 'all',
  inset: 0,
});

const StyledContent = styled(AlertDialogPrimitive.Content, {
  position: 'fixed',
  font: '$ui',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'max-content',
  padding: '$3',
  pointerEvents: 'all',
  backgroundColor: '$panel',
  borderRadius: '$3',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  fontFamily: '$ui',
  border: '1px solid $panelContrast',
  boxShadow: '$panel',
});

export const Button = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$2',
  padding: '0 15px',
  fontSize: '$1',
  lineHeight: 1,
  fontWeight: 'normal',
  height: 36,
  color: '$text',
  cursor: 'pointer',
  minWidth: 48,
});
