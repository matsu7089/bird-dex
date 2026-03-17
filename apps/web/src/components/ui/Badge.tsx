interface BadgeProps {
  count: number;
}

export function Badge(props: BadgeProps) {
  return (
    <span class="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
      {props.count}枚
    </span>
  );
}
