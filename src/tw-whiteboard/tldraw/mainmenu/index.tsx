import { DefaultMainMenu, DefaultMainMenuContent, TldrawUiMenuGroup, TldrawUiMenuItem } from '@tldraw/tldraw';
import { lingo } from 'src/tw-whiteboard/utils/lingo';

export function CustomMainMenu() {
  const isInLayout = $tw.wiki.getTiddlerText('$:/layout') === '$:/plugins/linonetwo/tw-whiteboard/tiddlywiki-ui/PageLayout/WhiteBoard';
  return (
    <DefaultMainMenu>
      <TldrawUiMenuGroup id='example'>
        {isInLayout && (
          <TldrawUiMenuItem
            id='SwitchBoardTiddler'
            label={lingo('SwitchBoardTiddler')}
            icon='whiteboard.layout'
            readonlyOk
            onSelect={() => {
              $tw.rootWidget.dispatchEvent({ type: 'tm-modal', param: '$:/plugins/linonetwo/tw-whiteboard/tiddlywiki-ui/PageLayout/SwitchBoardModal' });
            }}
          />
        )}
      </TldrawUiMenuGroup>
      <DefaultMainMenuContent />
    </DefaultMainMenu>
  );
}
