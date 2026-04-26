export type AdminUser = {
  id: number;
  name: string;
  email: string;
};

export type AdminSession = {
  token: string;
  user: AdminUser;
};

export type AdminLoginResponse = {
  data: AdminSession;
};

const ADMIN_SESSION_KEY = "catalog_admin_session";

export function readAdminSession(): AdminSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(ADMIN_SESSION_KEY);

  if (!value) {
    return null;
  }

  try {
    const session = JSON.parse(value) as Partial<AdminSession>;

    if (typeof session.token === "string" && session.user?.email) {
      return session as AdminSession;
    }
  } catch {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  return null;
}

export function writeAdminSession(session: AdminSession): void {
  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession(): void {
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}
