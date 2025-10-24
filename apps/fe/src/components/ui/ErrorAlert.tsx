interface ErrorAlertProps {
  message: string;
  className?: string;
}

export default function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className={`bg-[var(--color-error)]/10 rounded-lg px-3 py-2 text-[var(--color-error)] text-sm ${className}`}>
      {message}
    </div>
  );
}
