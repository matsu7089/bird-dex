import { cn } from "~/lib/utils";

export function Spinner(props: { class?: string }) {
  return (
    <div
      class={cn(
        "h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600",
        props.class,
      )}
    />
  );
}
