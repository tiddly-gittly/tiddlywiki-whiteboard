import * as React from 'react';
import { TDLanguage, getTranslation } from '@tldr/translations';

export function useTranslation(locale?: TDLanguage) {
  return React.useMemo(() => {
    return getTranslation(locale ?? navigator.language.split(/[_-]/)[0]);
  }, [locale]);
}
