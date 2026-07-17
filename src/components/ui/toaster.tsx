"use client"

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react"
import type React from "react"

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
})

const ChakraToasterWithChildren = ChakraToaster as React.ComponentType<
  {
    toaster: typeof toaster
    insetInline?: unknown
    children: (toast: any) => React.ReactNode
  }
>
const ToastTitle = Toast.Title as React.ComponentType<React.PropsWithChildren>
const ToastDescription =
  Toast.Description as React.ComponentType<React.PropsWithChildren>
const ToastActionTrigger =
  Toast.ActionTrigger as React.ComponentType<React.PropsWithChildren>

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToasterWithChildren toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Toast.Root width={{ md: "sm" }}>
            {toast.type === "loading" ? (
              <Spinner size="sm" color="blue.solid" />
            ) : (
              <Toast.Indicator />
            )}
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </Stack>
            {toast.action && (
              <ToastActionTrigger>{toast.action.label}</ToastActionTrigger>
            )}
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToasterWithChildren>
    </Portal>
  )
}
