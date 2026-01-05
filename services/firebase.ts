import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBkLh6Sl0NcvT3lv4oppY2xtftFILMYwLs",
  authDomain: "tauba-e32fe.firebaseapp.com",
  projectId: "tauba-e32fe",
  storageBucket: "tauba-e32fe.firebasestorage.app",
  messagingSenderId: "352727308770",
  appId: "1:352727308770:web:224351f140f539a04301bb",
  measurementId: "G-GQNK2TYQC2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

// User data management
export interface UserProgress {
  userId: string;
  quranProgress: {
    [surahNumber: number]: {
      lastAyah: number;
      lastReadDate: string;
      completedDate?: string;
    };
  };
  zikirProgress: {
    [zikirId: string]: {
      count: number;
      lastUpdated: string;
      dailyCount?: number;
      lastDailyReset?: string;
    };
  };
  settings: {
    language: string;
    selectedCity: number;
    theme: string;
  };
  lastSync: string;
}

export const saveUserProgress = async (user: User, progress: Partial<UserProgress>) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userData = {
      ...progress,
      lastSync: new Date().toISOString(),
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
    
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      await updateDoc(userRef, userData);
    } else {
      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error("Error saving user progress:", error);
    throw error;
  }
};

export const getUserProgress = async (user: User): Promise<UserProgress | null> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProgress;
    }
    return null;
  } catch (error) {
    console.error("Error getting user progress:", error);
    throw error;
  }
};

// Quran progress
export const updateQuranProgress = async (user: User, surahNumber: number, lastAyah: number) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const progress = await getUserProgress(user);
    
    const quranProgress = progress?.quranProgress || {};
    quranProgress[surahNumber] = {
      lastAyah,
      lastReadDate: new Date().toISOString()
    };
    
    await updateDoc(userRef, { quranProgress });
  } catch (error) {
    console.error("Error updating Quran progress:", error);
    throw error;
  }
};

// Zikir progress
export const updateZikirProgress = async (user: User, zikirId: string, count: number) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const progress = await getUserProgress(user);
    
    const zikirProgress = progress?.zikirProgress || {};
    const today = new Date().toDateString();
    const lastReset = zikirProgress[zikirId]?.lastDailyReset;
    
    zikirProgress[zikirId] = {
      count,
      lastUpdated: new Date().toISOString(),
      dailyCount: lastReset === today ? (zikirProgress[zikirId]?.dailyCount || 0) + 1 : 1,
      lastDailyReset: today
    };
    
    await updateDoc(userRef, { zikirProgress });
  } catch (error) {
    console.error("Error updating Zikir progress:", error);
    throw error;
  }
};

// Settings
export const updateUserSettings = async (user: User, settings: any) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
};

export default app;
