import * as React from 'react'
import { stopPropagation } from '@tldr/components/stopPropagation'
import { GHOSTED_OPACITY, LETTER_SPACING } from '@tldr/constants'
import { TLDR } from '@tldr/state/TLDR'
import { styled } from '@tldr/styles'
import { TextAreaUtils } from './TextAreaUtils'
import { getTextLabelSize } from './getTextSize'

export interface TextLabelProps {
  font: string
  text: string
  color: string
  onBlur?: () => void
  onChange: (text: string) => void
  offsetY?: number
  offsetX?: number
  scale?: number
  isEditing?: boolean
}

export const TextLabel = React.memo(function TextLabel({
  font,
  text,
  color,
  offsetX = 0,
  offsetY = 0,
  scale = 1,
  isEditing = false,
  onBlur,
  onChange,
}: TextLabelProps) {
  const rInput = React.useRef<HTMLTextAreaElement>(null)
  const rIsMounted = React.useRef(false)

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(TLDR.normalizeText(e.currentTarget.value))
    },
    [onChange]
  )
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onBlur?.()
        return
      }

      if (e.key === 'Tab' && text.length === 0) {
        e.preventDefault()
        return
      }

      if (!(e.key === 'Meta' || e.metaKey)) {
        e.stopPropagation()
      } else if (e.key === 'z' && e.metaKey) {
        if (e.shiftKey) {
          document.execCommand('redo', false)
        } else {
          document.execCommand('undo', false)
        }
        e.stopPropagation()
        e.preventDefault()
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '=') {
        e.preventDefault()
      }

      if (e.key === 'Tab') {
        e.preventDefault()
        if (e.shiftKey) {
          TextAreaUtils.unindent(e.currentTarget)
        } else {
          TextAreaUtils.indent(e.currentTarget)
        }

        onChange?.(TLDR.normalizeText(e.currentTarget.value))
      }
    },
    [onChange]
  )

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      e.currentTarget.setSelectionRange(0, 0)
      onBlur?.()
    },
    [onBlur]
  )

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (!isEditing) return
      if (!rIsMounted.current) return

      if (document.activeElement === e.currentTarget) {
        e.currentTarget.select()
      }
    },
    [isEditing]
  )

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLTextAreaElement | HTMLDivElement>) => {
      if (isEditing) {
        e.stopPropagation()
      }
    },
    [isEditing]
  )

  const rWasEditing = React.useRef(isEditing)

  React.useEffect(() => {
    if (isEditing) {
      rWasEditing.current = true
      requestAnimationFrame(() => {
        rIsMounted.current = true
        const elm = rInput.current
        if (elm) {
          elm.focus()
          elm.select()
        }
      })
    } else if (rWasEditing.current) {
      onBlur?.()
      rWasEditing.current = false
    }
  }, [isEditing, onBlur])

  const rInnerWrapper = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const elm = rInnerWrapper.current
    if (!elm) return
    const size = getTextLabelSize(text, font)
    elm.style.transform = `scale(${scale}, ${scale}) translate(${offsetX}px, ${offsetY}px)`
    elm.style.width = size[0] + 1 + 'px'
    elm.style.height = size[1] + 1 + 'px'
  }, [text, font, offsetY, offsetX, scale])

  return (
    <TextWrapper>
      <InnerWrapper
        ref={rInnerWrapper}
        hasText={!!text}
        isEditing={isEditing}
        style={{
          font,
          color,
        }}
      >
        {isEditing ? (
          <TextArea
            ref={rInput}
            style={{
              font,
              color,
            }}
            name="text"
            tabIndex={-1}
            autoComplete="false"
            autoCapitalize="false"
            autoCorrect="false"
            autoSave="false"
            autoFocus
            placeholder=""
            spellCheck="true"
            wrap="off"
            dir="auto"
            datatype="wysiwyg"
            defaultValue={text}
            color={color}
            onFocus={handleFocus}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onPointerDown={handlePointerDown}
            onContextMenu={stopPropagation}
            onCopy={stopPropagation}
            onPaste={stopPropagation}
            onCut={stopPropagation}
          />
        ) : (
          text
        )}
        &#8203;
      </InnerWrapper>
    </TextWrapper>
  )
})

const TextWrapper = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  userSelect: 'none',
  variants: {
    isGhost: {
      false: { opacity: 1 },
      true: { transition: 'opacity .2s', opacity: GHOSTED_OPACITY },
    },
  },
})

const commonTextWrapping = {
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  letterSpacing: LETTER_SPACING,
}

const InnerWrapper = styled('div', {
  position: 'absolute',
  padding: '4px',
  zIndex: 1,
  minHeight: 1,
  minWidth: 1,
  lineHeight: 1,
  outline: 0,
  fontWeight: '500',
  textAlign: 'center',
  backfaceVisibility: 'hidden',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
  variants: {
    hasText: {
      false: {
        pointerEvents: 'none',
      },
      true: {
        pointerEvents: 'all',
      },
    },
    isEditing: {
      false: {
        userSelect: 'none',
      },
      true: {
        background: '$boundsBg',
        userSelect: 'text',
        WebkitUserSelect: 'text',
      },
    },
  },
  ...commonTextWrapping,
})

const TextArea = styled('textarea', {
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1,
  width: '100%',
  height: '100%',
  border: 'none',
  padding: '4px',
  resize: 'none',
  textAlign: 'inherit',
  minHeight: 'inherit',
  minWidth: 'inherit',
  lineHeight: 'inherit',
  outline: 0,
  fontWeight: 'inherit',
  overflow: 'hidden',
  backfaceVisibility: 'hidden',
  display: 'inline-block',
  pointerEvents: 'all',
  background: '$boundsBg',
  userSelect: 'text',
  WebkitUserSelect: 'text',
  fontSmooth: 'always',
  WebkitFontSmoothing: 'subpixel-antialiased',
  MozOsxFontSmoothing: 'auto',
  ...commonTextWrapping,
  '&:focus': {
    outline: 'none',
    border: 'none',
  },
})
