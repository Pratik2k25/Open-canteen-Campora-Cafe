# Open Canteen — Stage 1, Step 1.1: Branding & Asset Inventory (D3)
**Project**: Open Canteen (Transitioning from Campora Café)  
**Document**: Hardcoded Branding Dependencies & Replacement Register  
**Status**: Completed  
**Date**: October 2026  

---

## 1. Executive Summary

To make Open Canteen a true open-source, multi-tenant capable white-label application, all references to "Campora Café" must be decoupled from the core presentation logic. 

This inventory documents **every hardcoded brand string, asset, storage key, and document metadata item** currently present in the codebase, and maps each item to its corresponding future property in the `CanteenConfig` schema for Step 1.2.

---

## 2. Hardcoded Text & Metadata Register

| Category | File Location | Line Number | Current Hardcoded Value | Future `CanteenConfig` Path |
| :--- | :--- | :--- | :--- | :--- |
| **Document Title** | [`index.html`](file:///f:/Open-canteen-Campora-Cafe/index.html) | L6 | `<title>Campora Café</title>` | `config.identity.name` |
| **Meta Description** | [`index.html`](file:///f:/Open-canteen-Campora-Cafe/index.html) | L7, L9 | `...for Campora Café single-canteen service...` | `config.identity.description` |
| **PWA App Title** | [`index.html`](file:///f:/Open-canteen-Campora-Cafe/index.html) | L16 | `content="Campora"` | `config.identity.shortName` |
| **Theme Color** | [`index.html`](file:///f:/Open-canteen-Campora-Cafe/index.html) | L12 | `content="#FF5C38"` | `config.theme.primaryColor` |
| **PWA Manifest Name** | [`vite.config.ts`](file:///f:/Open-canteen-Campora-Cafe/vite.config.ts) | L17 | `name: 'Campora Café'` | `config.identity.name` |
| **PWA Manifest Short Name** | [`vite.config.ts`](file:///f:/Open-canteen-Campora-Cafe/vite.config.ts) | L18 | `short_name: 'Campora'` | `config.identity.shortName` |
| **PWA Manifest Description** | [`vite.config.ts`](file:///f:/Open-canteen-Campora-Cafe/vite.config.ts) | L19 | `...for Campora Café single-canteen service.` | `config.identity.description` |
| **Project Metadata** | [`metadata.json`](file:///f:/Open-canteen-Campora-Cafe/metadata.json) | L2 | `"name": "Campora-Cafe"` | `config.identity.name` |
| **Brand Logo Alt Text** | [`src/components/Header.tsx`](file:///f:/Open-canteen-Campora-Cafe/src/components/Header.tsx) | L30 | `alt="Campora Café - Good Food • Great Moods"` | `${config.identity.name} - ${config.identity.tagline}` |
| **Canteen Locations** | [`src/components/Header.tsx`](file:///f:/Open-canteen-Campora-Cafe/src/components/Header.tsx) | L16–20 | `Rajendra Nagar Terminal`, `Campora Campus Canteen • Block B`, etc. | `config.service.pickupLocations` |
| **Profile About Title** | [`src/pages/ProfilePage.tsx`](file:///f:/Open-canteen-Campora-Cafe/src/pages/ProfilePage.tsx) | L656, L995 | `About Campora Café` | `About ${config.identity.name}` |
| **Profile About Tagline** | [`src/pages/ProfilePage.tsx`](file:///f:/Open-canteen-Campora-Cafe/src/pages/ProfilePage.tsx) | L997 | `Good Food • Great Moods. Campora Café brings...` | `config.identity.aboutText` |
| **Profile Support Phone** | [`src/pages/ProfilePage.tsx`](file:///f:/Open-canteen-Campora-Cafe/src/pages/ProfilePage.tsx) | L857 | `+91 1800-CAMPORA` | `config.contact.supportPhone` |
| **Profile Support Email** | [`src/pages/ProfilePage.tsx`](file:///f:/Open-canteen-Campora-Cafe/src/pages/ProfilePage.tsx) | L861 | `help@camporacafe.in` | `config.contact.supportEmail` |
| **Profile Logout Title** | [`src/pages/ProfilePage.tsx`](file:///f:/Open-canteen-Campora-Cafe/src/pages/ProfilePage.tsx) | L1012 | `Log out of Campora Café?` | `Log out of ${config.identity.name}?` |
| **Profile Privacy Policy** | [`src/pages/ProfilePage.tsx`](file:///f:/Open-canteen-Campora-Cafe/src/pages/ProfilePage.tsx) | L981 | `...fulfilling your Campora Café orders on campus.` | `...fulfilling your ${config.identity.name} orders.` |
| **VEG Transition Footer** | [`src/utils/vegModeTransition.ts`](file:///f:/Open-canteen-Campora-Cafe/src/utils/vegModeTransition.ts) | L62, L79 | `brandFooter: 'CAMPORA CAFÉ'` | `config.identity.name.toUpperCase()` |
| **Placeholder Monogram** | [`src/pages/PlaceholderPage.tsx`](file:///f:/Open-canteen-Campora-Cafe/src/pages/PlaceholderPage.tsx) | L31 | `CC` | `config.identity.monogram` |
| **Menu Item ID/Name** | [`src/data/menuData.ts`](file:///f:/Open-canteen-Campora-Cafe/src/data/menuData.ts) | L160 | `id: 'campora-coffee'`, `name: 'Coffee'` | Generic dish catalog (Stage 4) |

---

## 3. Storage Keys & Event Names to Migrate

The application currently prefixes browser storage and custom window events with `campora_`. In Step 1.2, these will be upgraded to generic names with backward-compatible fallback reads.

| Current Key / Event | File | Proposed Open Canteen Key |
| :--- | :--- | :--- |
| `campora_cart` | `src/context/CartContext.tsx` | `opencanteen_cart` |
| `campora_service_mode` | `src/context/CartContext.tsx` | `opencanteen_service_mode` |
| `campora_orders_v2` | `src/context/OrderContext.tsx` | `opencanteen_orders_v2` |
| `campora_mock_profile_v1` | `src/pages/ProfilePage.tsx`, `src/utils/profileData.ts` | `opencanteen_profile_v1` |
| `campora_veg_only` | `src/utils/vegModeTransition.ts` | `opencanteen_veg_only` |
| `campora-veg-preference-change` | `src/utils/vegModeTransition.ts` | `opencanteen:veg-preference-change` |
| `#campora-main-surface` | `src/components/CustomerNavigationShell.tsx` | `#canteen-main-surface` |
| `#campora-profile-surface` | `src/components/CustomerNavigationShell.tsx` | `#canteen-profile-surface` |
| `#campora-floating-cart-target`| `src/components/FloatingCart.tsx` | `#canteen-floating-cart-target` |

---

## 4. Visual Media & Brand Asset Inventory

| Asset Path | Current Content | Brand Dependency Level | Step 1.2 Action |
| :--- | :--- | :--- | :--- |
| `/assets/brand-logo.png` | Campora Café script logo with chef hat | **High** (Hardcoded canteen logo) | Replace with configurable logo component + fallback text logo. |
| `/assets/profile/hero-food-illustration.png` | Chef hat, noodle bowl, coffee cup | **Medium** (Features Campora chef hat motif) | Retain as default artistic banner; allow custom header image. |
| `/assets/floating-cart/takeaway-bag-*.webp` | Kraft paper takeaway bag | **Low** (Neutral kraft bag, stylized cup) | Retain for cart physics; map to dynamic asset slots in Stage 4. |
| `/assets/floating-cart/delivery-*.webp` | Corrugated delivery box | **None** (Completely neutral cardboard box) | Retain as generic delivery container. |
| `/assets/floating-cart/dinein-*.webp` | Ceramic dinner plate | **None** (Completely neutral ceramic plate) | Retain as generic dine-in container. |
| `/assets/navigation/*-3d.webp` | 3D house, order bag, purple avatar | **None** (Universal UI iconography) | Retain as premium navigation asset family. |
| `/assets/categories/*.png` | 7 category icons (Sweets, Paratha, etc.) | **None** (Universal food categories) | Retain for standard Indian & campus canteen menus. |
| `/assets/menu/*.png` | 10 food & beverage photographs | **None** (Universal appetizing dish photos) | Retain as initial seed menu for Step 1.3. |

---

## 5. Proposed `CanteenConfig` Schema (Preview for Step 1.2)

```typescript
export interface CanteenConfig {
  identity: {
    id: string; // e.g., 'campora-cafe' or 'campus-bistro'
    name: string; // 'Campora Café'
    shortName: string; // 'Campora'
    monogram: string; // 'CC'
    tagline: string; // 'Good Food • Great Moods'
    description: string;
    logoUrl: string; // '/assets/brand-logo.png'
    aboutText: string;
  };
  contact: {
    supportPhone: string; // '+91 1800-CAMPORA'
    supportEmail: string; // 'help@camporacafe.in'
    operatingHours: string;
  };
  service: {
    pickupLocations: string[];
    allowedServiceModes: ('dinein' | 'takeaway' | 'delivery')[];
    defaultMode: 'dinein' | 'takeaway' | 'delivery';
    enableVegMode: boolean;
  };
  theme: {
    primaryColor: string; // '#F05360'
    dineinColor: string; // '#D2F8E1'
    takeawayColor: string; // '#FAF0E7'
    deliveryColor: string; // '#DEF0FE'
  };
}
```

This configuration will serve as the single source of truth starting in Step 1.2.
