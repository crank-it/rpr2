'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  label?: string
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  required?: boolean
  error?: string
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select items...',
  className,
  required,
  error
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedLabels = value
    .map(v => options.find(o => o.value === v)?.label)
    .filter(Boolean)

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== optionValue))
  }

  return (
    <div className={cn('w-full relative', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          'flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground transition-all duration-200 min-h-[42px] cursor-pointer flex-wrap gap-1.5 items-center',
          error && 'border-destructive focus:ring-destructive/20',
          isOpen && 'ring-2 ring-primary/20 border-primary'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedLabels.length > 0 ? (
          selectedLabels.map((label, index) => (
            <span
              key={value[index]}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-sm"
            >
              {label}
              <button
                type="button"
                onClick={(e) => removeOption(value[index], e)}
                className="hover:text-primary/80"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}

        <svg
          className={cn('w-4 h-4 ml-auto flex-shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 max-h-60 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-input rounded-lg focus:outline-none focus:border-primary"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={cn(
                    'px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-muted',
                    value.includes(option.value) && 'bg-primary/10'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleOption(option.value)
                  }}
                >
                  <div className={cn(
                    'w-4 h-4 border rounded flex items-center justify-center',
                    value.includes(option.value)
                      ? 'bg-primary border-primary'
                      : 'border-input'
                  )}>
                    {value.includes(option.value) && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-foreground">{option.label}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">No options found</div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
