import { ExternalLinkIcon } from '@radix-ui/react-icons'
import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { Divider } from '@tldr/components/Primitives/Divider'
import { DMCheckboxItem, DMContent, DMItem } from '@tldr/components/Primitives/DropdownMenu'
import { SmallIcon } from '@tldr/components/Primitives/SmallIcon'
import { useTldrawApp } from '@tldr/hooks'
import { TDLanguage, TRANSLATIONS } from '@tldr/translations'
import { TDSnapshot } from '@tldr/types'

const languageSelector = (s: TDSnapshot) => s.settings.language

export const LanguageMenu = () => {
  const app = useTldrawApp()
  const language = app.useStore(languageSelector)

  const handleChangeLanguage = React.useCallback(
    (locale: TDLanguage) => {
      app.setSetting('language', locale)
    },
    [app]
  )

  return (
    <DMContent variant="menu" overflow id="language-menu" side="left" sideOffset={8}>
      {TRANSLATIONS.map(({ locale, label }) => (
        <DMCheckboxItem
          key={locale}
          checked={language === locale}
          onCheckedChange={() => handleChangeLanguage(locale)}
          id={`TD-MenuItem-Language-${locale}`}
        >
          {label}
        </DMCheckboxItem>
      ))}
      <Divider />
      <a
        href="https://github.com/tldraw/tldraw/blob/main/guides/translation.md"
        target="_blank"
        rel="nofollow"
      >
        <DMItem id="TD-MenuItem-Translation-Link">
          <FormattedMessage id="translation.link" />
          <SmallIcon>
            <ExternalLinkIcon />
          </SmallIcon>
        </DMItem>
      </a>
    </DMContent>
  )
}
