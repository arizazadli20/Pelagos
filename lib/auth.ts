// ============================================================
// SeaSeatry Authentication
// ============================================================
// Mock client-side auth for the current phase.
// Replace `login` / `register` / `logout` bodies with real
// backend calls (e.g. Spring Boot JWT / session cookies) later.
// Keep the exported function signatures stable for UI pages.
// ============================================================

export const AUTH_STORAGE_KEY = "seaseatry-auth";
export const USER_STORAGE_KEY = "seaseatry-user";
export const AUTH_COOKIE_NAME = "seaseatry-auth";

export type AuthUser = {
  name: string;
  email: string;
};

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function writeCookie(authenticated: boolean, remember: boolean) {
  if (typeof document === "undefined") return;
  if (authenticated) {
    const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
    document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Ensure cookie matches localStorage (migrates older sessions). */
export function syncAuthCookie(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(AUTH_STORAGE_KEY) === "true") {
    writeCookie(true, true);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function getCurrentUser(): AuthUser | null {
  if (!isAuthenticated()) return null;
  return (
    readStoredUser() ?? {
      name: "Operator",
      email: "operator@seaseatry.az",
    }
  );
}

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return "Email is required.";
  // Practical client-side check — not a security boundary.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

/**
 * Mock login. Replace with: POST /api/auth/login
 */
export async function login(
  email: string,
  password: string,
  remember = false
): Promise<AuthResult> {
  const emailError = validateEmail(email);
  if (emailError) return { ok: false, error: emailError };

  const passwordError = validatePassword(password);
  if (passwordError) return { ok: false, error: passwordError };

  await delay(700);

  const existing = readStoredUser();
  const user: AuthUser = {
    name: existing?.email === email.trim() ? existing.name : email.trim().split("@")[0],
    email: email.trim(),
  };

  localStorage.setItem(AUTH_STORAGE_KEY, "true");
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  writeCookie(true, remember);

  return { ok: true, user };
}

/**
 * Mock register. Replace with: POST /api/auth/register
 */
export async function register(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<AuthResult> {
  if (!fullName.trim()) {
    return { ok: false, error: "Full name is required." };
  }

  const emailError = validateEmail(email);
  if (emailError) return { ok: false, error: emailError };

  const passwordError = validatePassword(password);
  if (passwordError) return { ok: false, error: passwordError };

  if (password !== confirmPassword) {
    return { ok: false, error: "Passwords do not match." };
  }

  await delay(800);

  const user: AuthUser = {
    name: fullName.trim(),
    email: email.trim(),
  };

  localStorage.setItem(AUTH_STORAGE_KEY, "true");
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  writeCookie(true, true);

  return { ok: true, user };
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  writeCookie(false, false);
}
