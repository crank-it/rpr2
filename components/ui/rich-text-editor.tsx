'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  className?: string
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = 'Start typing...',
  required,
  error,
  className
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder
      })
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] px-3 py-2'
      }
    }
  })

  if (!editor) {
    return null
  }

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className={cn(
        'rounded-xl border border-input bg-background transition-all duration-200',
        editor.isFocused && 'ring-2 ring-primary/20 border-primary',
        error && 'border-destructive'
      )}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-2 py-2 border-b border-input">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              'p-1.5 rounded hover:bg-muted transition-colors',
              editor.isActive('bold') && 'bg-muted text-primary'
            )}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              'p-1.5 rounded hover:bg-muted transition-colors',
              editor.isActive('italic') && 'bg-muted text-primary'
            )}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              'p-1.5 rounded hover:bg-muted transition-colors',
              editor.isActive('bulletList') && 'bg-muted text-primary'
            )}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              'p-1.5 rounded hover:bg-muted transition-colors',
              editor.isActive('orderedList') && 'bg-muted text-primary'
            )}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} className="text-sm text-foreground" />
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
