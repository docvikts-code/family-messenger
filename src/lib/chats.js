import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Знаходить головний груповий чат сім'ї
export async function getFamilyGroupChat(familyId) {
  const q = query(
    collection(db, "chats"),
    where("familyId", "==", familyId),
    where("type", "==", "group")
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}
