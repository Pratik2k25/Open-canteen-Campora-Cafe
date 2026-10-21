import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { UserProfile, UserPreferences } from '../types/index.ts';
import { auth, db, handleFirestoreError, OperationType } from '../config/firebase.ts';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useCanteen } from './CanteenContext.tsx';
import {
  STORAGE_KEYS,
  LEGACY_STORAGE_KEYS,
  storageValidators,
  readScopedOrLegacy,
  getOperatorStorageKey,
  safeGetStorage,
} from '../utils/storageKeys.ts';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  vegOnly: false,
  preferredService: 'dinein',
  notificationsEnabled: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let operatorId = 'campora-cafe';
  try {
    const { config } = useCanteen();
    if (config?.identity?.id) {
      operatorId = config.identity.id;
    }
  } catch {
    // Safe fallback for isolated test harnesses
  }

  const activeOperatorRef = useRef(operatorId);

  const getDefaultGuest = (opId: string): UserProfile => {
    if (opId === 'campora-cafe') {
      return {
        uid: 'customer-demo-1',
        displayName: 'Pratik Kumar',
        email: 'devlopwithpratik@gmail.com',
        phoneNumber: '+91 98765 43210',
        createdAt: '2025-06-01T00:00:00.000Z',
        preferences: defaultPreferences,
      };
    }
    return {
      uid: `customer-${opId}`,
      displayName: 'Guest Customer',
      email: '',
      phoneNumber: '',
      createdAt: new Date().toISOString(),
      preferences: defaultPreferences,
    };
  };

  const [user, setUser] = useState<UserProfile | null>(() => {
    const defaultGuest = getDefaultGuest(operatorId);
    return readScopedOrLegacy<UserProfile | null>(
      STORAGE_KEYS.USER,
      LEGACY_STORAGE_KEYS.USER,
      storageValidators.user,
      (val) => {
        try {
          return JSON.parse(val) as UserProfile;
        } catch {
          return defaultGuest;
        }
      },
      defaultGuest,
      operatorId
    );
  });

  const [loading, setLoading] = useState(false);

  // Reload user state cleanly when canteen operator changes at runtime
  useEffect(() => {
    const defaultGuest = getDefaultGuest(operatorId);
    const loaded = readScopedOrLegacy<UserProfile | null>(
      STORAGE_KEYS.USER,
      LEGACY_STORAGE_KEYS.USER,
      storageValidators.user,
      (val) => {
        try {
          return JSON.parse(val) as UserProfile;
        } catch {
          return defaultGuest;
        }
      },
      defaultGuest,
      operatorId
    );
    setUser(loaded);
    activeOperatorRef.current = operatorId;
  }, [operatorId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userDocData: any = null;
        try {
          const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userSnap.exists()) {
            userDocData = userSnap.data();
          }
        } catch (err) {
          // If Firestore read fails, fall back to auth info
          console.warn('Could not fetch user document:', err);
        }

        const profile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || userDocData?.displayName || firebaseUser.email?.split('@')[0] || 'Campora Guest',
          email: firebaseUser.email,
          phoneNumber: firebaseUser.phoneNumber || userDocData?.phoneNumber || null,
          photoURL: firebaseUser.photoURL || null,
          createdAt: userDocData?.createdAt || new Date().toISOString(),
          preferences: userDocData?.preferences || defaultPreferences,
        };

        setUser(profile);
        if (activeOperatorRef.current === operatorId) {
          const storage = safeGetStorage();
          if (storage) {
            const scopedKey = getOperatorStorageKey(STORAGE_KEYS.USER, operatorId);
            storage.setItem(scopedKey, JSON.stringify(profile));
            if (operatorId === 'campora-cafe') {
              storage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, [operatorId]);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const profile: UserProfile = {
        uid: cred.user.uid,
        displayName: cred.user.displayName || email.split('@')[0],
        email: cred.user.email,
        createdAt: new Date().toISOString(),
        preferences: defaultPreferences,
      };
      setUser(profile);
      const storage = safeGetStorage();
      if (storage) {
        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      }
    } catch (err) {
      console.error('Email login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string, phone?: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });

      const profile: UserProfile = {
        uid: cred.user.uid,
        displayName: name,
        email: cred.user.email,
        phoneNumber: phone || null,
        createdAt: new Date().toISOString(),
        preferences: defaultPreferences,
      };

      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          displayName: name,
          email: cred.user.email,
          phoneNumber: phone || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          preferences: defaultPreferences,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${cred.user.uid}`);
      }

      setUser(profile);
      const storage = safeGetStorage();
      if (storage) {
        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      }
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const profile: UserProfile = {
        uid: result.user.uid,
        displayName: result.user.displayName || 'Google User',
        email: result.user.email,
        photoURL: result.user.photoURL || null,
        createdAt: new Date().toISOString(),
        preferences: defaultPreferences,
      };

      try {
        await setDoc(
          doc(db, 'users', result.user.uid),
          {
            uid: result.user.uid,
            displayName: result.user.displayName,
            email: result.user.email,
            updatedAt: serverTimestamp(),
            preferences: defaultPreferences,
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Sync google user to firestore:', err);
      }

      setUser(profile);
      const storage = safeGetStorage();
      if (storage) {
        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      }
    } catch (err) {
      console.error('Google Sign-in error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // In mock development session
    }
    setUser(null);
    const storage = safeGetStorage();
    if (storage) {
      const scopedKey = getOperatorStorageKey(STORAGE_KEYS.USER, operatorId);
      storage.removeItem?.(scopedKey);
      storage.removeItem?.(STORAGE_KEYS.USER);
      storage.removeItem?.(LEGACY_STORAGE_KEYS.USER);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      preferences: {
        ...user.preferences,
        ...prefs,
      },
    };
    setUser(updated);
    if (activeOperatorRef.current === operatorId) {
      const storage = safeGetStorage();
      if (storage) {
        const scopedKey = getOperatorStorageKey(STORAGE_KEYS.USER, operatorId);
        storage.setItem(scopedKey, JSON.stringify(updated));
        if (operatorId === 'campora-cafe') {
          storage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
        }
      }
    }

    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          preferences: updated.preferences,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Update preferences error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
