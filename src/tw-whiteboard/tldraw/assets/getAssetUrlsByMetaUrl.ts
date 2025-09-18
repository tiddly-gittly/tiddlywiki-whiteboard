/* eslint-disable unicorn/prevent-abbreviations */
// Copied from tldraw's packages/assets/urls.js
// Modify this to wrap asset path directly with fn

import { getCustomIcons } from './customAssets';

export function getAssetUrlsByMetaUrl(fn: (item: string) => string) {
  return {
    fonts: {
      tldraw_mono_bold: fn('fonts/IBMPlexMono-Bold.woff2'),
      tldraw_mono_italic_bold: fn('fonts/IBMPlexMono-BoldItalic.woff2'),
      tldraw_mono: fn('fonts/IBMPlexMono-Medium.woff2'),
      tldraw_mono_italic: fn('fonts/IBMPlexMono-MediumItalic.woff2'),
      tldraw_sans_bold: fn('fonts/IBMPlexSans-Bold.woff2'),
      tldraw_sans_italic_bold: fn('fonts/IBMPlexSans-BoldItalic.woff2'),
      tldraw_sans: fn('fonts/IBMPlexSans-Medium.woff2'),
      tldraw_sans_italic: fn('fonts/IBMPlexSans-MediumItalic.woff2'),
      tldraw_serif_bold: fn('fonts/IBMPlexSerif-Bold.woff2'),
      tldraw_serif_italic_bold: fn('fonts/IBMPlexSerif-BoldItalic.woff2'),
      tldraw_serif: fn('fonts/IBMPlexSerif-Medium.woff2'),
      tldraw_serif_italic: fn('fonts/IBMPlexSerif-MediumItalic.woff2'),
      tldraw_draw_bold: fn('fonts/Shantell_Sans-Informal_Bold.woff2'),
      tldraw_draw_italic_bold: fn('fonts/Shantell_Sans-Informal_Bold_Italic.woff2'),
      tldraw_draw: fn('fonts/Shantell_Sans-Informal_Regular.woff2'),
      tldraw_draw_italic: fn('fonts/Shantell_Sans-Informal_Regular_Italic.woff2'),
    },
    icons: {
      ...getCustomIcons(fn),
      // Use merged icon sprite naming like upstream (component consuming might append '#id')
      '0_merged': fn('icons/icon/0_merged.svg'),
    },
    translations: {
      // Keep a small set for TW use; upstream provides many locales
      languages: fn('translations/languages.json'),
      main: fn('translations/main.json'),
      'zh-cn': fn('translations/zh-cn.json'),
    },
    embedIcons: {
      codepen: fn('embed-icons/codepen.png'),
      codesandbox: fn('embed-icons/codesandbox.png'),
      excalidraw: fn('embed-icons/excalidraw.png'),
      felt: fn('embed-icons/felt.png'),
      figma: fn('embed-icons/figma.png'),
      github_gist: fn('embed-icons/github_gist.png'),
      google_calendar: fn('embed-icons/google_calendar.png'),
      google_maps: fn('embed-icons/google_maps.png'),
      google_slides: fn('embed-icons/google_slides.png'),
      observable: fn('embed-icons/observable.png'),
      replit: fn('embed-icons/replit.png'),
      scratch: fn('embed-icons/scratch.png'),
      spotify: fn('embed-icons/spotify.png'),
      tldraw: fn('embed-icons/tldraw.png'),
      val_town: fn('embed-icons/val_town.png'),
      vimeo: fn('embed-icons/vimeo.png'),
      youtube: fn('embed-icons/youtube.png'),
    },
  };
}
