/* eslint-disable unicorn/no-null */
import useDebouncedCallback from 'beautiful-react-hooks/useDebouncedCallback';
import { useCombobox } from 'downshift';
import { useMemo, useState } from 'react';
import { lingo } from 'src/tw-whiteboard/utils/lingo';

interface IProps {
  editTitleInputReference: React.RefObject<HTMLTextAreaElement>;
  onTitleInputChange: (newValue: string) => void;
  tiddlerTitle?: string;
}

export function TiddlerTitleInput(props: IProps) {
  const [inputItems, setInputItems] = useState<string[]>([]);
  const placeHolderText = useMemo(() => lingo('Tools/Transclude/PlaceHolder'), []);
  const debouncedOnChange = useDebouncedCallback((inputValue: string) => {
    props.onTitleInputChange(inputValue);
    setInputItems(
      $tw.wiki.filterTiddlers(`[!is[system]search:title[${inputValue}]sort[title]limit[250]]`),
    );
  });
  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    defaultInputValue: props.tiddlerTitle,
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      debouncedOnChange(inputValue);
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
      <textarea
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
                backgroundColor: highlightedIndex === index ? '#bde4ff' : undefined,
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
