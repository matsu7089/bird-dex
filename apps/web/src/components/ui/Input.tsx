import { splitProps } from 'solid-js';
import type { JSX } from 'solid-js';
import { cn } from '~/lib/utils';

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input(props: InputProps) {
  const [local, rest] = splitProps(props, ['label', 'error', 'class', 'id']);
  return (
    <div class="flex flex-col gap-1">
      {local.label && (
        <label for={local.id as string} class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {local.label}
        </label>
      )}
      <input
        id={local.id as string}
        {...rest}
        class={cn(
          'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
          local.error && 'border-red-500',
          local.class,
        )}
      />
      {local.error && <p class="text-xs text-red-600">{local.error}</p>}
    </div>
  );
}

interface TextareaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea(props: TextareaProps) {
  const [local, rest] = splitProps(props, ['label', 'error', 'class', 'id']);
  return (
    <div class="flex flex-col gap-1">
      {local.label && (
        <label for={local.id as string} class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {local.label}
        </label>
      )}
      <textarea
        id={local.id as string}
        {...rest}
        class={cn(
          'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
          local.error && 'border-red-500',
          local.class,
        )}
      />
      {local.error && <p class="text-xs text-red-600">{local.error}</p>}
    </div>
  );
}
