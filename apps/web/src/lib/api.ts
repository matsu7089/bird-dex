// In dev, VITE_API_URL is not set — requests go through the Vite dev server proxy.
// In production, VITE_API_URL points to the deployed API origin.
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string; error?: string })?.message ?? (body as { error?: string })?.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  // Do NOT set Content-Type — browser sets it automatically with the correct boundary
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (res.status === 401) {
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string; error?: string })?.message ?? (body as { error?: string })?.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
