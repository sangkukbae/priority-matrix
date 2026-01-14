import { useMemo, useState } from 'react'
import { Plus, Pencil, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Label } from '@/types/task'
import { useTaskStore } from '@/store/taskStore'

interface LabelPickerProps {
  value: string[]
  onChange: (labels: string[]) => void
  className?: string
}

export function LabelPicker({ value, onChange, className }: LabelPickerProps) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const labels = useTaskStore((state) => state.labels)
  const updateLabel = useTaskStore((state) => state.updateLabel)
  const getLabelById = useTaskStore((state) => state.getLabelById)

  const selectedLabels = useMemo<Label[]>(
    () => value.map((id) => getLabelById(id)).filter(Boolean) as Label[],
    [value, getLabelById],
  )

  const toggleLabel = (id: string) => {
    const exists = value.includes(id)
    onChange(exists ? value.filter((v) => v !== id) : [...value, id])
  }

  const startEdit = (label: Label) => {
    setEditingId(label.id)
    setEditingName(label.name)
  }

  const saveEdit = () => {
    if (editingId !== null) {
      updateLabel(editingId, { name: editingName })
    }
    setEditingId(null)
    setEditingName('')
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {selectedLabels.map((label) => {
          const hasName = label.name.trim().length > 0
          return hasName ? (
            <span
              key={label.id}
              className="inline-flex h-8 items-center justify-center px-3 text-xs font-medium rounded-md text-white shadow-sm"
              style={{ backgroundColor: label.color || '#5BA4CF' }}
            >
              {label.name}
            </span>
          ) : (
            <span
              key={label.id}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md shadow-sm text-transparent"
              style={{ backgroundColor: label.color || '#5BA4CF' }}
            >
              ·
            </span>
          )
        })}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput placeholder="레이블 검색..." />
              <CommandList>
                <CommandEmpty>레이블이 없습니다.</CommandEmpty>
                <CommandGroup>
                  {labels.map((label) => {
                    const checked = value.includes(label.id)
                    const isEditing = editingId === label.id
                    return (
                      <CommandItem
                        key={label.id}
                        value={label.name || label.id}
                        onSelect={() => toggleLabel(label.id)}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleLabel(label.id)}
                          aria-label={`${label.name || '레이블'} 선택`}
                        />
                        <span
                          className="inline-block h-4 w-4 rounded"
                          style={{ backgroundColor: label.color || '#5BA4CF' }}
                        />
                        {isEditing ? (
                          <div className="flex items-center gap-1 w-full">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                saveEdit()
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm text-[#172B4D]">
                              {label.name || '이름 없음'}
                            </span>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEdit(label)
                              }}
                              aria-label="레이블 이름 편집"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default LabelPicker
