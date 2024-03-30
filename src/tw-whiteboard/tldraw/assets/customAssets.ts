/* eslint-disable unicorn/prevent-abbreviations */
export function getCustomIcons(fn: (item: string) => string) {
  return {
    transcludify: fn('$:/core/images/transcludify'),
    'whiteboard.layout': fn('$:/plugins/linonetwo/tw-whiteboard/tiddlywiki-ui/PageLayout/whiteboard-icon'),
  };
}
