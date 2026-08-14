import { useEffect, useState, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Onboarding from "./components/Onboarding";
import ChatScreen from "./components/ChatScreen";
import { getFamilyGroupChat } from "./lib/chats";
import "./styles/global.css";
import "./styles/chat.css";

function Shell() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [chat, setChat] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  const loadChat = useCallback(async () => {
    if (!profile?.familyId) return;
    setChatLoading(true);
    const c = await getFamilyGroupChat(profile.familyId);
    setChat(c);
    setChatLoading(false);
  }, [profile?.familyId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  if (loading) {
    return (
      <div className="app-shell centered">
        <p className="dim">Завантаження...</p>
      </div>
    );
  }

  if (!profile?.familyId) {
    return (
      <div className="app-shell">
        <Onboarding
          onDone={async () => {
            await refreshProfile(user.uid);
            loadChat();
          }}
        />
      </div>
    );
  }

  if (chatLoading || !chat) {
    return (
      <div className="app-shell centered">
        <p className="dim">Відкриваємо родинний чат...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <ChatScreen chatId={chat.id} chatName={chat.name || "Родинний чат"} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
