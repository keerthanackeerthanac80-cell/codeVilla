// ============================================
// FIREBASE AUTH SERVICE — FLYING AI LEARNING VILLA
// Handles registration, login, logout, session
// ============================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDB, isFirebaseConfigured } from './firebase';
import type { FirestoreUser, Gender, Degree, UserRole } from './firestore-types';

// ---- Register with Firebase ----
export async function registerWithFirebase(
  email: string,
  password: string,
  displayName: string,
  additionalData?: {
    gender?: Gender;
    phoneNumber?: string;
    dateOfBirth?: string;
    country?: string;
    state?: string;
    city?: string;
    currentDegree?: Degree;
    collegeOrCompany?: string;
    yearOfStudy?: string;
  }
): Promise<{ success: boolean; user?: FirestoreUser; error?: string }> {
  if (!isFirebaseConfigured()) {
    return { success: false, error: 'Firebase is not configured. Check .env.local' };
  }

  try {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();

    // Create Firebase Auth user
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    // Update display name in Auth profile
    await updateProfile(credential.user, { displayName });

    const avatarInitials = displayName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const now = new Date().toISOString();

    // Create Firestore user document
    const userData: FirestoreUser = {
      uid,
      fullName: displayName,
      email: email.trim().toLowerCase(),
      displayName,
      avatarInitials,
      gender: additionalData?.gender,
      phoneNumber: additionalData?.phoneNumber,
      dateOfBirth: additionalData?.dateOfBirth,
      country: additionalData?.country,
      state: additionalData?.state,
      city: additionalData?.city,
      currentDegree: additionalData?.currentDegree,
      collegeOrCompany: additionalData?.collegeOrCompany,
      yearOfStudy: additionalData?.yearOfStudy,
      accountStatus: 'active',
      role: 'student',
      registrationDate: now,
      lastLogin: now,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'Users', uid), userData);

    return { success: true, user: userData };
  } catch (err: any) {
    let errorMessage = 'Registration failed.';
    if (err.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (err.code === 'auth/weak-password') {
      errorMessage = 'Password must be at least 6 characters.';
    } else if (err.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }
    return { success: false, error: errorMessage };
  }
}

// ---- Login with Firebase ----
export async function loginWithFirebase(
  email: string,
  password: string
): Promise<{ success: boolean; user?: FirestoreUser; error?: string }> {
  if (!isFirebaseConfigured()) {
    return { success: false, error: 'Firebase is not configured. Check .env.local' };
  }

  try {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();

    const credential = await signInWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    // Fetch user doc from Firestore
    const userDoc = await getDoc(doc(db, 'Users', uid));

    if (!userDoc.exists()) {
      return { success: false, error: 'User profile not found.' };
    }

    const userData = userDoc.data() as FirestoreUser;

    // Update last login
    await updateDoc(doc(db, 'Users', uid), {
      lastLogin: new Date().toISOString(),
      accountStatus: 'active',
      updatedAt: new Date().toISOString(),
    });

    return { success: true, user: { ...userData, lastLogin: new Date().toISOString() } };
  } catch (err: any) {
    let errorMessage = 'Login failed.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password.';
    } else if (err.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (err.code === 'auth/too-many-requests') {
      errorMessage = 'Too many attempts. Please try again later.';
    }
    return { success: false, error: errorMessage };
  }
}

// ---- Logout ----
export async function logoutFirebase(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const auth = getFirebaseAuth();
    await signOut(auth);
  } catch {
    // Silently fail
  }
}

// ---- Get Current Auth User ----
export function getCurrentAuthUser(): User | null {
  if (!isFirebaseConfigured()) return null;
  const auth = getFirebaseAuth();
  return auth.currentUser;
}

// ---- Listen to Auth State ----
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

// ---- Get User Role ----
export async function getUserRole(uid: string): Promise<UserRole> {
  if (!isFirebaseConfigured()) return 'student';
  try {
    const db = getFirebaseDB();
    const userDoc = await getDoc(doc(db, 'Users', uid));
    if (userDoc.exists()) {
      return (userDoc.data() as FirestoreUser).role || 'student';
    }
  } catch {
    // Fall through
  }
  return 'student';
}

// ---- Get User Profile ----
export async function getUserProfile(uid: string): Promise<FirestoreUser | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const db = getFirebaseDB();
    const userDoc = await getDoc(doc(db, 'Users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as FirestoreUser;
    }
  } catch {
    // Fall through
  }
  return null;
}

// ---- Update User Profile ----
export async function updateUserProfile(
  uid: string,
  data: Partial<FirestoreUser>
): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  try {
    const db = getFirebaseDB();
    await updateDoc(doc(db, 'Users', uid), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch {
    return false;
  }
}
