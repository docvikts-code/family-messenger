import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile } from "../lib/family";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const refreshProfile = useCallback(async (uid) => {
    const p = await getUserProfile(uid);
    setProfile(p);
    return p;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await refreshProfile(firebaseUser.uid);
        setLoading(false);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Помилка анонімного входу:", err);
          setAuthError(`${err.code || "невідома помилка"}: ${err.message || ""}`);
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [refreshProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth має використовуватись всередині AuthProvider");
  return ctx;
}
