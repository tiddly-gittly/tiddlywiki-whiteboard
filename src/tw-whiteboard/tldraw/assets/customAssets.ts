/* eslint-disable unicorn/prevent-abbreviations */
export function getCustomIcons(fn: (item: string) => string) {
  return {
    transcludify: fn('$:/core/images/transcludify'),
  };
}
