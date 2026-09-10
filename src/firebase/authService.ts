import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, isFirebaseConfigured, getMissingFirebaseKeys } from './config';

export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'An unknown authentication error occurred.';

  const code: string = typeof error === 'string' ? error : (error?.code || '');
  const rawMessage: string = typeof error === 'string' ? error : (error?.message || '');

  console.error('[Firebase Auth Error Details]:', { code, message: rawMessage, error });

  // Missing or unconfigured credentials in .env
  if (
    code === 'auth/not-configured' ||
    rawMessage.includes('Firebase credentials are not configured') ||
    rawMessage.includes('Missing Firebase environment')
  ) {
    return rawMessage;
  }

  // Handle specific Firebase error codes
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/invalid-email':
      return 'The email address format is invalid. Please enter a valid email (e.g., name@example.com).';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is disabled in your Firebase project. In the Firebase Console, go to Authentication > Sign-in method, click "Email/Password", and toggle it to Enabled.';
    case 'auth/weak-password':
      return 'The password is too weak. Please enter a password with at least 6 characters.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    case 'auth/user-not-found':
      return 'No account was found with this email address. Please check for typos or sign up.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password. Please verify and try again.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection and try again.';
    case 'auth/api-key-not-valid':
    case 'auth/api-key-not-valid.':
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API Key. Please verify VITE_FIREBASE_API_KEY in your .env.local file.';
    case 'auth/configuration-not-found':
      return 'Firebase Authentication has not been activated yet. Go to Firebase Console > Build > Authentication, click "Get started", and enable "Email/Password" under the "Sign-in method" tab.';
    case 'auth/unauthorized-domain':
      return 'Domain unauthorized: Current domain (localhost) must be added in Firebase Console > Authentication > Settings > Authorized domains.';
    case 'auth/internal-error':
      return 'Firebase internal error. Please check your Firebase configuration in .env.';
  }

  // If Firebase returned a message like "Firebase: Error (auth/xxx)."
  if (rawMessage.includes('Firebase: Error (auth/')) {
    const match = rawMessage.match(/\(auth\/([a-zA-Z0-9-_]+)\)/);
    if (match && match[1]) {
      return `Firebase Authentication Error (${match[1]}): Please check your Firebase project settings.`;
    }
  }

  // If there's an explicit custom error message
  if (rawMessage && !rawMessage.startsWith('Firebase:')) {
    return rawMessage;
  }

  // Fallback showing the actual code if present
  return code
    ? `Authentication error: ${code}. Please check your Firebase Console configuration.`
    : (rawMessage || 'Authentication failed. Please verify your credentials and Firebase setup.');
}

export async function registerWithFirebase(email: string, password: string, displayName: string): Promise<User | null> {
  if (!isFirebaseConfigured || !auth) {
    const missing = getMissingFirebaseKeys();
    const missingStr = missing.length > 0 ? missing.join(', ') : 'Firebase keys in .env';
    throw new Error(
      `Firebase is not yet configured. Missing environment variables in .env: ${missingStr}. Please add your Firebase project keys to .env.`
    );
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (credential.user && displayName) {
      await updateProfile(credential.user, { displayName });
    }
    return credential.user;
  } catch (error: any) {
    console.error('Registration failed:', error);
    throw error;
  }
}

export async function loginWithFirebase(email: string, password: string): Promise<User | null> {
  if (!isFirebaseConfigured || !auth) {
    const missing = getMissingFirebaseKeys();
    const missingStr = missing.length > 0 ? missing.join(', ') : 'Firebase keys in .env';
    throw new Error(
      `Firebase is not yet configured. Missing environment variables in .env: ${missingStr}. Please add your Firebase project keys to .env.`
    );
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error: any) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function logoutFromFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

export function subscribeToFirebaseAuthState(callback: (user: User | null) => void): () => void {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {};
}
