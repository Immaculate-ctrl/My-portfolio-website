# Gift Thabanyane — Portfolio

A one-page portfolio told as a story in nine chapters, from a single mark to the process behind it:

I The Mark (logos) → II The Object (packaging) → III The System (identity) → IV The Page (layout)
→ V The Screen (web) → VI The Street (advertising) → VII The Motion → VIII The Lens (photography)
→ IX The Process (case studies) → Epilogue (contact)

The page starts at night and the colours shift chapter by chapter until it ends on a sunrise-orange "let's talk".

## Run it
1. Open this folder in VS Code.
2. Install the **Live Server** extension, right-click `index.html` → *Open with Live Server*.

No build step, no frameworks — plain HTML, CSS and JS.

## Images
All images and videos from the current Vercel site are included in this project, in the same folders it uses (`logos/`, `OVERVIEW/`, `aquaelite/`, `sunbird/`, `ARUNA/`, `yts/`, `lifeskills/`, `artfest/`, `layout/`, `web design/`, `advertisment/`, `photography/`, `breakfast/`, `molomzansi/`, `carloop/`, `infographs/`, `Lifeskillsvid/`, `Young talent vid/`, `casestudies/`).

To load them from the live site instead, set `window.ASSET_BASE = "https://my-portfolio-website-zxvk.vercel.app/";` in `js/data.js`.

Any missing image shows a striped placeholder with the project name instead of a broken icon.

## Editing content
Everything lives in `js/data.js`:
- `person` — name, roles (they rotate in the hero), intro line, email, phone, socials (add your Behance/LinkedIn URLs — currently `#`).
- `chapters` — each chapter's title, line, colour `tone`, layout and `items`.
- Add `thread: true` to any item to include it in the **Follow one idea** tour (currently the Youth Day Art Festival, traced from logo → identity → book → web → billboard).
- Motion items: add `video: A("folder/file.mp4")` and it plays in the viewer.
- The one-line "bridges" between chapters are at the top of `js/main.js` (`BRIDGES`).

## Interactions
Preloader sunrise · custom cursor with labels · hero letters that thicken toward the cursor (slow wave on phones) · rising sun on scroll · colour of the page changes per chapter · horizontal pinned logo rail · 3D tilt + glare on packaging · stacking identity cards · hover-peek list for editorial · self-scrolling browser mockups · scroll-driven street marquee · film-reel motion strip · drag-with-momentum photo gallery · full-screen chapter menu · lightbox with keyboard + swipe · "Follow one idea" guided tour · click-to-copy email.

Responsive down to 360px; touch devices get native swipes instead of cursor effects; respects *reduce motion*.

## Deploy
Push to the same GitHub repo Vercel is watching (replace the old `index.html`, keep the image folders) and Vercel redeploys automatically.
