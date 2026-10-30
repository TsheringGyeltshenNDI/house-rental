# HouseRent

Free house and flat rental listings for Bhutan. Anyone can browse; owners log in
with Google to post, edit, mark as rented, or delete their listings. Listings
expire after 30 days unless renewed.

Built with Next.js 16 (Cache Components), Supabase (database, Google login,
photo storage) and Tailwind CSS.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Create the tables and storage bucket:** Dashboard → SQL Editor → paste
   [supabase/schema.sql](supabase/schema.sql) → Run.
3. **Turn on Google login:** Dashboard → Authentication → Sign In / Providers →
   Google. Add the Client ID and secret from Google Cloud Console, and add
   Supabase's callback URL (shown on that page) to the Google OAuth client.
4. **Allow redirects back to the site:** Authentication → URL Configuration →
   add `http://localhost:3000/auth/callback` and your production
   `https://<your-domain>/auth/callback` to **Redirect URLs**.
5. **Add environment variables:** copy `.env.example` to `.env.local` and fill
   in the Project URL and the publishable key from Project Settings → API Keys.
6. Run it:

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Pages

| Path                     | What it does                                            |
| ------------------------ | ------------------------------------------------------- |
| `/`                      | Browse and filter by dzongkhag, area, rent and bedrooms |
| `/listing/[id]`          | Photos, details, show phone / WhatsApp, report          |
| `/post`                  | Post a new listing (login required)                     |
| `/my-listings`           | Your listings: edit, mark rented, renew, delete         |
| `/my-listings/[id]/edit` | Edit a listing                                          |
| `/login`                 | Continue with Google                                    |

## Moderation

Reports from the "Report this listing" form go to the `reports` table. Review
them in Supabase → Table Editor → `reports`, and delete bad listings from the
`listings` table.

## Deploying

Deploy to Vercel (or any Node.js host), set the same two environment variables,
and add the production callback URL from step 4.
