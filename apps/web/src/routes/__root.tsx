import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/solid-router";
import { Suspense } from "solid-js";
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

  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Suspense
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
      </Suspense>
    </div>
  );
}
