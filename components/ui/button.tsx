'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#1E3A5F] text-white hover:bg-[#162d4a] focus-visible:ring-[#1E3A5F]',
  secondary:
    'border border-[#1E3A5F] text-[#1E3A5F] bg-transparent hover:bg-[#f0f4f8] focus-visible:ring-[#1E3A5F]',
  ghost:
    'text-[#6B7280] bg-transparent hover:bg-[#f0f4f8] focus-visible:ring-[#6B7280]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', isLoading = false, className = '', children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
)

Button.displayName = 'Button'
