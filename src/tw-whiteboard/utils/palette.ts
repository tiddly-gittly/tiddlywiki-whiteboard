const FALLBACK_PALETTE_TITLE = '$:/palettes/Vanilla';
const COLOUR_MACRO_REGEXP = /^<<colour\s+([^>\s]+)\s*>>$/u;

interface IPaletteColors {
  divider: string;
  dropdownBackground: string;
  dropdownBorder: string;
  foreground: string;
  selectionBackground: string;
  selectionForeground: string;
  shadow: string;
  shadowSubtle: string;
}

function parseDictionaryText(dictionaryText: string) {
  return dictionaryText.split(/\r?\n/u).reduce<Record<string, string>>((accumulator, line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      return accumulator;
    }

    const separatorIndex = trimmedLine.indexOf(':');
    if (separatorIndex < 0) {
      return accumulator;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();
    if (!key) {
      return accumulator;
    }

    accumulator[key] = value;
    return accumulator;
  }, {});
}

function getPaletteDictionary(title: string) {
  const paletteText = $tw.wiki.getTiddler(title)?.fields?.text ?? '';
  return parseDictionaryText(paletteText);
}

function resolvePaletteColor(name: string, paletteTitle: string, seen = new Set<string>()): string {
  const cacheKey = `${paletteTitle}:${name}`;
  if (seen.has(cacheKey)) {
    return '';
  }

  seen.add(cacheKey);

  const paletteDictionary = getPaletteDictionary(paletteTitle);
  const fallbackDictionary = paletteTitle === FALLBACK_PALETTE_TITLE ? paletteDictionary : getPaletteDictionary(FALLBACK_PALETTE_TITLE);
  const rawValue = paletteDictionary[name] || fallbackDictionary[name] || '';
  const macroMatch = rawValue.match(COLOUR_MACRO_REGEXP);
  if (macroMatch) {
    return resolvePaletteColor(macroMatch[1], paletteTitle, seen);
  }

  return rawValue;
}

function colorWithAlpha(color: string, alpha: number): string {
  const normalizedColor = color.trim();
  const shortHexMatch = normalizedColor.match(/^#([\da-f]{3})$/iu);
  if (shortHexMatch) {
    const [red, green, blue] = shortHexMatch[1].split('').map((channel) => Number.parseInt(channel.repeat(2), 16));
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  const longHexMatch = normalizedColor.match(/^#([\da-f]{6})$/iu);
  if (longHexMatch) {
    const value = longHexMatch[1];
    const red = Number.parseInt(value.slice(0, 2), 16);
    const green = Number.parseInt(value.slice(2, 4), 16);
    const blue = Number.parseInt(value.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  const rgbMatch = normalizedColor.match(/^rgb\(([^)]+)\)$/iu);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${alpha})`;
  }

  const rgbaMatch = normalizedColor.match(/^rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)$/iu);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${alpha})`;
  }

  return normalizedColor;
}

export function getCurrentPaletteColors(): IPaletteColors {
  const paletteTitle = $tw.wiki.getTiddlerText('$:/palette') ?? FALLBACK_PALETTE_TITLE;
  const foreground = resolvePaletteColor('foreground', paletteTitle) || '#333333';
  const mutedForeground = resolvePaletteColor('muted-foreground', paletteTitle) || foreground;
  const dropdownBackground = resolvePaletteColor('dropdown-background', paletteTitle) ||
    resolvePaletteColor('tiddler-editor-background', paletteTitle) ||
    resolvePaletteColor('background', paletteTitle) ||
    '#ffffff';
  const dropdownBorder = resolvePaletteColor('dropdown-border', paletteTitle) || mutedForeground;
  const selectionBackground = resolvePaletteColor('selection-background', paletteTitle) ||
    resolvePaletteColor('dropdown-tab-background-selected', paletteTitle) ||
    colorWithAlpha(foreground, 0.12);
  const selectionForeground = resolvePaletteColor('selection-foreground', paletteTitle) || foreground;

  return {
    divider: colorWithAlpha(dropdownBorder, 0.28),
    dropdownBackground,
    dropdownBorder,
    foreground,
    selectionBackground,
    selectionForeground,
    shadow: colorWithAlpha(foreground, 0.16),
    shadowSubtle: colorWithAlpha(foreground, 0.06),
  };
}
