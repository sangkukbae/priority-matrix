"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#172B4D] group-[.toaster]:border-[#DFE1E6]",
          actionButton: "group-[.toast]:bg-[#0079BF] group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
