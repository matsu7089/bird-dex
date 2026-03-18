import { Link, useRouter } from "@tanstack/solid-router";
import type { UserDto } from "~/lib/queries";
import { apiFetch } from "~/lib/api";

interface NavbarProps {
  user: UserDto | null | undefined;
  refetchAuth: () => void;
}

export function Navbar(props: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" });
    props.refetchAuth();
    router.navigate({ to: "/login" });
  }

  return (
    <nav class="sticky top-0 z-40 flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
      <Link to="/" class="text-lg font-bold text-emerald-700 dark:text-emerald-400 no-underline">
        🦅 BirdDex
      </Link>
      <div class="flex gap-4 ml-4">
        <Link
          to="/species"
          class="text-sm text-gray-600 hover:text-emerald-700 dark:text-gray-300 dark:hover:text-emerald-400 no-underline"
          activeProps={{ class: "text-emerald-700 font-semibold dark:text-emerald-400" }}
        >
          図鑑
        </Link>
        <Link
          to="/sightings"
          class="text-sm text-gray-600 hover:text-emerald-700 dark:text-gray-300 dark:hover:text-emerald-400 no-underline"
          activeProps={{ class: "text-emerald-700 font-semibold dark:text-emerald-400" }}
        >
          観察記録
        </Link>
        <Link
          to="/map"
          class="text-sm text-gray-600 hover:text-emerald-700 dark:text-gray-300 dark:hover:text-emerald-400 no-underline"
          activeProps={{ class: "text-emerald-700 font-semibold dark:text-emerald-400" }}
        >
          ヒートマップ
        </Link>
      </div>
      <div class="ml-auto flex items-center gap-3">
        {props.user && (
          <>
            {props.user.avatarUrl && (
              <img
                src={props.user.avatarUrl}
                alt={props.user.username}
                class="h-7 w-7 rounded-full"
              />
            )}
            <span class="text-sm text-gray-600 dark:text-gray-400">{props.user.username}</span>
            <button
              onClick={handleLogout}
              class="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            >
              ログアウト
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
