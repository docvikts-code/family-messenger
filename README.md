# 🏡 Родинний чат — MVP

Приватний PWA-месенджер для сім'ї: текстові повідомлення, фото, відео в спільному чаті.
Приєднання — тільки за кодом запрошення, доступ до чату мають лише члени сім'ї.

## Що вже реалізовано (MVP, крок 1)

- Створення сім'ї / приєднання за кодом запрошення
- Один спільний сімейний чат (текст, фото, відео) у реальному часі
- PWA — можна встановити на телефон як застосунок
- Автодеплой на GitHub Pages через GitHub Actions

**Далі за планом (наступні кроки):** особисті чати 1-на-1, push-сповіщення (Web Push + Telegram-резерв), статус "прочитано", офлайн-кеш.

---

## Крок 1. Налаштування Firebase (безкоштовно)

1. Перейдіть на [console.firebase.google.com](https://console.firebase.google.com) → **Create a project**
2. Назвіть проєкт, наприклад `family-messenger`
3. У боковому меню:
   - **Build → Authentication** → вкладка Sign-in method → увімкніть **Anonymous**
   - **Build → Firestore Database** → Create database → режим **production**
   - **Build → Storage** → Get started
4. **Project settings (⚙️) → General → Your apps → Web (`</>`)** — зареєструйте застосунок і скопіюйте конфігурацію (`apiKey`, `authDomain` тощо)

## Крок 2. Локальний запуск

```bash
npm install
cp .env.example .env
# відкрийте .env і вставте значення з Firebase (крок 1.4)
npm run dev
```

Застосунок відкриється на `http://localhost:5173`.

## Крок 3. Публікація правил безпеки Firebase

Правила в `firestore.rules` і `storage.rules` вже написані так, щоб доступ до чату мали тільки члени конкретної сім'ї. Щоб їх застосувати:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore storage   # оберіть існуючий проєкт, файли rules вже є в репо
firebase deploy --only firestore:rules,storage:rules
```

## Крок 4. Публікація на GitHub

```bash
git init
git add .
git commit -m "Родинний чат: MVP"
git branch -M main
git remote add origin https://github.com/<ваш-логін>/family-messenger.git
git push -u origin main
```

## Крок 5. Автодеплой на GitHub Pages

1. У репозиторії на GitHub: **Settings → Pages → Source** → оберіть **GitHub Actions**
2. **Settings → Secrets and variables → Actions → New repository secret** — додайте 6 секретів зі значеннями з вашого `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. Наступний `git push` в `main` автоматично задеплоїть застосунок (workflow у `.github/workflows/deploy.yml`)
4. Застосунок буде доступний на `https://<ваш-логін>.github.io/family-messenger/`

## Крок 6. Встановлення на телефон (PWA)

- **Android (Chrome):** відкрити посилання → меню (⋮) → "Додати на головний екран"
- **iPhone (Safari):** відкрити посилання → кнопка "Поділитись" → "На екран «Домівка»"

## Структура проєкту

```
src/
  lib/
    firebase.js      — конфігурація Firebase
    family.js         — створення/приєднання до сім'ї
    chats.js           — пошук сімейного чату
    messages.js       — надсилання/читання повідомлень
  context/
    AuthContext.jsx   — анонімна авторизація + профіль
  components/
    Onboarding.jsx    — створення сім'ї / вхід за кодом
    ChatScreen.jsx     — список повідомлень + композер
  styles/
    global.css, chat.css
firestore.rules        — правила безпеки бази даних
storage.rules           — правила безпеки медіасховища
.github/workflows/deploy.yml — автодеплой
```

## Обмеження безкоштовного плану Firebase (Spark)

- Firestore: 50 тис. читань і 20 тис. записів на добу — для сім'ї з кількох людей більш ніж достатньо
- Storage: 5 ГБ загалом, 1 ГБ завантажень на добу — відео варто знімати не в найвищій якості, або в наступному кроці додамо стиснення перед завантаженням
