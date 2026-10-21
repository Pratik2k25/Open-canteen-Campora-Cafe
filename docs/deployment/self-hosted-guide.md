# Open Canteen — Self-Hosted PWA Deployment & Operator Guide
**Stage 1 · Customer Food Ordering PWA**  
**Document Version:** 1.0.0 (Step 1.9 Finalization)

---

## 1. System Overview

Open Canteen is a self-hostable, single-operator, mobile-first Progressive Web App (PWA) designed for campus cafeterias, corporate canteens, and institutional dining halls. 

### Stage 1 Scope & Architecture
- **Customer Food Ordering Application**: Provides high-fidelity customer dining workflows across **Dine-in**, **Takeaway**, and **Delivery** service modes.
- **Local Mock Data Architecture**: Stage 1 operates entirely client-side using deterministic in-memory and `localStorage` mock adapters (`MockMenuAdapter`, `MockOrderAdapter`, `MockProfileAdapter`).
- **No Live Backend in Stage 1**: No real payment gateway, physical kitchen printer, or live cloud database is connected in Stage 1. Orders placed are simulated demonstration records stored locally in the browser.
- **Independent Canteen White-Labeling**: Single-operator deployments can be branded independently (colors, names, short names, and icons) without editing application source code.

---

## 2. Prerequisites & Environment

| Requirement | Supported Version | Notes |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.0.0` (LTS recommended) | Required for build and preview tooling |
| **Bun** (Optional) | `>= 1.1.0` | Ultra-fast local development and unit test runner |
| **npm / pnpm** | Any modern package manager | Alternative to Bun |
| **Web Browser** | Chromium 100+, Safari 16.4+, Firefox 115+ | Requires Service Worker and Cache Storage support |
| **Hosting Platform** | Static File Server / CDN | Nginx, Caddy, Vercel, Netlify, Cloudflare Pages, S3+CloudFront |

---

## 3. Installation & Local Development

### Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/Pratik2k25/Open-canteen-Campora-Cafe.git
cd Open-canteen-Campora-Cafe

# Install dependencies using Bun (preferred) or npm
bun install
# or: npm install
```

### Launch Development Server
```bash
# Starts local Vite development server on port 3000
bun run dev
# or: npm run dev
```
Navigate to `http://localhost:3000/` in your browser.

### Run Verification & Unit Test Suite
```bash
# Run complete functional regression suite (130 unit tests across 16 files)
bun run test:unit

# Run TypeScript typecheck
bun run lint
```

---

## 4. Production Build & Preview

### Building the Production Bundle
```bash
bun run build
# or: npm run build
```
This produces an optimized production bundle in the `dist/` directory with:
- Code-split vendor and application chunks (`vendor-react`, `vendor-libs`, `index-*.js`, `index-*.css`).
- Offline Service Worker (`dist/sw.js`) and Workbox runtime (`dist/workbox-*.js`).
- PWA Web App Manifest (`dist/manifest.webmanifest`).
- Dynamically branded HTML (`dist/index.html`) matching the configured operator.

### Testing the Production Preview Locally
```bash
bun run preview
# or: npm run preview
```
Opens a local HTTP preview server serving the production `dist/` directory to test service worker installation, caching, and offline behavior.

---

## 5. Production Hosting Requirements

