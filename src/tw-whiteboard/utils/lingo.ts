const LINGO_BASE = '$:/plugins/linonetwo/tw-whiteboard/language/';
export function lingo(key: string): string {
  const rendered = $tw.wiki.renderText('text/plain', 'text/vnd.tiddlywiki', `\\import [[$:/core/macros/lingo]]\n\n<<lingo ${key} ${LINGO_BASE}>>`);
  return rendered;
}
