"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle, FontFamily, FontSize } from "@tiptap/extension-text-style"
import Link from "@tiptap/extension-link"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Link as LinkIcon,
  Type,
  ChevronDown,
} from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const FONT_FAMILIES = [
  { label: "기본값", value: "inherit" },
  { label: "고딕", value: "sans-serif" },
  { label: "명조", value: "serif" },
  { label: "고정폭", value: "monospace" },
]

const FONT_SIZES = [
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
]

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
  title,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded transition-all duration-200 flex items-center justify-center",
        "hover:bg-[#DFE1E6]",
        isActive ? "bg-[#DFE1E6] text-[#0079BF]" : "text-[#5E6C84]",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
        "w-8 h-8"
      )}
    >
      {children}
    </button>
  )
}

function ToolbarSelect({
  value,
  options,
  onChange,
  icon: Icon,
}: {
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
  icon?: React.ComponentType<{ className?: string }>
}) {
  const [open, setOpen] = useState(false)

  const currentLabel = options.find((opt) => opt.value === value)?.label || options[0]?.label || ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-8 px-2 rounded flex items-center gap-1 transition-all duration-200",
            "hover:bg-[#DFE1E6] text-[#5E6C84]",
            "text-sm min-w-[60px] justify-between",
            "focus:outline-none focus:ring-2 focus:ring-[#0079BF]/20"
          )}
        >
          {Icon && <Icon className="w-4 h-4" />}
          <span className="truncate">{currentLabel}</span>
          <ChevronDown className="w-3 h-3 ml-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-white border border-[#DFE1E6] rounded-lg shadow-trello-card p-1"
        align="start"
      >
        <div className="flex flex-col gap-0.5">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn(
                "px-3 py-1.5 text-sm rounded text-left transition-colors",
                "hover:bg-[#F4F5F7]",
                value === option.value && "bg-[#E6F0FF] text-[#0079BF]",
                "text-[#172B4D]"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)

  const setLink = useCallback(() => {
    if (!editor) return
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setShowLinkInput(false)
    setLinkUrl("")
  }, [editor, linkUrl])

  if (!editor) return null

  const currentFontFamily = editor.getAttributes("textStyle").fontFamily || "inherit"
  const currentFontSize = editor.getAttributes("textStyle").fontSize || "16px"

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-[#DFE1E6] bg-[#FAFBFC] rounded-t">
      <ToolbarSelect
        icon={Type}
        value={currentFontFamily}
        options={FONT_FAMILIES}
        onChange={(value) => editor.chain().focus().setFontFamily(value).run()}
      />

      <ToolbarSelect
        value={currentFontSize}
        options={FONT_SIZES}
        onChange={(value) => editor.chain().focus().setFontSize(value).run()}
      />

      <div className="w-px h-6 bg-[#DFE1E6] mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="굵게 (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="기울임 (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="취소선"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="코드"
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-[#DFE1E6] mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="글머리 기호 목록"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="번호 목록"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-[#DFE1E6] mx-1" />

      <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="링크"
            className={cn(
              "p-2 rounded transition-all duration-200 flex items-center justify-center",
              "hover:bg-[#DFE1E6]",
              editor.isActive("link") ? "bg-[#DFE1E6] text-[#0079BF]" : "text-[#5E6C84]",
              "w-8 h-8"
            )}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="bg-white border border-[#DFE1E6] rounded-lg shadow-trello-card p-3"
          align="start"
          style={{ width: "280px" }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#172B4D]">링크 URL</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className={cn(
                "w-full px-3 py-2 text-sm",
                "bg-[#FAFBFC] border border-[#DFE1E6] rounded",
                "text-[#172B4D] placeholder:text-[#9E9E9E]",
                "focus:bg-white focus:border-[#0079BF] focus:ring-2 focus:ring-[#0079BF]/20 focus:outline-none"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  setLink()
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={setLink}
                className="flex-1 bg-[#0079BF] hover:bg-[#026AA7] text-white"
              >
                적용
              </Button>
              {editor.isActive("link") && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    editor.chain().focus().unsetLink().run()
                    setShowLinkInput(false)
                    setLinkUrl("")
                  }}
                  className="flex-1"
                >
                  제거
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "작업에 대한 상세 설명...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      FontSize,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#0079BF] underline cursor-pointer hover:text-[#026AA7]",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2 text-sm text-[#172B4D]",
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  return (
    <div
      className={cn(
        "trello-rich-text-editor",
        "w-full border border-[#DFE1E6] rounded overflow-hidden transition-all duration-200",
        "focus-within:border-[#0079BF] focus-within:ring-2 focus-within:ring-[#0079BF]/20",
        className
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        placeholder={placeholder}
        className="bg-[#FAFBFC] text-[#172B4D] placeholder:text-[#9E9E9E]"
      />
    </div>
  )
}
