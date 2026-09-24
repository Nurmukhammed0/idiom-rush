export function Logo({ size = 32, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="16" fill="#635BFF" />
        <path d="M14 18C14 14.6863 16.6863 12 20 12H44C47.3137 12 50 14.6863 50 18V36C50 39.3137 47.3137 42 44 42H28L18 50V42H20C16.6863 42 14 39.3137 14 36V18Z" fill="white" />
        <path d="M35 18L24 32H31L29 46L42 28H34L35 18Z" fill="#635BFF" />
      </svg>
      {withText && <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--color-text)' }}>Idiom Rush</span>}
    </div>
  );
}
