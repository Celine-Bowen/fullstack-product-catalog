"use client";

import { useState, type ReactNode } from "react";
import { clearAdminSession, type AdminLoginResponse, type AdminSession, writeAdminSession } from "@/lib/admin-auth";

type AdminAuthPanelProps = {
  apiBase: string;
  session: AdminSession | null;
  onAuthenticated: (session: AdminSession) => void;
  onLogout: () => void;
  children?: ReactNode;
};

type LoginForm = {
  email: string;
  password: string;
};

export function AdminAuthPanel({ apiBase, session, onAuthenticated, onLogout, children }: AdminAuthPanelProps) {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string; errors?: Record<string, string[]> } | null;
        const firstFieldError = body?.errors ? Object.values(body.errors).flat()[0] : undefined;

        throw new Error(firstFieldError ?? body?.message ?? `Login failed with status ${response.status}`);
      }

      const payload = (await response.json()) as AdminLoginResponse;
      writeAdminSession(payload.data);
      setForm({ email: "", password: "" });
      onAuthenticated(payload.data);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function logout() {
    setIsLoggingOut(true);

    try {
      if (session?.token) {
        await fetch(`${apiBase}/auth/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${session.token}`,
          },
        }).catch(() => null);
      }
    } finally {
      clearAdminSession();
      onLogout();
      setIsLoggingOut(false);
    }
  }

  if (!session) {
    return (
      <form onSubmit={submitLogin} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto] md:items-end dark:border-slate-800 dark:bg-slate-900">
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((values) => ({ ...values, email: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            autoComplete="username"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((values) => ({ ...values, password: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            autoComplete="current-password"
            required
          />
        </label>
        <button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        {error ? <p className="text-sm text-red-700 md:col-span-3 dark:text-red-300">{error}</p> : null}
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-sm font-medium text-slate-950 dark:text-slate-50">{session.user.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{session.user.email}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {children}
        <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" type="button" onClick={logout} disabled={isLoggingOut}>
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
}
