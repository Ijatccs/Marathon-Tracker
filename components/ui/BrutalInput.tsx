import { cn } from "@/lib/utils";

interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function BrutalInput({ label, className, id, ...props }: BrutalInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="font-display text-sm font-bold uppercase tracking-wide"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "h-12 border-brutal bg-bg px-4 font-mono text-base focus:outline-none focus:ring-0",
          className
        )}
        {...props}
      />
    </div>
  );
}
