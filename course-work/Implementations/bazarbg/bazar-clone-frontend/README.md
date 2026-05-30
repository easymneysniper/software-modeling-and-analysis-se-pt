# Bazar.bg Clone

## Данни за студента

**Факултетен номер:** 2201322038
**Име на проекта:** Bazar.bg Clone

## Кратко описание на проекта

Bazar.bg Clone е уеб платформа за публикуване, разглеждане и управление на обяви, вдъхновена от функционалността на Bazar.bg.

Проектът позволява:

- регистрация и вход на потребители;
- JWT автентикация;
- създаване, редактиране и изтриване на лични обяви;
- качване и премахване на снимки към обяви;
- разглеждане на обяви по категории;
- търсене и филтриране по ключова дума, категория, локация и цена;
- добавяне на обяви в любими;
- изпращане и получаване на съобщения между потребители;
- страница за безопасност при сделки.

Проектът е изграден с клиент-сървърна архитектура:

- **Frontend:** React + Vite
- **Backend:** Python + FastAPI + Uvicorn
- **Database:** MySQL
- **ORM:** SQLAlchemy
- **Authentication:** JWT token + bcrypt password hashing

---

## Използвани технологии

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- PyMySQL
- Python-Jose
- bcrypt
- python-dotenv
- python-multipart
- MySQL

### Frontend

- React
- Vite
- React Router DOM
- Lucide React
- HTML
- CSS
- JavaScript

### Database

- MySQL
- MySQL Workbench

---

## Структура на проекта

```txt
Bazarbg/
│
├── bazar-clone-backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── categories.py
│   │   │   ├── ads.py
│   │   │   ├── favorites.py
│   │   │   └── messages.py
│   │   │
│   │   ├── static/
│   │   │   └── uploads/
│   │   │       └── ads/
│   │   │
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── security.py
│   │
│   ├── .env
│   └── requirements.txt
│
├── bazar-clone-frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Инсталация и стартиране

### 1. Подготовка на базата данни

Отворете **MySQL Workbench** и създайте база данни с име:

```sql
bazar_platform
```

След това изпълнете SQL скриптовете за:

1. създаване на таблиците;
2. добавяне на примерни данни.

Основните таблици в базата са:

- `users`
- `categories`
- `locations`
- `ads`
- `ad_images`
- `favorite_ads`
- `saved_searches`
- `messages`
- `reports`
- `promotions`
- `blacklists`
- `reviews`

Ако таблицата `blacklists` липсва, изпълнете:

```sql
USE bazar_platform;

CREATE TABLE blacklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blocker_user_id INT NOT NULL,
    blocked_user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_blacklist_pair UNIQUE (blocker_user_id, blocked_user_id),

    CONSTRAINT fk_blacklists_blocker
        FOREIGN KEY (blocker_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_blacklists_blocked
        FOREIGN KEY (blocked_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
```

---

## 2. Стартиране на backend частта

Отворете терминал и влезте в backend папката:

```bash
cd bazar-clone-backend
```

Инсталирайте нужните Python библиотеки:

```bash
pip install -r requirements.txt
```

Създайте `.env` файл в папката `bazar-clone-backend/` със следното съдържание:

```env
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bazar_platform

JWT_SECRET_KEY=change_this_to_a_long_random_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Заменете `your_mysql_password` с реалната парола за MySQL.

Уверете се, че има папка за качване на снимки:

```txt
app/static/uploads/ads/
```

Ако липсва, създайте я ръчно.

Стартирайте backend сървъра:

```bash
uvicorn app.main:app --reload
```

Backend API ще бъде достъпно на:

```txt
http://127.0.0.1:8000
```

Документацията на API-то може да бъде отворена на:

```txt
http://127.0.0.1:8000/docs
```

---

## 3. Стартиране на frontend частта

Отворете нов терминал и влезте във frontend папката:

```bash
cd bazar-clone-frontend
```

Инсталирайте зависимостите:

```bash
npm install
```

Стартирайте React приложението:

```bash
npm run dev
```

Frontend приложението ще бъде достъпно на:

```txt
http://localhost:5173
```

---

## 4. Начин на работа с приложението

1. Отворете `http://localhost:5173`
2. Регистрирайте нов потребител
3. Влезте в профила си
4. Създайте нова обява
5. Добавете снимки към обявата
6. Редактирайте или изтрийте свои обяви от секция „Моите обяви“
7. Разглеждайте обяви от началната страница
8. Добавяйте обяви в любими
9. Изпращайте съобщения до други потребители
10. Отворете секция „Съобщения“, за да видите разговорите си

---

## API Endpoints

### Auth

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Users

```txt
GET /users
GET /users/{user_id}
```

### Ads

```txt
GET    /ads
GET    /ads/{ad_id}
POST   /ads
PUT    /ads/{ad_id}
DELETE /ads/{ad_id}
GET    /ads/me/list
GET    /ads/user/{user_id}/list
POST   /ads/{ad_id}/images
DELETE /ads/{ad_id}/images/{image_id}
```

### Categories

```txt
GET /categories
GET /categories/main
GET /categories/{category_id}
GET /categories/{category_id}/children
```

### Favorites

```txt
GET    /favorites/me
POST   /favorites
DELETE /favorites/{favorite_id}
DELETE /favorites/ad/{ad_id}
```

### Messages

```txt
GET  /messages/me
GET  /messages/unread-count
GET  /messages/conversation/{user_two_id}
POST /messages
PUT  /messages/conversation/{user_two_id}/read
```

---

## Важни бележки

### Seed потребители

Ако в базата има примерни потребители от SQL insert script-а, те може да нямат реален bcrypt hash за паролата. Най-сигурният начин е да се регистрира нов потребител през frontend-а или през `/auth/register`.

### Снимки към обявите

Снимките се записват локално в:

```txt
app/static/uploads/ads/
```

В базата данни се пази само пътят към файла в таблицата `ad_images`.

### Backend и frontend трябва да работят едновременно

За да работи проектът, трябва да са пуснати и двете части:

Backend:

```bash
uvicorn app.main:app --reload
```

Frontend:

```bash
npm run dev
```

---

## Диаграми към проекта

Към проекта са подготвени следните диаграми:

- концептуална диаграма в Chen’s Database Notation;
- логическа диаграма в Crow’s Foot Database Notation;
- Data Warehouse диаграма в UML Database Notation.

---

## Автор

Проектът е разработен като учебен проект по дисциплина, свързана с бази данни, уеб технологии и изграждане на клиент-сървърни приложения.
