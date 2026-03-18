import { Button } from "./Button";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination(props: PaginationProps) {
  const totalPages = () => Math.ceil(props.total / props.limit);

  return (
    <div class="flex items-center justify-between gap-4 pt-2">
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {props.total}件中 {(props.page - 1) * props.limit + 1}–
        {Math.min(props.page * props.limit, props.total)}件
      </span>
      <div class="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={props.page <= 1}
          onClick={() => props.onPageChange(props.page - 1)}
        >
          ← 前
        </Button>
        <span class="flex items-center text-sm text-gray-600 dark:text-gray-400">
          {props.page} / {totalPages()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={props.page >= totalPages()}
          onClick={() => props.onPageChange(props.page + 1)}
        >
          次 →
        </Button>
      </div>
    </div>
  );
}
