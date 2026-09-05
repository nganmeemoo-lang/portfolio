# Personal Portfolio — Dark / Electric Blue

A single-page, fully responsive personal profile site. Deep black / dark-blue
theme, scroll-reveal animations, and background music that auto-plays and
loops from your own MP3 file. No build step — plain HTML, CSS and JS.

## Structure

```
.
├── index.html                       # All markup, sections in the required order
├── css/style.css                     # Design tokens, layout, animations
├── js/script.js                       # Music playback, scroll reveal, hero canvas, form
├── background-music.mp3      # ← put your music file here
└── README.md
```

## Add your background music

1. Drop your MP3 file into `assets/` and name it exactly
   **`background-music.mp3`** (or update the `src` in the `<audio>` tag near
   the bottom of `index.html` to match your filename).
2. That's it — the `<audio loop>` element auto-plays and loops on its own.
   Browsers block audio-with-sound autoplay until the visitor interacts with
   the page at least once, so if it doesn't start immediately it will start
   on their first click, tap, key press, or scroll instead (this is a
   browser restriction, not a bug). The ♪ button bottom-right mutes/unmutes
   it at any time.
3. Keep the file reasonably small (a few MB) so it doesn't slow down the
   first page load — an MP3 around 128–192kbps is usually plenty for
   background music.

**A note on the source:** downloading audio from YouTube can conflict with
YouTube's Terms of Service and the copyright of whoever owns the track,
depending on the video's license. If this site is just for your own local
use that's your call, but before deploying it publicly it's worth either
using music you have the rights to, or a track from a royalty-free library
(e.g. YouTube Audio Library's downloadable tracks, Pixabay Music, or
Free Music Archive).

Section order (top to bottom): Hero → About Me → Education → Skills →
Health Status → Marital Status → Contact.

## Customize your content

Everything is placeholder content for "Alex Tran" — replace it with your own:

- **Hero**: `<h1 class="hero__title">` and tagline in `index.html`.
- **About**: the `<dl class="about__fields">` block — name, DOB, location, bio.
- **Education**: each `<li class="timeline__item">` in the Education section.
- **Skills**: edit the `<li class="skillbar">` labels and the `--level`
  percentage (0–100) on `.skillbar__fill`.
- **Status**: the two `.statuscard` blocks (health / marital).
- **Contact**: email, phone and social links in `.contact__details`. The
  contact form currently only shows a local confirmation message — wire
  `js/script.js`'s form handler to your own backend, or a service like
  [Formspree](https://formspree.io) or [Resend](https://resend.com), to
  actually receive messages.
- **Colors**: all in the `:root` block at the top of `css/style.css`
  (`--black`, `--bg-deep`, `--surface`, `--blue`, `--blue-bright`, etc).

## Run locally

No build step needed. Either:

- Open `index.html` directly in a browser, or
- Serve it (recommended, for correct relative paths):
  ```bash
  npx serve .
  # or
  python3 -m http.server 8080
  ```

## Deploy

### Vercel
1. Push this folder to a GitHub repository.
2. In Vercel: **New Project → Import Git Repository**.
3. Framework preset: **Other** (static site) — no build command, no output
   directory override needed (it serves `index.html` from the root).
4. Deploy.

### GitHub Pages
1. Push to GitHub.
2. Repo **Settings → Pages → Deploy from branch**, select `main` and `/root`.

## Performance & accessibility notes

- Scroll-triggered reveals use `IntersectionObserver` (not scroll-position
  polling) and unobserve after firing.
- The scroll-progress "spine" line updates via a single `requestAnimationFrame`-throttled
  scroll listener.
- The hero particle canvas pauses itself via `IntersectionObserver` when the
  hero is off-screen, and is capped to ~90 particles with a `devicePixelRatio`
  ceiling of 2 to stay smooth on mobile.
- `prefers-reduced-motion: reduce` disables the particle field and cross-fades
  content in immediately instead of animating.
- Background music plays from a single `<audio loop>` element pointing at
  your MP3. The script tries `play()` as soon as the page loads; if the
  browser's autoplay policy blocks audio without a gesture, it retries on
  the visitor's first click, key press, tap, or scroll, and fades the volume
  in smoothly either way. The ♪ button bottom-right mutes/unmutes it at any
  time.
