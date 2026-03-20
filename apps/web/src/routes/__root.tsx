import {
  createRootRouteWithContext,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from "@tanstack/solid-router";
import { Show, Suspense, createEffect } from "solid-js";
import type { QueryClient } from "@tanstack/solid-query";
import type { Resource } from "solid-js";
import type { UserDto } from "~/lib/queries";
import { Navbar } from "~/components/layout/Navbar";
import { Spinner } from "~/components/ui/Spinner";

interface RouterContext {
  queryClient: QueryClient;
  auth: Resource<UserDto | null>;
  refetchAuth: () => void;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ context, location }) => {
    // auth() is undefined while loading — skip guard until resolved
    const user = context.auth();
    const isPublic = location.pathname === "/login";
    if (user === undefined) return; // still loading
    if (!isPublic && user === null) throw redirect({ to: "/login" });
    if (isPublic && user !== null) throw redirect({ to: "/" });
  },
  component: RootLayout,
});

function RootLayout() {
  const context = Route.useRouteContext();
  const location = useLocation();
  const navigate = useNavigate();

  // beforeLoad only runs on navigation, not when the resource resolves.
  // Use createEffect to reactively redirect once auth resolves.
  createEffect(() => {
    const user = context().auth();
    if (user === undefined) return; // still loading
    if (user === null && location().pathname !== "/login") {
      navigate({ to: "/login" });
    }
    if (user !== null && location().pathname === "/login") {
      navigate({ to: "/" });
    }
  });

  const authReady = () => {
    const user = context().auth();
    if (user === undefined) return false; // still loading — show spinner
    if (user === null) return location().pathname === "/login"; // unauthed: only render /login
    return true; // authed
  };

  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Suspense
        fallback={
          <div class="flex h-screen items-center justify-center">
            <Spinner class="h-8 w-8" />
          </div>
        }
      >
        <Show
          when={authReady()}
          fallback={
            <div class="flex h-screen items-center justify-center">
              <Spinner class="h-8 w-8" />
            </div>
          }
        >
          <Navbar user={context().auth()} refetchAuth={context().refetchAuth} />
          <main class="mx-auto max-w-5xl px-4 py-6">
            <Outlet />
          </main>
        </Show>
      </Suspense>
    </div>
  );
}
