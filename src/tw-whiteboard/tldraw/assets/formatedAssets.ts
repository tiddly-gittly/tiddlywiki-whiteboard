/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { getAssetUrlsByMetaUrl } from './getAssetUrlsByMetaUrl';

export const assetUrls = getAssetUrlsByMetaUrl((assetUrl: string) => {
  let assetData = $tw.wiki.getTiddler(`$:/plugins/linonetwo/tw-whiteboard/assets/${assetUrl}`);
  let needRender = false;
  if (assetData === undefined) {
    const assetDataFromFullTitle = $tw.wiki.getTiddler(assetUrl);
    if (assetDataFromFullTitle) {
      assetData = assetDataFromFullTitle;
      // render it to prevent containing wikitext
      needRender = true;
    }
  }
  if (assetData) {
    // default to svg, to support using image from tiddlywiki
    const contentType = assetData.fields.type ?? 'image/svg+xml'
    const encoding = $tw.config.contentTypeInfo[contentType]?.encoding ?? 'utf8';
    const text = needRender ? $tw.wiki.renderTiddler('text/html', assetData.fields.title).replace('<p>', '').replace('</p>', '').replace('fill-rule="evenodd"', 'fill-rule="evenodd" fill="black"') : assetData.fields.text;
    if (needRender) {
      // DEBUG: console text
      console.log(`text`, text);
    }
    // https://github.com/tldraw/tldraw/issues/1941
    // data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' fill='none'%3E%3Cpath stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 5H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6M19 5h6m0 0v6m0-6L13 17'/%3E%3C/svg%3E
    return `data:${contentType};${encoding},${encodeURIComponent(text)}`;
  }
  // <div class="tlui-icon tlui-icon__small" style="mask: url(&quot;https://unpkg.com/@tldraw/assets@2.0.0-alpha.12/icons/icon/duplicate.svg&quot;) center 100% / 100% no-repeat;"></div>
  return `https://unpkg.com/@tldraw/assets@2.0.2/${assetUrl}`;
});
