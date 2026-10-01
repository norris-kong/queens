interface IconProps {
  readonly className?: string
}

export function QueenIcon({ className = '' }: IconProps) {
  return (
    <svg className={`cell-icon queen ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 8.6 7.6 12.4 12 5.2l4.4 7.2L21 8.6 19.2 17H4.8Z" />
      <circle cx="3" cy="7.6" r="1.6" fill="currentColor" />
      <circle cx="12" cy="4.2" r="1.7" fill="currentColor" />
      <circle cx="21" cy="7.6" r="1.6" fill="currentColor" />
      <rect x="4.8" y="18.3" width="14.4" height="2.4" rx="1.1" fill="currentColor" />
    </svg>
  )
}

export function MarkIcon() {
  return (
    <svg className="cell-icon mark" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M1.5 1.5 8.5 8.5M8.5 1.5 1.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
