# DemoPlay — demo-only casino prototype

A front-end prototype containing Crash and Mines using non-monetary demo credits.

## Run
```bash
npm install
npm run dev
```

## Important production work
This prototype intentionally keeps authentication and game state local to the browser. Before public deployment, replace the demo login with Google OAuth/email OTP and move balances, transactions, randomness, and game settlement to a trusted server/database.

For Cloudflare, use a Workers-compatible Next.js/Vite setup and D1 (or another supported database). Do not add deposits, withdrawals, crypto payments, redeemable credits, or cash prizes to this demo.

## Current features
- Demo email login
- 1,000 demo credits for a new browser
- Crash
- Mines
- Demo balance
- Game history
- Responsive UI
- No monetary value
