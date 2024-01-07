import { menuItem, TLUiMenuGroup, TLUiOverrides, toolbarItem } from '@tldraw/tldraw';
import { WikiTextShapeTool } from './shapes/wikitext/WikiTextShapeTool';

// There's a guide at the bottom of this file!

export const uiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    // Create a tool item in the ui's context.
    // tools.wikitext = {
    //   id: 'wikitext',
    //   icon: 'color',
    //   label: 'Wikitext',
    //   kbd: 'c',
    //   readonlyOk: false,
    //   onSelect: () => {
    //     editor.setCurrentTool('wikitext');
    //   },
    // };
    tools.wikitext = {
      id: WikiTextShapeTool.id,
      label: 'tool.note',
      readonlyOk: false,
      icon: 'tool-note',
      kbd: 'n',
      onSelect(source) {
        editor.setCurrentTool('wikitext');
        // FIXME: is not a function. Maybe has to be inside a provider, but we can't here
        // trackEvent('select-tool', { source, id: 'note' });
      },
      // type: 'item',
    };
    return tools;
  },
  toolbar(_app, toolbar, { tools }) {
    // remove built-in note that can't render wikitext
    const withoutDefaultNote = toolbar.filter(item => item.id !== 'note');
    // insert wikitext note tool before arrow tool, which is first one of the shapes.
    const arrowToolIndex = withoutDefaultNote.findIndex((item) => item.id === 'arrow');
    const withWikiTextNote: typeof toolbar = [
      ...withoutDefaultNote.slice(0, arrowToolIndex),
      toolbarItem(tools.wikitext),
      ...withoutDefaultNote.slice(arrowToolIndex),
    ];
    return withWikiTextNote;
  },
  keyboardShortcutsMenu(_app, keyboardShortcutsMenu, { tools }) {
    // Add the tool item from the context to the keyboard shortcuts dialog.
    const toolsGroup = keyboardShortcutsMenu.find(
      (group) => group.id === 'shortcuts-dialog.tools',
    ) as TLUiMenuGroup;
    toolsGroup.children.push(menuItem(tools.wikitext));
    return keyboardShortcutsMenu;
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
