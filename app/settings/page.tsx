'use client'

import { useState, useEffect } from 'react'
import { Plus, Sun, Moon, Trash2 } from 'lucide-react'
import { FieldBuilderModal } from '@/components/settings/FieldBuilderModal'
import { AddCategoryModal } from '@/components/settings/AddCategoryModal'
import { DeleteCategoryModal } from '@/components/settings/DeleteCategoryModal'
import { useTheme } from '@/components/ThemeProvider'

interface Category {
  id: string
  name: string
  description: string | null
  color: string
  createdAt: string
  updatedAt: string
  projectCount?: number
}

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isFieldBuilderOpen, setIsFieldBuilderOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const response = await fetch('/api/project-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const openFieldBuilder = (category: Category) => {
    setSelectedCategory(category)
    setIsFieldBuilderOpen(true)
  }

  const closeFieldBuilder = () => {
    setIsFieldBuilderOpen(false)
    setSelectedCategory(null)
    fetchCategories() // Refresh to get updated fields
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    const response = await fetch(`/api/project-categories/${categoryToDelete.id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete category')
    }

    fetchCategories()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-normal text-foreground tracking-tight mb-3">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your workspace
          </p>
        </div>

        {/* Project Categories Section */}
        <div className="mb-20">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-8">
            Project Categories
          </h2>

          {loadingCategories ? (
            <div className="text-center py-16">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-foreground border-r-transparent"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-8">
                No categories yet
              </p>
              <button
                onClick={() => setIsAddCategoryOpen(true)}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create your first category
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {categories.map((category, index) => (
                <div key={category.id} className="group">
                  <div className="flex items-center">
                    <button
                      onClick={() => openFieldBuilder(category)}
                      className="flex-1 py-6 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-baseline justify-between gap-8">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <h3 className="text-base font-medium text-foreground">
                              {category.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {category.description && (
                              <>
                                <span>{category.description}</span>
                                <span>·</span>
                              </>
                            )}
                            <span>
                              {category.projectCount || 0} {category.projectCount === 1 ? 'project' : 'projects'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(category)}
                      className="p-3 mr-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4 hover:text-[lab(55.4814%_75.0732_48.8528)]" />
                    </button>
                  </div>
                  {index < categories.length - 1 && (
                    <div className="h-px bg-border" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* General Settings Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-8">
            General
          </h2>
          <div className="space-y-0">
            <div className="py-6">
              <div className="flex items-baseline justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-foreground mb-1">
                    Workspace Name
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    RPR Flow
                  </p>
                </div>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="py-6">
              <div className="flex items-center justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-foreground mb-1">
                    Theme
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred appearance
                  </p>
                </div>
                <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/50">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-background text-foreground shadow-soft-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      theme === 'dark'
                        ? 'bg-background text-foreground shadow-soft-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating action button */}
        <button
          onClick={() => setIsAddCategoryOpen(true)}
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft-lg hover:shadow-soft-xl transition-all hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Field Builder Modal */}
        {selectedCategory && (
          <FieldBuilderModal
            isOpen={isFieldBuilderOpen}
            onClose={closeFieldBuilder}
            categoryId={selectedCategory.id}
            categoryName={selectedCategory.name}
          />
        )}

        {/* Add Category Modal */}
        <AddCategoryModal
          isOpen={isAddCategoryOpen}
          onClose={() => setIsAddCategoryOpen(false)}
          onSuccess={fetchCategories}
        />

        {/* Delete Category Modal */}
        {categoryToDelete && (
          <DeleteCategoryModal
            isOpen={!!categoryToDelete}
            onClose={() => setCategoryToDelete(null)}
            onConfirm={handleDeleteCategory}
            categoryName={categoryToDelete.name}
            projectCount={categoryToDelete.projectCount || 0}
          />
        )}
      </div>
    </div>
  )
}
