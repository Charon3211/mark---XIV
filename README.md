# Pulse — Workout Tracker

A single-page, dependency-free workout tracker using HTML, CSS and vanilla JavaScript.

## Features

- 7-day schedule: Push, Pull, Legs, Upper, Off, Lower, Cardio
- Starts on the user's current day
- Exercise-level completion
- Per-set tracking buttons
- Automatic exercise completion when all sets are logged
- Local persistence with `localStorage`
- Smooth day transitions and staggered exercise entrance
- Completion stamps and set-button motion feedback
- Full-session completion celebration
- Responsive desktop/tablet/mobile layout
- No build step, no framework, no external JavaScript dependencies
- GitHub Pages compatible

## Project structure

```text
gym-tracker/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Run locally

Because this is a static app, there is nothing to install.

### Option A — open directly

Double-click `index.html`.

### Option B — use a local server

With Python installed:

```bash
cd gym-tracker
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Clone

```bash
git clone https://github.com/YOUR_USERNAME/gym-tracker.git
cd gym-tracker
```

No `npm install` is required.

## Deploy to GitHub Pages

1. Create a GitHub repository, for example `gym-tracker`.
2. Put `index.html`, `styles.css`, `app.js`, and `README.md` in the repository root.
3. Commit and push:

```bash
git add .
git commit -m "Add Pulse workout tracker"
git push -u origin main
```

4. On GitHub, open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch and the `/ (root)` folder.
7. Save.

GitHub will publish the page at:

```text
https://YOUR_USERNAME.github.io/gym-tracker/
```

## How persistence works

Progress is stored under this browser key:

```text
pulse-workout-tracker-v1
```

The stored state contains:

- completed/manual exercise flags
- per-set completion flags
- selected day
- schema version

Clearing the site's browser storage resets the saved progress. The in-app **Reset week** button does the same intentionally.

## Animation notes

The UI uses CSS transitions and keyframe animations only:

- Day switching: enter/leave motion on the workout panel
- Exercise list: staggered entrance
- Set logging: scale/pop feedback and check reveal
- Exercise completion: animated completion stamp and checkbox bounce
- Session completion: layered ring/check celebration
- Progress bars: smooth width interpolation
- Reduced-motion support via `prefers-reduced-motion`

## Optional customization

Edit the `schedule` array near the top of `app.js` to change exercises, sets or rep ranges. No other code needs to change for normal workout-data edits.
