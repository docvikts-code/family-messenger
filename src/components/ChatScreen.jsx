import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { subscribeToMessages, sendTextMessage, sendMediaMessage } from "../lib/messages";
import { getFamilyInfo } from "../lib/family";

export default function ChatScreen({ chatId, chatName, familyId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = subscribeToMessages(chatId, setMessages);
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleShowInvite() {
    if (!inviteCode && familyId) {
      const info = await getFamilyInfo(familyId);
      setInviteCode(info?.inviteCode || null);
    }
    setShowInvite((v) => !v);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const value = text;
    setText("");
    try {
      await sendTextMessage({ chatId, senderId: user.uid, text: value });
    } catch (err) {
      console.error("Не вдалось надіслати повідомлення:", err);
      setText(value);
    }
  }

  async function handleFilePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await sendMediaMessage({ chatId, senderId: user.uid, file });
    } catch (err) {
      console.error("Не вдалось завантажити файл:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <div className="roof-mark" />
        <div className="chat-header-row">
          <h2>{chatName}</h2>
          <button className="invite-toggle" onClick={handleShowInvite} type="button">
            👪 Код
          </button>
        </div>
        {showInvite && (
          <div className="invite-code-inline">
            {inviteCode ? inviteCode : "Завантаження..."}
          </div>
        )}
      </header>

      <div className="message-list">
        {messages.length === 0 && (
          <p className="empty-state">
            Тут поки тихо. Напишіть перше повідомлення родині 👋
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.senderId === user.uid;
          return (
            <div key={m.id} className={`bubble-row ${isMine ? "mine" : ""}`}>
              <div className={`bubble ${isMine ? "out" : "in"}`}>
                {m.type === "text" && <span>{m.content}</span>}
                {m.type === "image" && (
                  <img src={m.content} alt="Фото від родини" className="bubble-media" />
                )}
                {m.type === "video" && (
                  <video src={m.content} controls className="bubble-media" />
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form className="composer" onSubmit={handleSend}>
        <button
          type="button"
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label="Прикріпити фото або відео"
        >
          {uploading ? "…" : "📎"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={handleFilePick}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написати повідомлення..."
        />
        <button className="send-btn" type="submit" aria-label="Надіслати">
          ➤
        </button>
      </form>
    </div>
  );
}
