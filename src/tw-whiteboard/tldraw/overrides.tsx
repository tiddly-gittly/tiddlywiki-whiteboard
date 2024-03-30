/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { DefaultKeyboardShortcutsDialog, DefaultKeyboardShortcutsDialogContent, TLComponents, TldrawUiMenuItem, TLUiOverrides, toolbarItem, useTools } from '@tldraw/tldraw';
import type { IAppProps } from '../components/App';
import { NoteTool } from './shapes/note/tool';
import { TranscludeTool } from './shapes/transclude/tool';

// There's a guide at the bottom of this file!

export const getOverrides = (props: IAppProps): TLUiOverrides => ({
  tools(editor, tools) {
    tools.transclude = {
      id: TranscludeTool.id,
      label: 'tool.transclude',
      readonlyOk: false,
      icon: 'transcludify',
      kbd: '{',
      onSelect(_source) {
        editor.setCurrentTool(TranscludeTool.id);
      },
    };
    tools.note = {
      id: NoteTool.id,
      label: 'tool.note',
      readonlyOk: false,
      icon: 'tool-note',
      kbd: 'n',
      onSelect(_source) {
        editor.setCurrentTool(NoteTool.id);
      },
    };
    tools['whiteboard.layout'] = {
      id: 'whiteboard.layout',
      label: 'tool.openInLayout',
      readonlyOk: true,
      icon: 'whiteboard.layout',
      kbd: 'l',
      onSelect(_source) {
        if (props.currentTiddler) {
          $tw.wiki.setText('$:/state/Whiteboard/PageLayout/focusedTiddler', 'text', undefined, props.currentTiddler);
          $tw.wiki.setText('$:/layout', 'text', undefined, '$:/plugins/linonetwo/tw-whiteboard/tiddlywiki-ui/PageLayout/WhiteBoard');
        }
      },
    };
    return tools;
  },
  toolbar(app, toolbar, { tools }) {
    toolbar.splice(6, 0, toolbarItem(tools[TranscludeTool.id]));
    if (props.currentTiddler) {
      toolbar.splice(10, 0, toolbarItem(tools['whiteboard.layout']));
    }
    return toolbar;
  },
  translations: {
    'zh-cn': {
      'tool.transclude': $tw.wiki.getTiddlerText('$:/language/Buttons/Transcludify/Caption') ?? '',
      'tool.openInLayout': $tw.wiki.getTiddlerText('$:/plugins/linonetwo/tw-whiteboard/language/zh-Hans/OpenInLayout') ?? '',
    },
    en: {
      'tool.transclude': $tw.wiki.getTiddlerText('$:/language/Buttons/Transcludify/Caption') ?? '',
      'tool.openInLayout': $tw.wiki.getTiddlerText('$:/plugins/linonetwo/tw-whiteboard/language/en-GB/OpenInLayout') ?? '',
    },
  },
});

export const components: TLComponents = {
  KeyboardShortcutsDialog: (props) => {
    const tools = useTools();
    return (
      <DefaultKeyboardShortcutsDialog {...props}>
        <DefaultKeyboardShortcutsDialogContent />
        {/* Ideally, we'd interleave this into the tools group */}
        <TldrawUiMenuItem {...tools[TranscludeTool.id]} />
      </DefaultKeyboardShortcutsDialog>
    );
  },
};

/*

This file contains overrides for the Tldraw UI. These overrides are used to add your custom tools
to the toolbar and the keyboard shortcuts menu.

We do this by providing a custom toolbar override to the Tldraw component. This override is a
function that takes the current editor, the default toolbar items, and the default tools.
It returns the new toolbar items. We use the toolbarItem helper to create a new toolbar item
for our custom tool. We then splice it into the toolbar items array at the 4th index. This puts
it after the eraser tool. We'll pass our overrides object into the Tldraw component's `overrides`
prop.


*/
