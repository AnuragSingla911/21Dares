# 21 Dares

A polished, mobile-friendly two-player web game. Count from 1 to 21 — the player forced to say **21** loses the round and faces a dare.

**Count smart. Avoid 21. Or face the dare!**

## Play live

**https://anuragsingla911.github.io/21Dares/**

### One-time GitHub Pages setup (same as [indian-stock-signals](https://anuragsingla911.github.io/indian-stock-signals/))

1. Open [21Dares → Settings → Pages](https://github.com/AnuragSingla911/21Dares/settings/pages)
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**
3. Choose branch **`gh-pages`**, folder **`/ (root)`**, then **Save**
4. Wait 1–2 minutes — the site will be live at the URL above

Pushes to `main` automatically rebuild and redeploy via GitHub Actions.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- LocalStorage (names, settings, scores, progress)
- Vitest unit tests

## Scripts

```bash
npm install
npm run dev        # local development
npm run test       # unit tests
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # production build
```

## Gameplay

- Say 1, 2, or 3 consecutive numbers per turn
- Saying 21 loses the round → dare time
- Winner of each round gets a point
- Local two-player or play vs computer (Easy / Medium / Hard)
- 100+ safe dares across Fun, Funny, Creative, Friends, Couples
