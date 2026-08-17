import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Генерує читабельний код запрошення на кшталт "FAM-7K2Q"
export function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // без символів, які легко сплутати
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `FAM-${code}`;
}

// Створює нову сім'ю та головний сімейний чат. Повертає familyId.
export async function createFamily({ familyName, ownerId, ownerName }) {
  const inviteCode = generateInviteCode();
  const familyRef = doc(collection(db, "families"));

  await setDoc(familyRef, {
    name: familyName,
    inviteCode,
    members: [ownerId],
    createdBy: ownerId,
    createdAt: serverTimestamp(),
  });

  // Головний сімейний груповий чат створюється одразу
  const chatRef = doc(collection(db, "chats"));
  await setDoc(chatRef, {
    familyId: familyRef.id,
    type: "group",
    name: familyName,
    participants: [ownerId],
    lastMessage: null,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "users", ownerId), {
    name: ownerName,
    familyId: familyRef.id,
    role: "owner",
    createdAt: serverTimestamp(),
  });

  return { familyId: familyRef.id, chatId: chatRef.id, inviteCode };
}

// Приєднання до існуючої сім'ї за кодом запрошення
export async function joinFamily({ inviteCode, userId, userName }) {
  const q = query(
    collection(db, "families"),
    where("inviteCode", "==", inviteCode.trim().toUpperCase())
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error("Код запрошення не знайдено. Перевірте і спробуйте ще раз.");
  }

  const familyDoc = snap.docs[0];
  const familyId = familyDoc.id;

  await updateDoc(doc(db, "families", familyId), {
    members: arrayUnion(userId),
  });

  await setDoc(doc(db, "users", userId), {
    name: userName,
    familyId,
    role: "member",
    createdAt: serverTimestamp(),
  });

  // Додаємо користувача до головного групового чату сім'ї
  const chatsQ = query(
    collection(db, "chats"),
    where("familyId", "==", familyId),
    where("type", "==", "group")
  );
  const chatsSnap = await getDocs(chatsQ);
  if (!chatsSnap.empty) {
    const chatDoc = chatsSnap.docs[0];
    await updateDoc(doc(db, "chats", chatDoc.id), {
      participants: arrayUnion(userId),
    });
    return { familyId, chatId: chatDoc.id };
  }

  return { familyId, chatId: null };
}

export async function getUserProfile(userId) {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? snap.data() : null;
}

export async function getFamilyInfo(familyId) {
  const snap = await getDoc(doc(db, "families", familyId));
  return snap.exists() ? snap.data() : null;
}