### A. Strict HTTPS Enforcement
PWAs and Service Workers require a secure context (**HTTPS**) to register and control network requests.
- **Localhost Exception**: Browsers allow `http://localhost` and `http://127.0.0.1` as development exceptions.
- **Production Requirement**: Production deployments **must** serve over valid HTTPS with TLS certificates (e.g. Let's Encrypt, Cloudflare SSL, AWS ACM). Unencrypted HTTP will disable Service Worker registration and PWA installation.

### B. Single Page Application (SPA) Route Fallback
Open Canteen uses client-side routing (`/orders`, `/orders/:id`, `/profile`, `/cart`, `/checkout`, `/order-confirmation/:id`). The web server must rewrite all non-file navigation requests to `/index.html`.

#### Nginx Configuration Example:
```nginx
server {
    listen 443 ssl http2;
    server_name canteen.example.com;

    root /var/www/open-canteen/dist;
    index index.html;

    # Gzip / Brotli compression
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # Service Worker & Manifest: Never cache sw.js or manifest
    location ~* (sw\.js|manifest\.webmanifest)$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }

    # Static assets with content hashing: Immutable cache for 1 year
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # SPA rewrite fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Caddy Configuration Example:
```caddy
canteen.example.com {
    root * /var/www/open-canteen/dist
    encode zstd gzip
    try_files {path} /index.html
    file_server

    @pwaFiles {
        path /sw.js /manifest.webmanifest
    }
    header @pwaFiles Cache-Control "no-cache, no-store, must-revalidate"
}
```

#### Vercel Configuration (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(sw.js|manifest.webmanifest)",
      "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
    }
  ]
}
```

---

## 6. Operator Branding & White-Label Configuration

Open Canteen is designed so an operator can deploy their own branded canteen without modifying React component source files.

### A. Environment Configuration (`.env`)
Create a `.env.production` or set environment variables in your CI/CD deployment pipeline:

```bash
# Operator Identity
VITE_CANTEEN_ID=campus-bistro
VITE_CANTEEN_APP_NAME="Campus Bistro"
VITE_CANTEEN_SHORT_NAME="Bistro"
VITE_CANTEEN_DESCRIPTION="Fresh campus dining, coffee, and daily meals at Main Student Center."

# Visual Branding
VITE_CANTEEN_THEME_COLOR="#FF5C38"
VITE_CANTEEN_BG_COLOR="#12151B"

# Custom Operator Icon Paths (Optional - defaults to neutral icons if omitted)
# VITE_CANTEEN_ICON_192="/icons/custom/pwa-192x192.png"
# VITE_CANTEEN_ICON_512="/icons/custom/pwa-512x512.png"
# VITE_CANTEEN_ICON_MASKABLE="/icons/custom/pwa-maskable-512x512.png"
# VITE_CANTEEN_ICON_SVG="/icons/custom/icon.svg"
# VITE_CANTEEN_APPLE_ICON="/icons/custom/apple-touch-icon.png"
```

### B. Standard Presets
1. **Campora Café (`campora-cafe`)**:
   - The default baseline deployment.
   - Uses approved Campora Café logos, coffee cup motif, and campus pickup locations.
2. **Open Canteen Demonstration (`open-canteen`)**:
   - Clean, neutral open-source deployment.
   - Uses dining cloche motif and neutral Open Canteen branding.
   - Contains no Campora Café branding, phone numbers, or addresses.
3. **Custom Operator (`custom-id`)**:
   - Evaluates custom environment variables.
   - If custom icons are not supplied, falls back to neutral Open Canteen icons to prevent showing Campora Café branding to unrelated operators.

### C. Icon Preparation Requirements
To brand a deployment with custom home-screen icons, prepare the following square PNG images:
- `192x192` PNG: Standard mobile home screen launcher.
- `512x512` PNG: High-DPI splash and store representation (`purpose: 'any'`).
- `512x512` Maskable PNG: Adaptive circular/squircle icon with 10% safe margin (`purpose: 'maskable'`).
- `180x180` PNG: iOS Safari Apple Touch Icon.
- `SVG` or `32x32` ICO: Desktop browser favicon.

You can use the built-in generator script to generate icons:
```bash
node scripts/generate-all-icons.mjs
```

---

## 7. Service Worker & Update Lifecycle

### Controlled Update Notification (`registerType: 'prompt'`)
Open Canteen uses a **controlled update strategy** rather than automatic page reload. In a customer food ordering application, sudden automatic reloads can wipe custom cooking notes or disrupt active checkout.

1. **Detection**: The background service worker checks for new versions periodically (every 60 minutes) and upon navigation.
2. **Notification**: When an updated build is downloaded, a non-intrusive `PwaUpdatePrompt` appears at the top of the screen:
   - **Update Now**: Calls `updateServiceWorker(true)`, activates the new service worker via `SKIP_WAITING`, and reloads the application.
   - **Later**: Dismisses the notification for the active session without interrupting the user.
3. **Checkout Protection**: If the customer is on `/checkout`, the update prompt is suppressed to prevent any interference with payment selection or address entry.
4. **Data Persistence**: Updating the application preserves all cart contents, order history, profile data, and address book records in `localStorage`.

---

## 8. Offline Functionality & Demonstration Boundaries

### A. What Works Offline in Stage 1
- **Application Shell**: Full UI navigation across Home, Menu, Cart, Orders, Order Details, and Profile loads instantly without an active internet connection.
- **Product Browsing**: All menu items, descriptions, prices, categories, and cached imagery are available offline.
- **Local Cart Operations**: Adding, modifying, or removing items works seamlessly offline.
- **Mock Order Placement**: Orders submitted while offline are recorded locally in browser `localStorage` under `opencanteen:<operatorId>:orders`.
- **Status Indication**: When the network disconnects, an accessible `OfflineIndicator` status pill appears with `role="status"` and `aria-live="polite"`.

### B. What Does NOT Work Offline (Demonstration Boundary)
- **No Physical Kitchen Transmission**: Stage 1 orders are mock browser-local records. Placing an order while offline (or online) in Stage 1 records the order solely inside that browser. It does **not** transmit to a kitchen printer, POS terminal, or kitchen display.
- **No Automatic Background Sync**: There is no backend synchronization queue in Stage 1. Live synchronization will be implemented in Stage 3.
- **Image Fallbacks**: If an external image was never loaded before going offline, the application displays the built-in food-card fallback placeholder.

---

## 9. Resetting Mock Data & Data Hygiene

### Storage Architecture
All persistent state is stored in `localStorage` partitioned strictly by operator ID:
- Cart: `opencanteen:<operatorId>:opencanteen_cart`
- Service Mode: `opencanteen:<operatorId>:opencanteen_service_mode`
- Orders: `opencanteen:<operatorId>:opencanteen_orders_v2`
- Profile: `opencanteen:<operatorId>:opencanteen_profile_v1`
- VEG Preference: `opencanteen:<operatorId>:veg_only`

### Resetting Data in Browser
1. **Via UI**: In Profile → Account & Privacy → Clear Local Data, or by clearing browser site data in Developer Tools (`Application` → `Storage` → `Clear site data`).
2. **Graceful Rehydration**: If storage is wiped, the application does not crash. It automatically initializes clean default state (or seed demo orders if on Campora Café).

---

## 10. Future Stage Boundaries (Stage 2 & Stage 3)

| Capability | Stage 1 (Current) | Stage 2 (Upcoming) | Stage 3 (Production) |
| :--- | :--- | :--- | :--- |
| **Customer PWA** | Mock Data (Complete) | Maintained & Integrated | Live Backend Connected |
| **Admin Panel & KDS** | Not Started | Core Focus of Stage 2 | Live Kitchen Connected |
| **Authentication** | Mock Guest Session | Admin Auth (Email/PW) | Firebase / Phone OTP |
| **Database** | Browser `localStorage` | Mock/Local Admin Store | Google Cloud Firestore |
| **Media Hosting** | Local Static `/assets` | Local Asset Management | Cloudinary CDN |
| **Payments** | Simulated Demo Radios | Cash / POS Tracking | Real UPI / Razorpay |
| **Real Orders** | Browser Simulated Only | Local KDS Dispatch | End-to-End Live Orders |

---

*End of Self-Hosted Deployment Guide.*
