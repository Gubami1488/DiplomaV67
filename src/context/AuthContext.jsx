import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          if (!isMounted) {
            return;
          }

          setUser(null);
          setProfile(null);
          setError('');
          setLoading(false);
          return;
        }

        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnapshot = await getDoc(profileRef);

        if (!isMounted) {
          return;
        }

        setUser(firebaseUser);
        setProfile(profileSnapshot.exists() ? profileSnapshot.data() : null);
        setError(profileSnapshot.exists() ? '' : 'Профиль пользователя не найден в Firestore.');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setUser(firebaseUser || null);
        setProfile(null);
        setError('Не удалось загрузить профиль пользователя. Проверьте Firestore Rules и коллекцию users.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const register = async ({ name, email, password, role, school, classNumber, parallel, photoDataUrl }) => {
    setLoading(true);

    const credentials = await createUserWithEmailAndPassword(auth, email, password);

    const userData = {
      uid: credentials.user.uid,
      name,
      email,
      role,
      school,
      classNumber: classNumber || '',
      parallel: parallel || '',
      photoDataUrl: photoDataUrl || '',
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', credentials.user.uid), userData);
    setUser(credentials.user);
    setProfile(userData);
    setError('');
    setLoading(false);
  };

  const login = async ({ email, password }) => {
    setLoading(true);

    const credentials = await signInWithEmailAndPassword(auth, email, password);
    const profileSnapshot = await getDoc(doc(db, 'users', credentials.user.uid));

    setUser(credentials.user);
    setProfile(profileSnapshot.exists() ? profileSnapshot.data() : null);
    setError(profileSnapshot.exists() ? '' : 'Профиль пользователя не найден в Firestore.');
    setLoading(false);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfileState = (data) => {
    setProfile((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const value = useMemo(
    () => ({ user, profile, loading, error, register, login, logout, updateProfileState }),
    [user, profile, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }

  return context;
}
