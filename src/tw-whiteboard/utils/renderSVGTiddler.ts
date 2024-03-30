export function renderSVGTiddler(title: string): string {
  let text = $tw.wiki.renderTiddler('text/html', title).replace('<p>', '').replace('</p>', '');
  if (!text.includes('xmlns')) {
    text = text.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return text;
}
