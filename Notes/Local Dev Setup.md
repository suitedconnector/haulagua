# Local Dev Setup

## Running the Frontend Without Local Strapi

You do **not** need to run Strapi locally. Point the frontend at the production Strapi on Render.

Create `frontend/.env.local` with:

```
NEXT_PUBLIC_STRAPI_URL=https://haulagua.onrender.com
STRAPI_API_TOKEN=<value of STRAPI_PROD_API_TOKEN from Vercel environment variables>
```

Then start the frontend dev server:

```bash
cd frontend
npm run dev
```

## Where to Find the Token

Vercel → haulagua project → Settings → Environment Variables → `STRAPI_PROD_API_TOKEN` → reveal and copy.

## Notes

- `frontend/.env.local` is gitignored — never commit it
- The code reads `STRAPI_API_TOKEN`, so use that name locally even though Vercel calls it `STRAPI_PROD_API_TOKEN`
