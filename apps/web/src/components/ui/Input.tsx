import type { JSX } from 'solid-js';
import { cn } from '~/lib/utils';

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input(props: InputProps) {
  const { label, error, class: className, id, ...rest } = props;
  return (
    <div class="flex flex-col gap-1">
      {label && (
        <label for={id as string} class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        id={id as string}
        {...rest}
        class={cn(
          'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
          error && 'border-red-500',
          className,
        )}
      />
      {error && <p class="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea(props: TextareaProps) {
  const { label, error, class: className, id, ...rest } = props;
  return (
    <div class="flex flex-col gap-1">
      {label && (
        <label for={id as string} class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        id={id as string}
        {...rest}
        class={cn(
          'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
          error && 'border-red-500',
          className,
        )}
      />
      {error && <p class="text-xs text-red-600">{error}</p>}
    </div>
  );
}
