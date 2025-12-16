'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, GripVertical } from 'lucide-react'

interface CustomFieldDefinition {
  id: string
  name: string
  type: 'text' | 'textarea' | 'url' | 'date' | 'user' | 'number' | 'checkbox' | 'email' | 'dropdown' | 'multiselect'
  options?: string[]
  required: boolean
  sortOrder: number
}

interface FieldBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  categoryName: string
}

export function FieldBuilderModal({ isOpen, onClose, categoryId, categoryName }: FieldBuilderModalProps) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && categoryId) {
      fetchFields()
    }
  }, [isOpen, categoryId])

  const fetchFields = async () => {
    try {
      const response = await fetch(`/api/project-categories/${categoryId}`)
      if (response.ok) {
        const data = await response.json()
        setFields(data.customFields || [])
      }
    } catch (error) {
      console.error('Failed to fetch fields:', error)
    }
  }

  const generateId = () => {
    return 'field-' + Math.random().toString(36).substring(2, 11)
  }

  const addField = () => {
    setFields([...fields, {
      id: generateId(),
      name: '',
      type: 'text',
      options: [],
      required: false,
      sortOrder: fields.length
    }])
  }

  const updateField = (index: number, updates: Partial<CustomFieldDefinition>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const addOption = (fieldIndex: number) => {
    const newFields = [...fields]
    if (!newFields[fieldIndex].options) {
      newFields[fieldIndex].options = []
    }
    newFields[fieldIndex].options!.push('')
    setFields(newFields)
  }

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const newFields = [...fields]
    if (newFields[fieldIndex].options) {
      newFields[fieldIndex].options![optionIndex] = value
      setFields(newFields)
    }
  }

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const newFields = [...fields]
    if (newFields[fieldIndex].options) {
      newFields[fieldIndex].options = newFields[fieldIndex].options!.filter((_, i) => i !== optionIndex)
      setFields(newFields)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Filter out empty fields and clean up options for dropdown/multiselect
      const validFields = fields
        .filter(f => f.name.trim())
        .map(f => {
          const field = { ...f }
          // Only filter options for dropdown/multiselect types
          if (field.type === 'dropdown' || field.type === 'multiselect') {
            field.options = field.options?.filter(o => o.trim()) || []
          } else {
            // Remove options for other field types
            delete field.options
          }
          return field
        })

      const response = await fetch(`/api/project-categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customFields: validFields })
      })

      if (!response.ok) {
        throw new Error('Failed to save fields')
      }

      onClose()
    } catch (error) {
      console.error('Failed to save fields:', error)
      alert('Failed to save fields')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background w-full max-w-4xl mx-4 rounded-lg shadow-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <h2 className="text-2xl font-normal text-foreground">
            Configure {categoryName} Fields
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            {fields.map((field, fieldIndex) => (
              <div key={field.id} className="border border-border rounded-lg p-6 space-y-4 bg-background">
                <div className="flex items-start gap-3">
                  <div className="mt-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 space-y-4">
                    {/* Field Name and Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Field Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Service Type"
                          value={field.name}
                          onChange={(e) => updateField(fieldIndex, { name: e.target.value })}
                          className="w-full border-0 border-b border-border bg-transparent py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Field Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => {
                            const newType = e.target.value as CustomFieldDefinition['type']
                            const updates: Partial<CustomFieldDefinition> = { type: newType }
                            // Initialize options array for dropdown/multiselect
                            if ((newType === 'dropdown' || newType === 'multiselect') && !field.options?.length) {
                              updates.options = ['']
                            }
                            updateField(fieldIndex, updates)
                          }}
                          className="w-full border-0 border-b border-border bg-transparent py-3 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
                        >
                          <option value="text">Text (Single Line)</option>
                          <option value="textarea">Text (Multi-line)</option>
                          <option value="number">Number</option>
                          <option value="email">Email</option>
                          <option value="url">Link/URL</option>
                          <option value="date">Date</option>
                          <option value="user">Person Responsible</option>
                          <option value="checkbox">Checkbox (Yes/No)</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="multiselect">Multi-select</option>
                        </select>
                      </div>
                    </div>

                    {/* Options - Only for dropdown and multiselect */}
                    {(field.type === 'dropdown' || field.type === 'multiselect') && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {field.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <input
                                type="text"
                                placeholder={`Option ${optionIndex + 1}`}
                                value={option}
                                onChange={(e) => updateOption(fieldIndex, optionIndex, e.target.value)}
                                className="flex-1 border-0 border-b border-border bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                              />
                              {field.options && field.options.length > 1 && (
                                <button
                                  onClick={() => removeOption(fieldIndex, optionIndex)}
                                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(fieldIndex)}
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeField(fieldIndex)}
                    className="mt-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addField}
              className="w-full border border-dashed border-border rounded-lg py-6 text-sm text-primary hover:text-primary/80 hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 px-8 py-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? 'Saving...' : 'Save Fields'}
          </button>
        </div>
      </div>
    </div>
  )
}
