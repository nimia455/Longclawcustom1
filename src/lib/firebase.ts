import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId according to Firebase skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Authentication Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Standard Error Handling Protocol from Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL CONSTRAINT: Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Types for Chat & Messages
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thoughts?: string;
  searches?: string[];
  sources?: { url: string; title: string }[];
  dur?: number;
  stopped?: boolean;
  createdAt?: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  mode: 'chat' | 'sum' | 'write';
  depth: 'fast' | 'mid' | 'deep';
  pin?: boolean;
  messages: ChatMessage[];
  createdAt?: any;
  updatedAt?: any;
}

// Firestore Real-time Chat Operations
export function subscribeToUserChats(
  userId: string,
  onUpdate: (chats: ChatSession[]) => void,
  onError?: (err: Error) => void
) {
  const path = `users/${userId}/chats`;
  try {
    const q = query(collection(db, 'users', userId, 'chats'), orderBy('updatedAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: ChatSession[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        onUpdate(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (wrapped) {
          if (onError && wrapped instanceof Error) onError(wrapped);
        }
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function saveChatSession(userId: string, chat: ChatSession, isNew = false) {
  const path = `users/${userId}/chats/${chat.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'chats', chat.id);
    const dataToSave = {
      id: chat.id,
      userId,
      title: (chat.title || 'Yeni sohbet').slice(0, 200),
      mode: chat.mode || 'chat',
      depth: chat.depth || 'mid',
      pin: !!chat.pin,
      messages: (chat.messages || []).slice(-1000),
      updatedAt: serverTimestamp(),
      ...(isNew ? { createdAt: serverTimestamp() } : {}),
    };
    await setDoc(docRef, dataToSave, { merge: !isNew });
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function deleteChatSession(userId: string, chatId: string) {
  const path = `users/${userId}/chats/${chatId}`;
  try {
    const docRef = doc(db, 'users', userId, 'chats', chatId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncUserProfile(user: User) {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);

    const displayName = (
      user.displayName ||
      user.email?.split('@')[0] ||
      'Kullanıcı'
    ).slice(0, 100);

    if (!existingSnap.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        email: (user.email || '').slice(0, 256),
        displayName,
        photoURL: (user.photoURL || '').slice(0, 1000),
        emailVerified: !!user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        email: (user.email || '').slice(0, 256),
        displayName,
        photoURL: (user.photoURL || '').slice(0, 1000),
        emailVerified: !!user.emailVerified,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
  onAuthStateChanged,
};
