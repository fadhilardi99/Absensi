"use client";

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  AuthError,
} from "firebase/auth";
import { auth } from "./firebase";

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    let errorMessage = "An error occurred during sign in";

    switch (authError.code) {
      case "auth/invalid-email":
        errorMessage = "Email tidak valid";
        break;
      case "auth/user-disabled":
        errorMessage = "Akun telah dinonaktifkan";
        break;
      case "auth/user-not-found":
        errorMessage = "Email tidak terdaftar";
        break;
      case "auth/wrong-password":
        errorMessage = "Password salah";
        break;
      default:
        errorMessage = authError.message;
    }

    return { user: null, error: errorMessage };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { error: authError.message };
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Middleware untuk API routes
export const requireAuth = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized", status: 401 };
    }
    return { user, error: null };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};
