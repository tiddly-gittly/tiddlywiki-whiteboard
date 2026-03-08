/* eslint-disable unicorn/no-null */
import { useCombobox } from 'downshift';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { lingo } from 'src/tw-whiteboard/utils/lingo';

interface IProps {
  editTitleInputReference: React.RefObject<HTMLInputElement>;
  onTitleInputChange: (newValue: string) => void;
  tiddlerTitle?: string;
}

function getMatchedTitles(inputValue: string) {
  const trimmedInputValue = inputValue.trim();
  if (!trimmedInputValue) {
    return $tw.wiki.filterTiddlers('[!is[system]sort[title]limit[50]]');
  }

  const escapedInputValue = trimmedInputValue.replaceAll(']', '\\]');
  return $tw.wiki.filterTiddlers(`[!is[system]search:title[${escapedInputValue}]sort[title]limit[50]]`);
}

export function TiddlerTitleInput(props: IProps) {
  const [inputValue, setInputValue] = useState(props.tiddlerTitle ?? '');
  const [inputItems, setInputItems] = useState<string[]>(() => getMatchedTitles(props.tiddlerTitle ?? ''));
  const placeHolderText = useMemo(() => lingo('Tools/Transclude/PlaceHolder'), []);
  const updateInputItems = useCallback((nextInputValue: string) => {
    setInputItems(getMatchedTitles(nextInputValue));
  }, []);

  useEffect(() => {
    const nextInputValue = props.tiddlerTitle ?? '';
    setInputValue(nextInputValue);
    updateInputItems(nextInputValue);
  }, [props.tiddlerTitle, updateInputItems]);

  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: inputItems,
    inputValue,
    itemToString: (item) => item ?? '',
    onInputValueChange: ({ inputValue }) => {
      const nextInputValue = inputValue ?? '';
      setInputValue(nextInputValue);
      props.onTitleInputChange(nextInputValue);
      updateInputItems(nextInputValue);
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return;
      setInputValue(selectedItem);
      props.onTitleInputChange(selectedItem);
      updateInputItems(selectedItem);
    },
  });
  return (
    <div
      className='transclude-shape-edit-mode-input-container'
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
    >
      <label {...getLabelProps()}>{placeHolderText}</label>
      <input
        autoFocus
        autoComplete='off'
        spellCheck={false}
        tabIndex={1}
        ref={props.editTitleInputReference}
        {...getInputProps()}
        placeholder={placeHolderText}
      />
      <ul {...getMenuProps()}>
        {isOpen &&
          inputItems.map((item, index) => (
            <li
              key={`${item}${index}`}
              style={{
                backgroundColor: highlightedIndex === index ? 'var(--tw-whiteboard-editor-selected-background)' : undefined,
                color: highlightedIndex === index ? 'var(--tw-whiteboard-editor-selected-foreground)' : 'var(--tw-whiteboard-editor-foreground)',
              }}
              {...getItemProps({
                item,
                index,
              })}
            >
              {item}
            </li>
          ))}
      </ul>
    </div>
  );
}
