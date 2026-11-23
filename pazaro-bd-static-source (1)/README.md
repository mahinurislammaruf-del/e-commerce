# Pazaro BD — Static E-Commerce Package

## Publishing to GitHub + Netlify / Cloudflare Pages
1. Push all files in this folder to a GitHub repository.
2. Connect the repository to Netlify or Cloudflare Pages (Build command: leave blank, Publish directory: `/`).
3. Ensure `_redirects` is in the root so `/admin` routes cleanly to `index.html`.

## Creating Your Admin Account
1. Open Firebase Console -> Authentication -> Sign-in method -> Enable **Email/Password** and **Google**.
2. Go to Authentication -> Users -> Add user with your admin email & password (and verify email or add the UID to Firestore `admins/{uid}`).
3. Visit `/admin` on your live site and sign in!
