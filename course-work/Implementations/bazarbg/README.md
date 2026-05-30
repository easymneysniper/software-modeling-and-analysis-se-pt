# Bazar.bg Clone

## Данни за проекта

**Факултетен номер:** 2201322038  
**Име на проекта:** Bazar.bg 
**Тема:** онлайн платформа за публикуване и разглеждане на обяви

## Кратко описание

Bazar.bg е учебен уеб проект, вдъхновен от платформите за безплатни обяви. Приложението позволява регистрация и вход на потребители, публикуване на обяви, качване на снимки, търсене и филтриране, добавяне в любими, изпращане на съобщения между потребители и администраторски преглед на сигнали.

Проектът включва база данни, backend API, frontend приложение и подготвени диаграми за концептуален модел, логически модел и Data Warehouse модел.

## Използвани технологии

- **Frontend:** React, Vite, React Router, Lucide React
- **Backend:** Python, FastAPI, SQLAlchemy, Uvicorn
- **Database:** MySQL
- **Authentication:** JWT token и bcrypt
- **Диаграми:** Chen notation, Crow's Foot notation, UML database notation
- **BI отчет:** Power BI

## Структура

```txt
bazar.bg/
├── bazar-clone-backend/     # FastAPI backend
│   ├── app/
│   │   ├── routers/         # API endpoints
│   │   ├── models.py        # SQLAlchemy модели
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── database.py      # връзка с MySQL
│   │   └── main.py          # FastAPI app
│   ├── .env.example         # примерни настройки за базата
│   └── requirements.txt
│
├── bazar-clone-frontend/    # React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── assets/
│   │   └── api.js
│   └── package.json
│
├── Dump20260528.sql         # MySQL dump със схема и примерни данни
├── bazarbg_powerbi_report.pbix
└── README.md
```

## Стартиране на проекта

### 1. База данни

Създайте MySQL база чрез файла:

```txt
Dump20260528.sql
```

Той създава базата `bazar_platform`, таблиците и примерните данни.
Dump файлът съдържа и 2 stored procedures, 2 functions и 2 triggers.

### 2. Backend

Влезте в backend папката:

```bash
cd bazar-clone-backend
```

Инсталирайте зависимостите:

```bash
pip install -r requirements.txt
```

Копирайте примерния env файл:

```bash
copy .env.example .env
```

След това отворете `.env` и попълнете вашите MySQL настройки:

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

Стартирайте backend сървъра:

```bash
uvicorn app.main:app --reload
```

API адрес:

```txt
http://127.0.0.1:8000
```

API документация:

```txt
http://127.0.0.1:8000/docs
```

### 3. Frontend

Влезте във frontend папката:

```bash
cd bazar-clone-frontend
```

Инсталирайте зависимостите:

```bash
npm install
```

Стартирайте приложението:

```bash
npm run dev
```

Frontend адрес:

```txt
http://localhost:5173
```

## Основни функционалности

- регистрация и вход на потребители;
- JWT автентикация;
- публикуване, редактиране и изтриване на обяви;
- качване на снимки към обяви;
- търсене и филтриране по категория, локация и цена;
- добавяне на обяви в любими;
- съобщения между потребители;
- подаване на сигнали за нередни обяви;
- администраторски панел за потребители и сигнали;
- страници за безопасност и доставка.

## Диаграми

Диаграмите са в:

```txt
bazar-clone-frontend/src/assets/
```

Налични са:

- `konceptualna_diagrama.png` - концептуален модел;
- `logicheska_diagrama.png` - логически модел;
- `data_warehouse.png` - Data Warehouse модел.

Има и editable версии за diagrams.net / draw.io:

- `konceptualna_diagrama.drawio`;
- `logicheska_diagrama.drawio`;
- `data_warehouse.drawio`.

## Power BI отчет

Power BI докладът е в главната папка на проекта:

```txt
bazarbg_powerbi_report.pbix
```

Докладът е изграден върху данните от базата и съдържа минимум 4 визуализации, свързани с обяви, категории, потребители и активност в платформата.

## SQL обекти за тестване

След import на `Dump20260528.sql` в MySQL Workbench могат да се тестват добавените functions, procedures и triggers със следните заявки:

```sql
USE bazar_platform;

-- Function: брой добавяния в любими за дадена обява
SELECT fn_ad_favorites_count(1) AS ad_1_favorites;

-- Function: брой активни обяви на даден потребител
SELECT fn_user_active_ads_count(11) AS user_11_active_ads;

-- Procedure: обща статистика за потребител
CALL sp_get_user_marketplace_stats(11);

-- Procedure: маркиране на обява като продадена
-- Примерът е в transaction, за да може да се върне обратно с ROLLBACK.
START TRANSACTION;
CALL sp_mark_ad_as_sold(20, 11);
SELECT id, title, status
FROM ads
WHERE id = 20;
ROLLBACK;

-- Trigger: автоматично попълване на published_at и expires_at при нова обява
-- Примерът също е в transaction и не оставя постоянен запис.
START TRANSACTION;
INSERT INTO ads (
    user_id,
    category_id,
    location_id,
    title,
    description,
    price,
    currency,
    status
) VALUES (
    11,
    17,
    1,
    'Тестова обява за trigger',
    'Проверка на автоматични дати.',
    100.00,
    'BGN',
    'active'
);

SELECT id, title, published_at, expires_at
FROM ads
WHERE title = 'Тестова обява за trigger'
ORDER BY id DESC
LIMIT 1;
ROLLBACK;

-- Trigger: валидация на съобщения
-- Тази заявка трябва да върне грешка, защото sender_id и receiver_id са еднакви.
INSERT INTO messages (sender_id, receiver_id, ad_id, message_text)
VALUES (11, 11, 20, 'Тестово съобщение до себе си');
```

## Бележки

Backend и frontend трябва да работят едновременно. Снимките към обявите се пазят локално в:

```txt
bazar-clone-backend/app/static/uploads/ads/
```

Проектът е разработен с учебна цел и демонстрира изграждане на клиент-сървърно приложение с релационна база данни.
