import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-[#DFE1E6] bg-[#FAFBFC] px-3 py-2 text-sm shadow-sm placeholder:text-[#9E9E9E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0079BF]/20 focus-visible:border-[#0079BF] disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
