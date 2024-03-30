import { DefaultKeyboardShortcutsDialog, DefaultKeyboardShortcutsDialogContent, TLComponents, TldrawUiMenuItem, TLUiOverrides, toolbarItem, useTools } from '@tldraw/tldraw';
import { NoteTool } from './shapes/note/tool';
import { TranscludeTool } from './shapes/transclude/tool';

// There's a guide at the bottom of this file!

export const overrides: TLUiOverrides = {
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
    return tools;
  },
  toolbar(_app, toolbar, { tools }) {
    toolbar.splice(6, 0, toolbarItem(tools[TranscludeTool.id]));
    return toolbar;
  },
  translations: {
    'zh-cn': {
      'tool.transclude': '嵌入',
    },
    en: {
      'tool.transclude': 'Transclude',
    },
  },
};

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
