/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { DefaultMainMenu, DefaultMainMenuContent, TldrawUiMenuGroup, TldrawUiMenuItem } from '@tldraw/tldraw';
import { useContext, useMemo } from 'react';
import { PropsContext } from 'src/tw-whiteboard/utils/context';
import { lingo } from 'src/tw-whiteboard/utils/lingo';
import { useOpenInStory } from 'src/tw-whiteboard/utils/useOpenInStory';

export function CustomMainMenu() {
  const isInLayout = $tw.wiki.getTiddlerText('$:/layout') === '$:/plugins/linonetwo/tw-whiteboard/tiddlywiki-ui/PageLayout/WhiteBoard';
  const createTiddlerText = useMemo(() => $tw.wiki.getTiddlerText('$:/language/Buttons/NewTiddler/Caption'), []);
  const props = useContext(PropsContext);
  const onOpenInStory = useOpenInStory(props?.currentTiddler);
  const backToDefaultLayout = useOpenInStory();

  return (
    <DefaultMainMenu>
      <TldrawUiMenuGroup id='example'>
        {!isInLayout && props?.currentTiddler && (
          <TldrawUiMenuItem
            id='openInLayout'
            label='tool.openInLayout'
            icon='whiteboard.layout'
            readonlyOk
            onSelect={() => {
              if (props?.currentTiddler) {
                $tw.wiki.setText('$:/state/Whiteboard/PageLayout/focusedTiddler', 'text', undefined, props.currentTiddler);
                $tw.wiki.setText('$:/layout', 'text', undefined, '$:/plugins/linonetwo/tw-whiteboard/tiddlywiki-ui/PageLayout/WhiteBoard');
              }
            }}
          />
        )}
        {isInLayout && (
          <>
            <TldrawUiMenuItem
              id='SwitchBoardTiddler'
              label={lingo('SwitchBoardTiddler')}
              icon='whiteboard.layout'
              readonlyOk
              onSelect={() => {
                $tw.rootWidget.dispatchEvent({ type: 'tm-modal', param: '$:/plugins/linonetwo/tw-whiteboard/tiddlywiki-ui/PageLayout/SwitchBoardModal' });
              }}
            />
            <TldrawUiMenuItem
              id='NewTiddler'
              label={createTiddlerText}
              readonlyOk
              onSelect={() => {
                $tw.wiki.addTiddler({ title: '$:/state/Whiteboard/PageLayout/create-tiddler', 'draft.title': $tw.wiki.getTiddlerText('$:/language/DefaultNewTiddlerTitle') });
                $tw.rootWidget.dispatchEvent({ type: 'tm-modal', param: '$:/plugins/linonetwo/tw-whiteboard/tiddlywiki-ui/PageLayout/CreateNewTiddlerModal' });
              }}
            />
            <TldrawUiMenuItem
              id='BackToDefaultLayout'
              label={lingo('BackToDefaultLayout')}
              readonlyOk
              onSelect={backToDefaultLayout}
            />
            <TldrawUiMenuItem
              id='OpenInDefault'
              label={lingo('OpenInDefault')}
              readonlyOk
              onSelect={onOpenInStory}
            />
          </>
        )}
      </TldrawUiMenuGroup>
      <DefaultMainMenuContent />
    </DefaultMainMenu>
  );
}
