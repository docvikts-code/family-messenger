import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

// Підписка на повідомлення чату в реальному часі
export function subscribeToMessages(chatId, callback) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(messages);
  });
}

// Надсилання текстового повідомлення
export async function sendTextMessage({ chatId, senderId, text }) {
  const trimmed = text.trim();
  if (!trimmed) return;

  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    type: "text",
    content: trimmed,
    status: "sent",
    readBy: [senderId],
    timestamp: serverTimestamp(),
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: { text: trimmed, senderId, timestamp: serverTimestamp() },
  });
}

// Надсилання фото/відео: завантаження у Storage + запис повідомлення
export async function sendMediaMessage({ chatId, senderId, file }) {
  const isVideo = file.type.startsWith("video/");
  const path = `families/${chatId}/media/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    type: isVideo ? "video" : "image",
    content: url,
    status: "sent",
    readBy: [senderId],
    timestamp: serverTimestamp(),
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: {
      text: isVideo ? "🎬 Відео" : "📷 Фото",
      senderId,
      timestamp: serverTimestamp(),
    },
  });
}
