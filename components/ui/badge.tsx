import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-teal-100 text-teal-700 hover:bg-teal-200',
        secondary:
          'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200',
        destructive:
          'border-transparent bg-rose-100 text-rose-700 hover:bg-rose-200',
        outline: 'text-gray-700 border-gray-300',
        success:
          'border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
        warning:
          'border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200',
        info:
          'border-transparent bg-sky-100 text-sky-700 hover:bg-sky-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
