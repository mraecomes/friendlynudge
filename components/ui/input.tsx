import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-[#374151]">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-[#111827] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent ${error ? 'border-[#DC2626]' : 'border-[#E5E7EB]'} ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[#6B7280]">{hint}</p>}
        {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
