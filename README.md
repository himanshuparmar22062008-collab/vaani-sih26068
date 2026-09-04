# VAANI — SIH26068 WeatherGPT

**The forecast that answers. The warning that interrupts.**

Team VAANI · IISER Bhopal · B.Tech EECS  
Problem: SIH26068 · Ministry of Earth Sciences · Disaster Management  
Title: *WeatherGPT: Conversational AI for Weather Forecasting, Alerts, and Climate Information*

Live site (after you turn on Pages — 60 seconds, see HOWTO-GITHUB.md):  
https://himanshuparmar22062008-collab.github.io/vaani-sih26068/

Judge demo:  
https://himanshuparmar22062008-collab.github.io/vaani-sih26068/ask.html?demo=1&lang=hi

Repository:  
https://github.com/himanshuparmar22062008-collab/vaani-sih26068

**First time with GitHub?** Open [HOWTO-GITHUB.md](HOWTO-GITHUB.md). Flip Settings → Pages on before anything else.

## What this is

A warning-first conversational weather assistant for India.

- Ask in Hindi or English (type or speak)
- Live forecast from Open-Meteo, MET Norway fallback
- Official-style warnings quoted **verbatim** before the routine answer
- Judge-demo cyclone overlay is **labelled** — never faked as live IMD
- Climate is treated as a thirty-year memory, not a vibe
- Latency printed on every answer

This is a static site so a first-year team can put it on GitHub Pages with no server and no API keys.

## Pages

| File | What the jury sees |
|---|---|
| `index.html` | Thesis + campus nowcast + jury pack |
| `ask.html` | Live console. `ask.html?demo=1&lang=hi` auto-asks Sehore |
| `alerts.html` | Twelve-city board |
| `climate.html` | The word most teams skip |
| `pitch.html` | 12-slide deck, arrow keys |
| `brief.html` | 90-second speaker script |
| `system.html` | Architecture mapped to the PS |

## Turn the site on (GitHub Pages) — 60 seconds

1. Open the repo on GitHub.
2. Click **Settings**.
3. Left sidebar → **Pages**.
4. Source: **Deploy from a branch** → Branch **main** → folder **/ (root)** → Save.
5. Wait one minute. Open  
   `https://himanshuparmar22062008-collab.github.io/vaani-sih26068/`

If the first load 404s, wait another minute and hard-refresh.

## How GitHub works (for the team)

GitHub is a folder in the cloud with history. Each change is a **commit**. The public copy of this project is a **repository**.

### On your laptop (after installing Git)

```bash
git clone https://github.com/himanshuparmar22062008-collab/vaani-sih26068.git
cd vaani-sih26068
```

Edit a file. Then:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

Pages rebuilds itself after each push to `main`.

### If you have never used Git

You do not need the terminal for small edits:

1. Open any file on GitHub.
2. Click the pencil icon.
3. Edit. Scroll down. **Commit changes**.

That is enough for names on the title slide.

## Demo in the room

1. Open `ask.html?demo=1&lang=hi`
2. The Sehore rain question fires itself
3. Point at the red banner: **Demo overlay · not live IMD**
4. Point at milliseconds, model, issue time
5. Invite a judge to check Mausam

Do not claim the cyclone is live.

## Team rules (SIH)

- 6 members, same institute
- At least one woman
- Fill names on `brief.html` / the pitch before you walk in

## Stack

- Static HTML / CSS / JS
- Open-Meteo forecast API (browser, no key)
- MET Norway locationforecast fallback
- Web Speech API (`hi-IN` / `en-IN`)
- IMD rainfall intensity classes on derived warnings

No GPU. No secret keys in this repo. Never commit `.env` files.

## License

MIT — use it, fork it, present it. Credit Team VAANI · IISER Bhopal when you show it.
