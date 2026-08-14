import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile } from "../lib/family";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
        // Анонімний вхід — простий спосіб отримати стабільний userId
        // без потреби у паролях. Ім'я члена сім'ї вводиться окремо на онбордингу.
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Помилка анонімного входу:", err);
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [refreshProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth має використовуватись всередині AuthProvider");
  return ctx;
}
