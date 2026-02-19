# Welcome animation & responsive updates

## Welcome animation (fully responsive)

The welcome screen shows **only on the home page** (`/`) the first time you visit in a session. It is a full-screen video with overlay text and a Skip button.

### Where it’s implemented

| Location | Role |
|----------|------|
| **`src/components/WelcomeGate.tsx`** | Renders `WelcomeScreen` when `pathname === "/"` and not dismissed; otherwise renders children (Navbar + main). Contains the responsive welcome UI. |
| **`src/app/layout.tsx`** | Wraps the app with `<WelcomeGate>` so the welcome can replace the whole layout (no Navbar) when shown. |

### Responsive behavior

- **Viewport:** `min-h-[100dvh]` and `min-h-screen` so it fills the screen on mobile (including dynamic viewport) and desktop.
- **Safe area:** Padding and Skip position use `env(safe-area-inset-*)` for notched devices and gesture bars.
- **Video:** `object-cover` + `object-center` so the video fills the screen on all aspect ratios.
- **Overlay:** Stronger gradient on small screens (`from-black/90`, `via-black/50`) for text readability.
- **Title:** `text-3xl` → `sm:text-5xl` → `md:text-6xl` → `lg:text-7xl`.
- **Subtitle:** `text-base` → `sm:text-lg` → `md:text-xl` → `lg:text-2xl` with responsive margins.
- **Skip button:** At least 44×44px touch target on mobile; position respects safe area insets.

### Asset

- **`public/welcome_animation.mp4`** — Used as the welcome background. Must exist for the welcome screen to show the video.

---

## Other updated pages (related to welcome / layout)

| Page / file | What was updated |
|-------------|-------------------|
| **`src/app/layout.tsx`** | Uses `WelcomeGate`; `data-theme="dark"`; no light mode. |
| **`src/app/page.tsx`** | Home page: hero copy, no typewriter, smooth 3D background overlay. Welcome is **not** rendered here — it’s rendered by `WelcomeGate` in layout when on `/`. |
| **`src/context/ThemeContext.tsx`** | Dark-only; sets `data-theme="dark"` on mount; no theme toggle. |
| **`src/components/Navbar.tsx`** | Theme toggle removed; responsive nav and mobile menu unchanged. |
| **`src/app/globals.css`** | Light theme removed; dark-only variables and styles. |

---

## Quick reference: when the welcome shows

1. User opens the app on **`/`** (home).
2. **WelcomeGate** checks `pathname === "/"` and `sessionStorage.getItem("ideaconnect_welcome_dismissed")`.
3. If not dismissed this session → only **WelcomeScreen** is rendered (full-screen, no Navbar).
4. User clicks **Skip** or the video **ends** → `sessionStorage` is set, **WelcomeGate** renders **Navbar** + **main** (home content).
5. On any other route, **WelcomeGate** always renders **Navbar** + **main** (no welcome).
