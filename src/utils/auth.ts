// ============================================
// LOCAL AUTHENTICATION SYSTEM
// Flying AI Learning Villa
// ============================================

export interface VillaUser {
  id: string;
  email: string;
  displayName: string;
  avatarInitials: string;
  createdAt: string;
}

interface StoredUser {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
}

const USERS_KEY = 'villa_users';
const SESSION_KEY = 'villa_session';

// Simple hash for demo — NOT production-grade crypto
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
}

function generateId(): string {
  return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toVillaUser(stored: StoredUser): VillaUser {
  return {
    id: stored.id,
    email: stored.email,
    displayName: stored.displayName,
    avatarInitials: stored.displayName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    createdAt: stored.createdAt,
  };
}

// ---- Register ----
export function registerUser(
  displayName: string,
  email: string,
  password: string
): { success: boolean; user?: VillaUser; error?: string } {
  const trimmedName = displayName.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: 'Name must be at least 2 characters.' };
  }
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }

  const users = getStoredUsers();
  if (users.some((u) => u.email === trimmedEmail)) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const newUser: StoredUser = {
    id: generateId(),
    email: trimmedEmail,
    displayName: trimmedName,
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveStoredUsers(users);

  const villaUser = toVillaUser(newUser);
  saveSession(villaUser);

  return { success: true, user: villaUser };
}

// ---- Login ----
export function loginUser(
  email: string,
  password: string
): { success: boolean; user?: VillaUser; error?: string } {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) {
    return { success: false, error: 'Please enter your email.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const users = getStoredUsers();
  const found = users.find((u) => u.email === trimmedEmail);

  if (!found) {
    return { success: false, error: 'No account found with this email.' };
  }

  if (found.passwordHash !== simpleHash(password)) {
    return { success: false, error: 'Incorrect password.' };
  }

  const villaUser = toVillaUser(found);
  saveSession(villaUser);

  return { success: true, user: villaUser };
}

// ---- Session ----
function saveSession(user: VillaUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): VillaUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function logout(): void {
  clearSession();
}
