'use client'

import { useState, useRef, useEffect, useId } from 'react'
import type { Task } from '@/types'

interface DependencyComboboxProps {
  tasks: Task[]          // All tasks in the timeline (current task excluded by caller)
  value: string | null   // Currently selected predecessor task ID, or null for none
  onChange: (taskId: string | null) => void
  onClose: () => void
  disabled?: boolean
}

export function DependencyCombobox({
  tasks,
  value,
  onChange,
  onClose,
  disabled,
}: DependencyComboboxProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  const noneOption = { id: null, name: 'None — no dependency' }

  const filtered = [
    noneOption,
    ...tasks.filter((t) =>
      t.name.toLowerCase().includes(query.toLowerCase())
    ),
  ]

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Scroll active item into view
  useEffect(() => {
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  function select(id: string | null) {
    onChange(id)
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[activeIndex]
      if (item) select(item.id)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'Tab') {
      onClose()
    }
  }

  return (
    <div className="relative w-36 flex-shrink-0">
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded="true"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={`${listboxId}-${activeIndex}`}
        className="w-full px-2 py-1 text-sm border border-[#2563EB] rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white text-[#111827]"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setActiveIndex(0) }}
        onKeyDown={handleKeyDown}
        placeholder="Search tasks…"
        disabled={disabled}
      />

      <ul
        id={listboxId}
        ref={listRef}
        role="listbox"
        className="absolute z-50 top-full left-0 mt-1 w-52 max-h-48 overflow-y-auto bg-white border border-[#E5E7EB] rounded-lg shadow-md py-1 text-sm"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-2 text-[#9CA3AF]">No tasks match</li>
        ) : (
          filtered.map((item, i) => (
            <li
              key={item.id ?? '__none__'}
              id={`${listboxId}-${i}`}
              role="option"
              aria-selected={value === item.id}
              onMouseDown={(e) => {
                e.preventDefault() // prevent input blur before select fires
                select(item.id)
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`px-3 py-2 cursor-pointer truncate transition-colors ${
                i === activeIndex
                  ? 'bg-[#EFF6FF] text-[#1E3A5F]'
                  : value === item.id
                  ? 'bg-gray-50 text-[#111827]'
                  : 'text-[#374151] hover:bg-gray-50'
              }`}
            >
              {item.id === null ? (
                <span className="text-[#9CA3AF] italic">{item.name}</span>
              ) : (
                item.name
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
