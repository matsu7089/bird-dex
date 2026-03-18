import { splitProps } from 'solid-js';
import type { JSX } from 'solid-js';
import { cn } from '~/lib/utils';

type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
};

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ['variant', 'size', 'class']);
  return (
    <button
      {...rest}
      class={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors cursor-pointer',
        variants[local.variant ?? 'primary'],
        sizes[local.size ?? 'md'],
        local.class,
      )}
    />
  );
}
