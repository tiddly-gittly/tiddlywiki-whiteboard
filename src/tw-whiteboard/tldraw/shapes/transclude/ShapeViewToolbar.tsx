/* eslint-disable unicorn/no-null */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useMemo } from 'react';
import { lingo } from 'src/tw-whiteboard/utils/lingo';
import { renderSVGTiddler } from 'src/tw-whiteboard/utils/renderSVGTiddler';
import { useOpenInStory } from 'src/tw-whiteboard/utils/useOpenInStory';
import { TranscludeShape } from './type';

export function ShapeViewToolbar({ shape, onToggleFold }: { onToggleFold: () => void; shape: TranscludeShape }) {
  const foldIcon = useMemo(() => renderSVGTiddler('$:/core/images/fold-button'), []);
  const foldText = useMemo(() => $tw.wiki.getTiddlerText('$:/language/Buttons/Fold/Caption'), []);
  const unfoldIcon = useMemo(() => renderSVGTiddler('$:/core/images/unfold-button'), []);
  const unfoldText = useMemo(() => $tw.wiki.getTiddlerText('$:/language/Buttons/Unfold/Caption'), []);
  // TODO: change to default layout icon
  const openInStoryIcon = useMemo(() => renderSVGTiddler('$:/core/images/open-window'), []);
  const openInStoryText = useMemo(() => lingo('OpenInDefault'), []);
  const onOpenInStory = useOpenInStory(shape.props.title);

  if (!shape.props.title) {
    return null;
  }

  return (
    <div className='shape-view-toolbar-container'>
      <button dangerouslySetInnerHTML={{ __html: shape.props.folded ? unfoldIcon : foldIcon }} onClick={onToggleFold} title={shape.props.folded ? unfoldText : foldText} />
      <button dangerouslySetInnerHTML={{ __html: openInStoryIcon }} onClick={onOpenInStory} title={openInStoryText} />
    </div>
  );
}
