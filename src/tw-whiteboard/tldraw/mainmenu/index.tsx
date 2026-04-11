import { DefaultMainMenu, DefaultMainMenuContent, TldrawUiMenuGroup, TldrawUiMenuItem } from '@tldraw/tldraw';
import { useContext, useMemo } from 'react';
import { PropsContext } from 'src/tw-whiteboard/utils/context';
import { lingo } from 'src/tw-whiteboard/utils/lingo';
import { useOpenInStory } from 'src/tw-whiteboard/utils/useOpenInStory';

const SIDEBAR_STATE_TIDDLER = '$:/state/Whiteboard/PageLayout/sidebarOpen';
const SIDEBAR_MODE_TIDDLER = '$:/state/Whiteboard/PageLayout/sidebarMode';

function openSidebar(mode: 'switch' | 'create') {
  if (mode === 'create') {
    // Initialize the draft tiddler with a default title so EditTemplate/title can work
    const defaultTitle = $tw.wiki.getTiddlerText('$:/language/DefaultNewTiddlerTitle') ?? 'New Tiddler';
    $tw.wiki.addTiddler({ title: '$:/state/Whiteboard/PageLayout/create-tiddler', 'draft.title': defaultTitle, 'draft.of': '' });
  }
  $tw.wiki.setText(SIDEBAR_MODE_TIDDLER, 'text', undefined, mode);
  $tw.wiki.setText(SIDEBAR_STATE_TIDDLER, 'text', undefined, 'yes');
}

export function CustomMainMenu() {
  const isInLayout = $tw.wiki.getTiddlerText('$:/layout') === '$:/plugins/linonetwo/tw-whiteboard/tiddlywiki-ui/PageLayout/WhiteBoard';
  const createTiddlerText = useMemo(() => $tw.wiki.getTiddlerText('$:/language/Buttons/NewTiddler/Caption'), []);
  const props = useContext(PropsContext);
  const onOpenInStory = useOpenInStory(props?.currentTiddler);
  const backToDefaultLayout = useOpenInStory();

  const MenuGroup: any = TldrawUiMenuGroup;
  const MenuItem: any = TldrawUiMenuItem;

    return (
      <DefaultMainMenu>
        <MenuGroup id='example'>
          {!isInLayout && props?.currentTiddler && (
            <MenuItem
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
            <MenuItem
              id='SwitchBoardTiddler'
              label={lingo('SwitchBoardTiddler')}
              icon='whiteboard.layout'
              readonlyOk
              onSelect={() => {
                openSidebar('switch');
              }}
            />
            <MenuItem
              id='NewTiddler'
              label={createTiddlerText}
              readonlyOk
              onSelect={() => {
                openSidebar('create');
              }}
            />
            <MenuItem
              id='BackToDefaultLayout'
              label={lingo('BackToDefaultLayout')}
              readonlyOk
              onSelect={backToDefaultLayout}
            />
            <MenuItem
              id='OpenInDefault'
              label={lingo('OpenInDefault')}
              readonlyOk
              onSelect={onOpenInStory}
            />
          </>
        )}
      </MenuGroup>
      <DefaultMainMenuContent />
    </DefaultMainMenu>
  );
}
