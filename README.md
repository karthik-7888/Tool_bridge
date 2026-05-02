# ToolBridge

ToolBridge is a production-ready Next.js 14 web app for EE/ECE students who need step-by-step help with EDA tool assignments. It focuses on structured troubleshooting for tools like Cadence Virtuoso, Spectre, ICCAP, Calibre, Vivado, and Quartus instead of generic chatbot answers.

## What ToolBridge Does

- Helps students describe an assignment problem in plain language.
- Calls Google Gemini through a server-side API route, defaulting to `gemini-2.5-flash`.
- Returns a structured solution with a summary, numbered steps, common mistakes, a success checkpoint, and a next-debugging direction.
- Supports responsive usage on desktop and mobile without auth, payments, or a database.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in your values:

```env
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Getting a Gemini API Key

1. Go to `https://aistudio.google.com`.
2. Sign in with your Google account.
3. Create a new API key from Google AI Studio.
4. Paste that key into `.env.local` as `GEMINI_API_KEY`.
5. If needed, set `GEMINI_MODEL` to a model that appears in your quota dashboard.

The free tier is enough for initial testing of this MVP.

## Google AdSense Setup Later

ToolBridge already includes marked ad slots for banner and inline placements.

To enable AdSense later:

1. Get your AdSense publisher ID from Google AdSense.
2. Add it to `.env.local` as `NEXT_PUBLIC_ADSENSE_CLIENT`.
3. Replace the placeholder slot IDs in `src/components/AdSlot.tsx` with your real AdSense slot IDs.
4. Deploy the site and finish any AdSense verification steps required for your domain.

If `NEXT_PUBLIC_ADSENSE_CLIENT` is not set, the app shows clear placeholders instead of live ads.

## Deploying to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the environment variables in the Vercel dashboard:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_ADSENSE_CLIENT` (optional)
4. Set `NEXT_PUBLIC_APP_URL` to your production URL.
5. Deploy.

The app uses only environment variables for secrets, so it is safe for standard Vercel deployment.

## Adding New Tools

Edit `src/lib/tools.ts` and add a new tool object with:

- `id`
- `name`
- `description`
- `commonProblems`

If you add a new tool:

1. Update the `ToolId` type in `src/types/index.ts`.
2. Add the new tool entry in `src/lib/tools.ts`.
3. The UI will automatically include it in the selector and example question list.

## Project Notes

- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS with system color scheme
- Structured Gemini API integration through `/api/solve`
- No database, auth, or payment setup in the MVP
