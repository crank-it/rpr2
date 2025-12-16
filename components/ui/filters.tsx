'use client'

import { useState, useRef, useEffect } from 'react'
import { Filter, X } from 'lucide-react'

interface FilterOption {
  label: string
  value: string
}

interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'date'
  options?: FilterOption[]
}

interface FiltersProps {
  filters: FilterConfig[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onClear: () => void
}

export function Filters({ filters, values, onChange, onClear }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeFilterCount = Object.values(values).filter(v => v).length

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors relative"
      >
        <Filter className="h-4 w-4" />
        Filter
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  onClear()
                  setIsOpen(false)
                }}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  {filter.label}
                </label>
                {filter.type === 'select' ? (
                  <select
                    value={values[filter.key] || ''}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    className="w-full border-0 border-b border-border bg-transparent py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="">All</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'date' ? (
                  <input
                    type="date"
                    value={values[filter.key] || ''}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    className="w-full border-0 border-b border-border bg-transparent py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border flex items-center justify-between">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
