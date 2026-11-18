# eatinpaincakes

Brand hub for **eatinpaincakes** — doodle cat, pixel pancakes, soft chaos.

## Run locally

```bash
npm install
npm start
```

Open `http://127.0.0.1:3847`.

## Env

Copy `.env.example` → `.env` for local overrides. Published Cursor apps should set secrets via Cursor (not a committed `.env`):

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `CASHAPP_HANDLE` (default `eatinpaincakes`)
- optional `CAMPAIGN_GOAL_CENTS` / `CAMPAIGN_RAISED_CENTS`

## Sections

Hero · Play (GPU Got Me Feeling) · Projects · Socials · Donate (Stripe Checkout + Cash App)
