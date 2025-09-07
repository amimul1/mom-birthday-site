# Mom's Birthday Site (static)

How to put this online in < 2 minutes:

Option A: **Netlify Drop** (easiest)
1. Go to https://app.netlify.com/drop
2. Drag the entire `mom-birthday-site` folder onto the page.
3. Netlify will upload and give you a public URL like `https://sparkly-name.netlify.app`.
4. Share that link with your mom!

Option B: **GitHub Pages**
1. Create a new repo, e.g., `mom-birthday-site`.
2. Upload the contents of this folder (keep the structure).
3. In repository Settings → Pages → set Branch to `main` and `/root`.
4. In a minute, your site will be at `https://<your-username>.github.io/mom-birthday-site/`.

Change the greeting text inside `index.html` if you want to personalize further.
Add/remove photos by placing `.jpg`/`.png` images inside `assets/images` and they will be picked up automatically only if you also update the HTML (the current build already lists all included images). For quick swaps, just replace the existing image files keeping their names.