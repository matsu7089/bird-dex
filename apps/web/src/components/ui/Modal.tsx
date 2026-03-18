import { Show, type JSX } from "solid-js";
import { Portal } from "solid-js/web";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: JSX.Element;
}

export function Modal(props: ModalProps) {
  return (
    <Show when={props.open}>
      <Portal>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) props.onClose();
          }}
        >
          <div class="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800">
            <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{props.title}</h2>
              <button
                onClick={props.onClose}
                class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-4">{props.children}</div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
