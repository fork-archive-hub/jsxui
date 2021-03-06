import * as React from 'react'
import create from 'zustand'
import debounce from 'lodash.debounce'

import { Overrides, OverridesProps } from './Overrides'
import { Spacer } from './Spacer'
import { Stack } from './Stack'
import { Text } from './Text'
import { Variants } from './Variants'

const useEditorStore = create((set) => ({
  activeComponent: null,
  setActiveComponent: (id) => set({ activeComponent: id }),
}))
const useEditor = (props, variantActive) => {
  const activeComponent = useEditorStore((state) => state.activeComponent)
  const setActiveComponent = useEditorStore(
    (state) => state.setActiveComponent
  ) as any
  const [hover, setHover] = React.useState(false)
  const active =
    JSON.stringify(activeComponent) === JSON.stringify(props.__jsxuiSource)
  React.useEffect(() => {
    if (variantActive === false) {
      setActiveComponent(null)
      setHover(false)
    }
  }, [variantActive])
  return {
    onMouseOver: (event) => {
      event.stopPropagation()
      setHover(true)
    },
    onMouseOut: () => {
      setHover(false)
    },
    onClick: (event) => {
      event.preventDefault()
      event.stopPropagation()
      setActiveComponent(props.__jsxuiSource)
    },
    style: {
      ...props.style,
      outline: (hover || active) && `3px solid blue`,
      zIndex: hover || active ? 100 : props.style?.zIndex,
    },
  }
}
const useTextEditor = (props, variantActive) => {
  const editorProps = useEditor(props, variantActive)
  return {
    contentEditable: true,
    suppressContentEditableWarning: true,
    // onInput: debounce((event) => {
    //   event.stopPropagation()
    //   fetch('http://localhost:4000/props/update', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       source: props.__jsxuiSource,
    //       value: event.target.innerText,
    //     }),
    //   })
    // }, 120),
    ...editorProps,
  }
}
const useStackEditor = (props, variantActive) => {
  const editorProps = useEditor(props, variantActive)
  return {
    ...editorProps,
  }
}

const overrides: OverridesProps['value'] = [
  [
    Spacer,
    {
      children: ({ size, isMainAxisHorizontal }) => {
        const [hover, setHover] = React.useState(false)
        const [altDown, setAltDown] = React.useState(false)
        const isFractional = typeof size === 'string' && size.includes('fr')
        React.useEffect(() => {
          function handleKeyDown(event) {
            setAltDown(event.key === 'Alt')
          }
          function handleKeyUp() {
            setAltDown(false)
          }
          window.addEventListener('keydown', handleKeyDown)
          window.addEventListener('keyup', handleKeyUp)
          return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
          }
        }, [])
        return (
          <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          >
            {altDown && hover && (
              <svg
                width={isMainAxisHorizontal ? '100%' : isFractional ? 8 : 1}
                height={isMainAxisHorizontal ? (isFractional ? 8 : 1) : '100%'}
                style={{
                  position: 'absolute',
                  [isMainAxisHorizontal ? 'top' : 'left']: `calc(50% - ${
                    isFractional ? 4 : 0.5
                  }px)`,
                  zIndex: 100,
                }}
              >
                {isFractional ? (
                  <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${
                      isMainAxisHorizontal ? 'horizontal' : 'vertical'
                    }Wave)`}
                  />
                ) : (
                  <rect width="100%" height="100%" fill="hotpink" />
                )}
              </svg>
            )}
            {altDown && hover && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  zIndex: 100,
                  backgroundColor: isMainAxisHorizontal
                    ? 'hsla(214, 72%, 56%, 0.5)'
                    : 'hsla(214, 84%, 74%, 0.5)',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'hotpink',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    padding: '2px 4px',
                    whiteSpace: 'nowrap',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    cursor: 'default',
                  }}
                >
                  {size}
                </span>
              </div>
            )}
          </div>
        )
      },
      variants: {
        editor: useEditor,
        xray: {
          background: 'white',
        },
      },
    },
  ],
  [
    Text,
    {
      variants: {
        editor: useTextEditor,
        xray: {
          color: 'black',
        },
      },
    },
  ],
  [
    Stack,
    {
      variants: {
        editor: useStackEditor,
        xray: {
          strokeWeight: 1,
          strokeColor: 'black',
          background: 'white',
        },
      },
    },
  ],
  [
    'path',
    {
      variants: {
        xray: {
          fill: 'url(#diagonalHatch)',
          stroke: 'black',
          strokeWidth: 1,
        },
      },
    },
  ],
]

export function DevTools({ children }) {
  const [editor, setEditor] = React.useState(false)
  const [xray, setXray] = React.useState(false)
  React.useEffect(() => {
    const { setActiveComponent } = useEditorStore.getState() as any
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Escape':
          setActiveComponent(null)
          break
        case 'e':
          setEditor((bool) => !bool)
          break
        case 'x':
          setXray((bool) => !bool)
          break
      }
    })
  }, [])
  return (
    <Overrides value={overrides}>
      <Variants value={{ editor, xray }}>{children}</Variants>
      <svg width="0" height="0" style={{ display: 'block' }}>
        <defs>
          <pattern
            id="horizontalWave"
            width="8"
            height="8"
            y="2"
            patternUnits="userSpaceOnUse"
          >
            <polyline
              points="0,0 4,4 8,0"
              fill="none"
              stroke="hotpink"
              strokeWidth="1"
            />
          </pattern>
          <pattern
            id="verticalWave"
            width="8"
            height="8"
            x="2"
            patternUnits="userSpaceOnUse"
          >
            <polyline
              points="0,0 4,4 0,8"
              fill="none"
              stroke="hotpink"
              strokeWidth="1"
            />
          </pattern>
          <pattern
            id="diagonalHatch"
            width="6"
            height="10"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              style={{ stroke: 'black', strokeWidth: 2 }}
            />
          </pattern>
        </defs>
      </svg>
    </Overrides>
  )
}
