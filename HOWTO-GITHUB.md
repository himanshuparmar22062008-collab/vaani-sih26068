# GitHub + live site — first-year walkthrough

You do **not** need to be good at Git. Follow this once. After that the site updates itself.

Repo already exists:

https://github.com/himanshuparmar22062008-collab/vaani-sih26068

Live URL after you flip Pages on:

https://himanshuparmar22062008-collab.github.io/vaani-sih26068/

---

## 1. What GitHub is (30 seconds)

- A **repository** is a shared folder with history.
- A **commit** is a saved snapshot with a sentence describing the change.
- **Push** sends your snapshot to GitHub.
- **GitHub Pages** turns this folder into a public website.

This project is static HTML. No server. No paid hosting.

---

## 2. Turn the website on (do this first, 60 seconds)

1. Open the repo: https://github.com/himanshuparmar22062008-collab/vaani-sih26068
2. Click **Settings** (top menu of the repo, not your profile).
3. Left sidebar → **Pages**.
4. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
   - Click **Save**
5. Wait 1–2 minutes. Refresh this URL:

https://himanshuparmar22062008-collab.github.io/vaani-sih26068/

If you see 404, wait another minute and hard-refresh (`Ctrl+Shift+R`).

**Judge demo URL (bookmark this):**

https://himanshuparmar22062008-collab.github.io/vaani-sih26068/ask.html?demo=1&lang=hi

---

## 3. Invite the rest of the team

1. Repo → **Settings** → **Collaborators**
2. **Add people**
3. Type each teammate’s GitHub username
4. They accept the email

Everyone can then edit. Only one person needs to own the repo (you).

SIH rule reminder: 6 members, same institute, at least one woman.

---

## 4. Edit a file in the browser (no terminal)

Use this for names, typos, one-line copy.

1. Open the file on GitHub (example: `brief.html`)
2. Click the pencil icon
3. Edit
4. Scroll down → **Commit changes**
5. Wait ~1 minute. Pages rebuilds.

Do not delete `js/` or `css/` folders.

---

## 5. Work on your laptop (the real workflow)

### Install once

- Git: https://git-scm.com/downloads
- Optional: GitHub Desktop if the terminal feels scary — https://desktop.github.com

### First clone

```bash
git clone https://github.com/himanshuparmar22062008-collab/vaani-sih26068.git
cd vaani-sih26068
```

Open `index.html` in Chrome to work offline. Voice needs Chrome. Forecast needs internet.

### Every time you change something

```bash
git add .
git status
git commit -m "Short sentence about what you changed"
git push
```

If Git asks who you are, once:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@email.com"
```

If `git push` asks to login, use a GitHub **Personal Access Token** as the password, not your GitHub account password.

Create a token: GitHub → your avatar → Settings → Developer settings → Personal access tokens.

---

## 6. If two people edit the same file

```bash
git pull
```

If Git says “conflict”, open the file, keep the correct lines, delete the `<<<<<<<` markers, then:

```bash
git add .
git commit -m "Resolve conflict"
git push
```

Talk before two people edit `ask.html` at the same time.

---

## 7. Do not commit these

- API keys
- `.env` files
- `node_modules/`
- Anything that is a secret

This site needs **no keys**. Keep it that way.

---

## 8. Room-day checklist

- [ ] Pages URL opens on a phone
- [ ] `ask.html?demo=1&lang=hi` auto-asks Sehore
- [ ] Red banner says **Demo overlay · not live IMD**
- [ ] Campus card on Home shows a real temperature
- [ ] Team names filled on the last pitch slide / script
- [ ] One teammate has the URL already typed, not searching

Never claim the cyclone is live IMD.
