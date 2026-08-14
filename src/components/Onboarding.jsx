import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createFamily, joinFamily } from "../lib/family";

export default function Onboarding({ onDone }) {
  const { user, refreshProfile } = useAuth();
  const [mode, setMode] = useState("choose"); // choose | create | join
  const [name, setName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdCode, setCreatedCode] = useState(null);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !familyName.trim()) {
      setError("Заповніть ваше ім'я та назву сім'ї.");
      return;
    }
    setBusy(true);
    try {
      const result = await createFamily({
        familyName: familyName.trim(),
        ownerId: user.uid,
        ownerName: name.trim(),
      });
      await refreshProfile(user.uid);
      setCreatedCode(result.inviteCode);
    } catch (err) {
      setError(err.message || "Щось пішло не так. Спробуйте ще раз.");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !inviteCode.trim()) {
      setError("Заповніть ваше ім'я та код запрошення.");
      return;
    }
    setBusy(true);
    try {
      await joinFamily({
        inviteCode: inviteCode.trim(),
        userId: user.uid,
        userName: name.trim(),
      });
      await refreshProfile(user.uid);
      onDone();
    } catch (err) {
      setError(err.message || "Щось пішло не так. Спробуйте ще раз.");
    } finally {
      setBusy(false);
    }
  }

  if (createdCode) {
    return (
      <div className="onboarding fade-in">
        <div className="roof-mark" />
        <h1>Сім'ю створено 🏡</h1>
        <p className="dim">
          Поділіться цим кодом із родиною — за ним вони приєднаються до вашого спільного чату.
        </p>
        <div className="invite-code">{createdCode}</div>
        <button className="primary" onClick={onDone}>
          Перейти до чату
        </button>
      </div>
    );
  }

  return (
    <div className="onboarding fade-in">
      <div className="roof-mark" />
      <h1>Родинний чат</h1>
      <p className="dim">Простір лише для вашої сім'ї — повідомлення, фото, відео.</p>

      {mode === "choose" && (
        <div className="choice-stack">
          <button className="primary" onClick={() => setMode("create")}>
            Створити нову сім'ю
          </button>
          <button className="secondary" onClick={() => setMode("join")}>
            Приєднатись за кодом
          </button>
        </div>
      )}

      {mode === "create" && (
        <form onSubmit={handleCreate} className="onboarding-form">
          <label>
            Ваше ім'я
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Наприклад, Вікторе"
              autoFocus
            />
          </label>
          <label>
            Назва сім'ї
            <input
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Наприклад, Родина Іваненків"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="primary" type="submit" disabled={busy}>
            {busy ? "Створюємо..." : "Створити сім'ю"}
          </button>
          <button className="link" type="button" onClick={() => setMode("choose")}>
            Назад
          </button>
        </form>
      )}

      {mode === "join" && (
        <form onSubmit={handleJoin} className="onboarding-form">
          <label>
            Ваше ім'я
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Наприклад, Вікторе"
              autoFocus
            />
          </label>
          <label>
            Код запрошення
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="FAM-XXXXXX"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="primary" type="submit" disabled={busy}>
            {busy ? "Приєднуємось..." : "Приєднатись"}
          </button>
          <button className="link" type="button" onClick={() => setMode("choose")}>
            Назад
          </button>
        </form>
      )}
    </div>
  );
}
