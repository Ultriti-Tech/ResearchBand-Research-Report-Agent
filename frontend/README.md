# ResearchMind Frontend Application

React 19 single-page application built with Vite and Tailwind CSS.

## Getting Started

### 1. Install dependencies

```powershell
Set-Location frontend
npm install
```

### 2. Environment Configuration

Create a `.env` or `.env.local` file in `frontend/`:

```dotenv
VITE_BASE_URL=http://127.0.0.1:8000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Run Development Server

```powershell
npm run dev
```

### 4. Production Build

```powershell
npm run build
```

## Features & UX Highlights

- **Mobile-Responsive Architecture**:
  - Collapsible navigation drawer on screens `< 768px` with compact credit status badge.
  - Sticky segmented control (`📄 Report` vs `💬 AI Assistant`) on screens `< 900px` for seamless view toggling without long page scrolling.
  - Responsive research prompt card with adaptive layout (`flex-col sm:flex-row`).
- **Research Workspace**:
  - Live progress tracking through Server-Sent Events (SSE).
  - Format customization modal allowing custom section and style instructions.
  - Interactive report viewer with tabbed Critique Review (`/10` score) and source links.
  - Report actions: In-place Markdown editing, Clipboard copy, and exports (Markdown, Word `.docx`, PDF print).
- **Report Assistant & Diff Editor**:
  - Conversational chat grounded in the report content (1 credit).
  - AI Edit Assistant proposing visual diff changes (2 credits) with Accept/Reject controls.
- **Billing & Plans**:
  - Modal overlay with Free, Top-up (50 credits), Monthly (600 credits), and Yearly (800 credits/mo) plans.
  - Razorpay Checkout SDK integration with automated payment verification and credit balance updates.

Release Versioning & Default Release Setup

Goal: Keep V1, V2, and V3 available at their own release URLs, while
making any one of them the default application at the root domain —
without changing the browser’s URL.

1. Expected URL behaviour

   ***

   URL What it should display

   ***

   https://researchand.ultriti.com/ Whichever release is selected as
   default

https://researchand.ultriti.com/releases/v1/ Version 1

https://researchand.ultriti.com/releases/v2/ Version 2

https://researchand.ultriti.com/releases/v3/ Version 3

---

For example, when V3 is the default, / internally serves the V3
application. The address bar stays at /; the browser is not redirected
to /releases/v3/.

---

2. Hosting folder structure

Inside your hosting account’s public_html directory, use this structure:

    public_html/
    ├── .htaccess
    └── releases/
        ├── v1/
        │   ├── index.html
        │   └── assets/
        ├── v2/
        │   ├── index.html
        │   └── assets/
        └── v3/
            ├── index.html
            └── assets/

Important: Upload the contents of each Vite dist folder into its
matching release folder.

For example, upload the contents of dist/ to public_html/releases/v2/.
Do not create an unwanted nested path such as
public_html/releases/v2/dist/.

---

3. Configure Vite

In vite.config.js (or vite.config.ts), use an environment variable for
the build base path:

    import { defineConfig } from "vite";
    import react from "@vitejs/plugin-react";

    export default defineConfig({
      plugins: [react()],
      base: process.env.VITE_BASE_PATH || "/"
    });

If your project already has a Vite configuration, keep its other
settings and adjust only the base setting. Do not create a second
defineConfig.

The build commands below assume Windows PowerShell and this
environment-variable setup.

---

4. Configure React Router to support both URLs

Each build must work in two places:

- Its own release URL, such as /releases/v2/.
- The root URL / when that release is selected as the default.

If you use BrowserRouter, calculate its basename from the current URL.

Example for your React entry file (often src/main.jsx or src/main.tsx):

    import React from "react";
    import ReactDOM from "react-dom/client";
    import { BrowserRouter } from "react-router-dom";
    import App from "./App";

    const releaseBase = import.meta.env.BASE_URL.replace(/\/$/, "");
    const pathname = window.location.pathname;

    const isReleaseUrl =
      pathname === releaseBase ||
      pathname.startsWith(`${releaseBase}/`);

    const basename = isReleaseUrl ? releaseBase : "";

    ReactDOM.createRoot(document.getElementById("root")).render(
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    );

Adapt the imports and component names to your project.

Important: If your application already has a router, do not add a
second BrowserRouter. Apply the basename logic to the router you
already use. This example is for BrowserRouter; it may need changes if
you use HashRouter, another router, or custom routing.

---

5. Build each version separately

Run these commands from your project directory in Windows PowerShell.

Build V1

    $env:VITE_BASE_PATH="/releases/v1/"
    npm run build

Upload the contents of dist/ to:

    public_html/releases/v1/

Build V2

    $env:VITE_BASE_PATH="/releases/v2/"
    npm run build

Upload the contents of dist/ to:

    public_html/releases/v2/

Build V3

    $env:VITE_BASE_PATH="/releases/v3/"
    npm run build

Upload the contents of dist/ to:

    public_html/releases/v3/

Build-order warning

A normal Vite build writes to dist/ each time. The next build overwrites
the previous local dist output.

Therefore:

1.  Build one version.
2.  Copy or upload its dist contents to the correct release folder.
3.  Only then build the next version.

Never upload a V2 build into the V1 or V3 folder.

To keep local copies, copy or rename each output after building, for
example dist-v1, dist-v2, and dist-v3.

---

6. Root .htaccess configuration

Place this .htaccess file in:

    public_html/.htaccess

The following example sets V2 as the default release.

    RewriteEngine On

    # ==========================================
    # DEFAULT RELEASE
    # Change v2 to v1 or v3 when required.
    # ==========================================
    RewriteRule ^$ /releases/v2/index.html [END]

    # ==========================================
    # ALLOW EXISTING FILES AND DIRECTORIES
    # This lets JS, CSS, images, and other assets load.
    # ==========================================
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [END]

    # ==========================================
    # RELEASE ROUTING
    # Keep V1, V2, and V3 independently accessible.
    # ==========================================
    RewriteRule ^releases/(v1|v2|v3)(/.*)?$ /releases/$1/index.html [END]

    # ==========================================
    # ROOT APPLICATION FALLBACK
    # Non-release application routes use the default.
    # ==========================================
    RewriteRule ^(?!releases/).*$ /releases/v2/index.html [END]

What these rules do

- / internally serves /releases/v2/index.html.
- Existing files and directories are served normally.
- /releases/v1/..., /releases/v2/..., and /releases/v3/... fall back
  to their own version’s index.html, which supports client-side React
  routes.
- Other root application routes fall back to the selected default
  version.

Apache compatibility: [END] requires Apache 2.4 or newer. If your
hosting provider uses an older version, ask the host which compatible
rewrite flag to use.

Before replacing your existing .htaccess: make a backup. If it contains
HTTPS, www/non-www, security, or caching rules, preserve and integrate
them rather than deleting them blindly. This setup also requires
mod_rewrite and permission for .htaccess overrides.

---

7. Change the default release

To switch the root application, change the version in both default
rewrite rules.

Make V1 the default

    RewriteRule ^$ /releases/v1/index.html [END]
    RewriteRule ^(?!releases/).*$ /releases/v1/index.html [END]

Make V2 the default

    RewriteRule ^$ /releases/v2/index.html [END]
    RewriteRule ^(?!releases/).*$ /releases/v2/index.html [END]

Make V3 the default

    RewriteRule ^$ /releases/v3/index.html [END]
    RewriteRule ^(?!releases/).*$ /releases/v3/index.html [END]

Only change the default target in these two rules. Keep the
release-routing rule unchanged so all three release URLs remain
independently accessible.

After saving .htaccess:

1.  Open the root URL in a private/incognito window.
2.  Test all three release URLs separately.
3.  Hard-refresh if old JavaScript or CSS is cached.

---

8. Result after switching the default

If V2 is the default

URL Result

---

/ V2 application
/releases/v1/ V1 application
/releases/v2/ V2 application
/releases/v3/ V3 application

If V3 is the default

URL Result

---

/ V3 application
/releases/v1/ V1 application
/releases/v2/ V2 application
/releases/v3/ V3 application

The root address remains /. There is no browser redirect to the release
folder.

---

9. Safe release and deployment workflow

Follow this process whenever you publish a new version:

1.  Keep the current default live. Do not overwrite the release
    currently serving production.
2.  Build the new version with its matching VITE_BASE_PATH.
3.  Upload it to a new release folder, such as releases/v3/.
4.  Test the release URL directly, for example
    https://researchand.ultriti.com/releases/v3/.
5.  Check page refreshes, internal navigation, images, CSS, JavaScript,
    API requests, and browser-console errors.
6.  Back up public_html/.htaccess.
7.  Change both default rewrite targets to the new release.
8.  Test the root URL in a private/incognito window.
9.  Keep the previous release folder untouched so you can roll back
    quickly.

Rollback

If the new default has a problem, change both default rewrite targets
back to the previous release.

For example, if V3 has an issue and V2 was the previous working version,
change both targets from v3 back to v2.

This rollback works only if the previous release folder has been kept
intact.

---

10. Troubleshooting checklist

Root page is blank

- Open Developer Tools → Console and Network.
- Check whether JavaScript or CSS files return 404.
- Confirm the Vite base path matches the release folder.
- Confirm that index.html and the assets/ directory were uploaded.

A release works, but refreshing a nested route gives 404

- Check that the release fallback rule is present in the root
  .htaccess.
- Confirm that Apache mod_rewrite and .htaccess overrides are enabled.

Root page loads, but navigation fails

- Confirm the BrowserRouter basename logic is in place.
- Confirm there are no nested or duplicate BrowserRouter components.
- Check for hard-coded absolute paths in the application.

Root shows the old version

- Confirm both default rewrite rules point to the same intended
  version.
- Clear browser or CDN cache if applicable.
- Check whether another .htaccess file or hosting cache is affecting
  the result.

A release URL shows the wrong version

- Check which build was uploaded to that release folder.
- Rebuild with the correct VITE_BASE_PATH.
- Upload the correct build to the matching release folder.

---

11. Final safety reminders

- ☐ Back up .htaccess before editing it.
- ☐ Keep a known-good release folder untouched.
- ☐ Build each version with its own Vite base path.
- ☐ Upload each build to the matching release directory.
- ☐ Test a new release at /releases/vN/ before making it default.
- ☐ Change both default rewrite targets together.
- ☐ Verify the root URL after switching.
- ☐ Keep the previous version available for rollback.

One final note: This setup handles frontend routing and release
selection. Also verify API URLs, environment variables, authentication
callback URLs, CORS settings, and service-worker caching in your
application.
