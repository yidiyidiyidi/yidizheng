# Yidi Zheng — personal website

Static site, plain HTML/CSS (no build step). Hosted with GitHub Pages.

## Pages
- `index.html` — Bio (home page): photo and bio
- `research.html` — research & writing
- `conference.html` — conference presentations
- `sound.html` — DJ mixes (SoundCloud players + tracklists)
- `visual.html` — Cartography (map series)
- `film.css` — shared styles for all pages: white background with faint film grain, the name "Yidi Zheng 郑一荻", and the side menu (Bio / Research / Conference / Sound / Visual)
- `autoplay.js` — starts the NTS mix when someone enters the site and keeps it going across pages
- `yidi.jpg` — portrait
- `CNAME` — connects the custom domain yidizheng.info (don't delete)
- `sitemap.xml`, `robots.txt` — help Google find and index every page
- `territorial-errors.png` — map series image on the Visual page

## Publish on GitHub Pages
1. Create a new repository on GitHub (to get the URL `https://<username>.github.io`, name it `<username>.github.io`).
2. Upload all files in this folder to the repository root (**Add file → Upload files**), then commit.
3. Go to **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, and save.
4. The site will be live within a minute or two.

To edit later, open a file on GitHub, click the pencil icon, change it, and commit — the site updates automatically.
