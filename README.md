# orders-sync

Мини-синхронизатор заявок: забирает «сырые» заявки с `https://test.ooobs.ru/api/orders`, нормализует телефоны, дедуплицирует и отдаёт результат по `/result`.

## Результат

`GET /result` → JSON:

```json
{
  "clients": [
    { "name": "...", "phone": "+79991234567", "email": "...", "amount": 5000 }
  ],
  "stats": {
    "received": 0,
    "unique": 0,
    "duplicates_merged": 0,
    "invalid_dropped": 0
  }
}
```

## Правила

1. Телефон → `+7XXXXXXXXXX`; иначе заявка отбрасывается.
2. Дедуп по телефону: больший `amount`, при равенстве — более поздний `created_at`.
3. Идемпотентность: каждый запрос пересчитывает результат из источника, дубли не копятся.

## Локально

```bash
npm test
npm run sync
```

## Деплой на Vercel

1. Создай репозиторий и запушь этот проект.
2. Import в [Vercel](https://vercel.com) → Deploy.
3. (Опционально) Env: `ORDERS_URL=https://test.ooobs.ru/api/orders`
4. Живой URL: `https://<project>.vercel.app/result`

CLI:

```bash
npx vercel
npx vercel --prod
```

## Секреты и почему так

URL источника лежит в env (`ORDERS_URL`), секретов у тестового API нет. Сервис без БД: каждый `GET /result` заново тянет и нормализует данные — идемпотентно и просто для serverless на Vercel.
