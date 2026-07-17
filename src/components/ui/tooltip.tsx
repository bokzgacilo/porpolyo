import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react"
import * as React from "react"

export interface TooltipProps extends ChakraTooltip.RootProps {
  showArrow?: boolean
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement | null>
  content: React.ReactNode
  contentProps?: ChakraTooltip.ContentProps
  disabled?: boolean
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      portalled = true,
      content,
      contentProps,
      portalRef,
      ...rest
    } = props

    if (disabled) return children

    const TooltipTrigger = ChakraTooltip.Trigger as React.ComponentType<
      React.PropsWithChildren<{ asChild?: boolean }>
    >
    const TooltipPositioner =
      ChakraTooltip.Positioner as React.ComponentType<React.PropsWithChildren>
    const TooltipArrow =
      ChakraTooltip.Arrow as React.ComponentType<React.PropsWithChildren>

    return (
      <ChakraTooltip.Root {...rest}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <Portal disabled={!portalled} container={portalRef}>
          <TooltipPositioner>
            <ChakraTooltip.Content ref={ref} {...contentProps}>
              {showArrow && (
                <TooltipArrow>
                  <ChakraTooltip.ArrowTip />
                </TooltipArrow>
              )}
              {content}
            </ChakraTooltip.Content>
          </TooltipPositioner>
        </Portal>
      </ChakraTooltip.Root>
    )
  },
)
