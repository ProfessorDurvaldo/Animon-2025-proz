import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const checkAdminStatus = async (email) => {
    if (email === 'durvaldomarques@gmail.com') {
      setIsAdmin(true);
      return true;
    }
    
    const adminQuery = query(
      collection(db, 'admins'), 
      where('email', '==', email)
    );
    const adminSnapshot = await getDocs(adminQuery);
    const adminStatus = !adminSnapshot.empty;
    setIsAdmin(adminStatus);
    return adminStatus;
  };

  const getUserProfile = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const profile = userDoc.data();
      setUserProfile(profile);
      return profile;
    }
    return null;
  };

  const updateUserProfile = async (uid, profileData) => {
    try {
      await setDoc(doc(db, 'users', uid), profileData, { merge: true });
      setUserProfile(prev => ({ ...prev, ...profileData }));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await checkAdminStatus(user.email);
        await getUserProfile(user.uid);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    signInWithGoogle,
    logout,
    getUserProfile,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};