/**
 * OPEN CANTEEN — CANTEEN CONFIGURATION SCHEMA & PRESETS
 * Stage 1 · Step 1.2 · Task 1.2.1
 *
 * Provides a strongly typed, centralized configuration contract for white-labeling
 * and multi-tenant canteen branding across the Customer PWA.
 *
 * Distinguishes between:
 * 1. CanteenConfig: The fully resolved, normalized configuration consumed safely by UI.
 * 2. CanteenConfigInput: Operator-provided configuration with only id & displayName required.
 */

// ============================================================================
// 1. Core Configuration Interfaces (Normalized Contract)
// ============================================================================

export interface CanteenIdentity {
  /** Unique operator slug/identifier (e.g. 'open-canteen' or 'campora-cafe') */
  readonly id: string;
  /** Primary customer-facing display name (e.g. 'Open Canteen' or 'Campora Café') */
  readonly displayName: string;
  /** Short name for compact mobile headers and app labels (e.g. 'Campora') */
  readonly shortName: string;
  /** 2-letter uppercase monogram used for typographic logo fallbacks (e.g. 'OC', 'CC') */
  readonly monogram: string;
  /** Brand tagline or motto (e.g. 'Good Food • Great Moods') */
  readonly tagline: string;
  /** Public description for metadata and search */
  readonly description: string;
  /** Main brand logo image URL (optional, UI falls back to typographic monogram if undefined) */
  readonly logoUrl?: string;
  /** Square avatar/emblem URL (optional) */
  readonly avatarUrl?: string;
}

export interface CanteenBranding {
  /** Primary brand accent hex color (e.g. '#FF5C38') */
  readonly primaryColor: string;
  /** Contrasting text color for primary backgrounds (e.g. '#FFFFFF') */
  readonly primaryTextColor: string;
  /** Optional secondary accent color hex (e.g. '#36B871') */
  readonly accentColor?: string;
}

export interface CanteenLocation {
  /** Primary campus or facility title (e.g. 'Campus Cafeteria' or 'Rajendra Nagar Terminal') */
  readonly displayLocation: string;
  /** Selectable pickup counters, gates, or campus zones (at least 1 guaranteed) */
  readonly pickupLocations: readonly string[];
  /** Optional physical address line (undefined if operator has not supplied one) */
  readonly addressLine?: string;
  /** Optional map/directions URL */
  readonly mapUrl?: string;
}

export interface CanteenContact {
  /** Support phone number (undefined if operator has not supplied one) */
  readonly supportPhone?: string;
  /** Support email address (undefined if operator has not supplied one) */
  readonly supportEmail?: string;
  /** Human-readable operating hours (e.g. 'Mon – Sat: 8:00 AM – 10:00 PM') */
  readonly operatingHours?: string;
  /** Optional official website URL */
  readonly websiteUrl?: string;
}

export interface CanteenContent {
  /** Heading displayed on the Profile About screen (e.g. 'About Campora Café') */
  readonly aboutTitle: string;
  /** Main narrative paragraph about the canteen */
  readonly aboutBody: string;
  /** Optional custom narrative for the About Your Canteen page */
  readonly canteenStory?: string;
  /** Optional custom service description for How We Serve You */
  readonly servicesDescription?: string;
  /** Optional customer privacy notice (undefined if not provided) */
  readonly privacyNotice?: string;
  /** Footer copyright notice */
  readonly footerCopyright: string;
}

export interface CanteenPWA {
  /** Application title for PWA install dialogs and window titles */
  readonly appName: string;
  /** Short name for home screen launcher icon */
  readonly shortName: string;
  /** Description for PWA manifest */
  readonly description: string;
  /** Mobile status bar / theme color */
  readonly themeColor: string;
  /** PWA splash screen background color */
  readonly backgroundColor: string;
}

export interface CanteenLegal {
  /** Registered legal/operator business name (e.g. 'Campora Hospitality Services Pvt. Ltd.') */
  readonly operatorLegalName?: string;
  /** Official registered address of the operator */
  readonly registeredAddress?: string;
  /** Designated privacy contact email */
  readonly privacyContactEmail?: string;
  /** Official effective date for customer policies */
  readonly policyEffectiveDate?: string;
  /** Current published version of the canteen's legal policies */
  readonly policyVersion?: string;
  /** Optional operator-provided cancellation & refund policy guidelines */
  readonly cancellationPolicyText?: string;
  /** Verified software license for this deployment (if published) */
  readonly softwareLicense?: string;
}

/**
 * Normalized Canteen Configuration
 * Guaranteed complete and non-null for all presentation components.
 */
export interface CanteenConfig {
  readonly identity: CanteenIdentity;
  readonly branding: CanteenBranding;
  readonly location: CanteenLocation;
  readonly contact: CanteenContact;
  readonly content: CanteenContent;
  readonly pwa: CanteenPWA;
  readonly legal: CanteenLegal;
}

// ============================================================================
// 2. Operator Input Contract (Partial / Overridable)
// ============================================================================

export interface CanteenIdentityInput {
  /** Required: Unique slug/id */
  readonly id: string;
  /** Required: Display name */
  readonly displayName: string;
  /** Optional: If omitted, derived from displayName */
  readonly shortName?: string;
  /** Optional: If omitted, derived from initials of displayName */
  readonly monogram?: string;
  /** Optional: Brand tagline */
  readonly tagline?: string;
  /** Optional: Public description */
  readonly description?: string;
  /** Optional: Image URL for brand logo */
  readonly logoUrl?: string;
  /** Optional: Image URL for avatar */
  readonly avatarUrl?: string;
}

export interface CanteenBrandingInput {
  readonly primaryColor?: string;
  readonly primaryTextColor?: string;
  readonly accentColor?: string;
}

export interface CanteenLocationInput {
  readonly displayLocation?: string;
  readonly pickupLocations?: readonly string[];
  readonly addressLine?: string;
  readonly mapUrl?: string;
}

export interface CanteenContactInput {
  readonly supportPhone?: string;
  readonly supportEmail?: string;
  readonly operatingHours?: string;
  readonly websiteUrl?: string;
}

export interface CanteenContentInput {
  readonly aboutTitle?: string;
  readonly aboutBody?: string;
  readonly canteenStory?: string;
  readonly servicesDescription?: string;
  readonly privacyNotice?: string;
  readonly footerCopyright?: string;
}

export interface CanteenPWAInput {
  readonly appName?: string;
  readonly shortName?: string;
  readonly description?: string;
  readonly themeColor?: string;
  readonly backgroundColor?: string;
}

export interface CanteenLegalInput {
  readonly operatorLegalName?: string;
  readonly registeredAddress?: string;
  readonly privacyContactEmail?: string;
  readonly policyEffectiveDate?: string;
  readonly policyVersion?: string;
  readonly cancellationPolicyText?: string;
  readonly softwareLicense?: string;
}

/**
 * Operator Input Configuration
 * Only `identity.id` and `identity.displayName` are required.
 * All other fields are optional and resolve to safe, non-fabricated defaults.
 */
export interface CanteenConfigInput {
  readonly identity: CanteenIdentityInput;
  readonly branding?: CanteenBrandingInput;
  readonly location?: CanteenLocationInput;
  readonly contact?: CanteenContactInput;
  readonly content?: CanteenContentInput;
  readonly pwa?: CanteenPWAInput;
  readonly legal?: CanteenLegalInput;
}

// ============================================================================
// 3. Pure Helpers for Fallback Derivation
// ============================================================================

/**
 * Derives a clean 2-character monogram from a display name.
 * Examples:
 * - "Open Canteen" -> "OC"
 * - "Campora Café" -> "CC"
 * - "Cafeteria" -> "CA"
 * - "My Home" -> "MH"
 */
export function deriveMonogram(name: string): string {
  const cleaned = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  if (!cleaned) return 'OC';

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

/**
 * Derives a compact short name from a display name (first word or max 14 chars).
 * Examples:
 * - "Campora Café" -> "Campora"
 * - "Open Canteen" -> "OpenCanteen"
 */
export function deriveShortName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Canteen';

  const firstWord = trimmed.split(/\s+/)[0];
  if (firstWord.length >= 2 && firstWord.length <= 16) {
    return firstWord;
  }
  return trimmed.slice(0, 16);
}

// ============================================================================
// 4. Default Presets
// ============================================================================

/**
 * Generic Open Canteen Preset
 * Clean open-source baseline. Contains no Campora Café branding, no fabricated
 * telephone numbers, physical addresses, or misleading legal statements.
 */
export const OPEN_CANTEEN_PRESET: CanteenConfig = Object.freeze({
  identity: Object.freeze({
    id: 'open-canteen',
    displayName: 'Open Canteen',
    shortName: 'OpenCanteen',
    monogram: 'OC',
    tagline: 'Modern Digital Canteen Experience',
    description: 'Modular, open-source canteen ordering and digital dining for campus and institutional dining.',
    logoUrl: '/assets/branding/open-canteen-logo.png',
  }),
  branding: Object.freeze({
    primaryColor: '#166534',
    primaryTextColor: '#FFFFFF',
    accentColor: '#FB4816',
  }),
  location: Object.freeze({
    displayLocation: 'Central Dining Hall',
    pickupLocations: Object.freeze([
      'Counter 1 • Fresh Food & Meals',
      'Counter 2 • Quick Bites & Snacks',
      'Counter 3 • Coffee & Beverages',
    ]),
  }),
  contact: Object.freeze({
    operatingHours: '8:00 AM – 10:00 PM',
  }),
  content: Object.freeze({
    aboutTitle: 'About Open Canteen',
    aboutBody:
      'Open Canteen is a modern, modular, open-source food ordering platform designed for campus dining, corporate cafeterias, and institutional dining halls.',
    footerCopyright: `© ${new Date().getFullYear()} Open Canteen. All rights reserved.`,
  }),
  pwa: Object.freeze({
    appName: 'Open Canteen',
    shortName: 'Open Canteen',
    description: 'Modern digital canteen ordering and dining experience.',
    themeColor: '#166534',
    backgroundColor: '#F8F9FA',
  }),
  legal: Object.freeze({}),
});

/**
 * Campora Café Development Preset
 * Matches 100% of the verified Step 1.1 audit baseline:
 * - Brand logo: /assets/brand-logo.png
 * - Tagline: Good Food • Great Moods
 * - Existing development mock contact values: +91 1800-CAMPORA, help@camporacafe.in
 * - 4 verified campus pickup locations
 */
export const CAMPORA_CAFE_PRESET: CanteenConfig = Object.freeze({
  identity: Object.freeze({
    id: 'campora-cafe',
    displayName: 'Campora Café',
    shortName: 'Campora',
    monogram: 'CC',
    tagline: 'Good Food • Great Moods',
    description: 'Campora Café single-canteen digital service. Fast, fresh dining on campus.',
    logoUrl: '/assets/brand-logo.png',
  }),
  branding: Object.freeze({
    primaryColor: '#FF5C38',
    primaryTextColor: '#FFFFFF',
    accentColor: '#36B871',
  }),
  location: Object.freeze({
    displayLocation: 'Rajendra Nagar Terminal, Gate No...',
    pickupLocations: Object.freeze([
      'Rajendra Nagar Terminal, Gate No...',
      'Campora Campus Canteen • Block B',
      'Main Library Courtyard, Desk 12',
      'Hostel Block C Common Lounge',
    ]),
  }),
  contact: Object.freeze({
    supportPhone: '+91 1800-CAMPORA', // Existing development mock data
    supportEmail: 'help@camporacafe.in', // Existing development mock data
    operatingHours: 'Mon – Sat: 8:00 AM – 10:00 PM',
  }),
  content: Object.freeze({
    aboutTitle: 'About Campora Café',
    aboutBody:
      'Good Food • Great Moods. Campora Café brings fresh, chef-prepared meals, beverages, and quick bites directly to campus students and staff.',
    privacyNotice:
      'We collect order history and preference data solely for fulfilling your Campora Café orders on campus.',
    footerCopyright: `© ${new Date().getFullYear()} Campora Café. All rights reserved.`,
  }),
  pwa: Object.freeze({
    appName: 'Campora Café',
    shortName: 'Campora',
    description: 'Campora Café single-canteen digital service. Fast, fresh dining on campus.',
    themeColor: '#FF5C38',
    backgroundColor: '#F8F9FA',
  }),
  legal: Object.freeze({
    operatorLegalName: 'Campora Café Services',
    registeredAddress: 'Campora Campus Center, Tech Park North, Bengaluru, Karnataka 560100',
    privacyContactEmail: 'help@camporacafe.in',
    policyEffectiveDate: 'October 2026',
    policyVersion: 'v1.0.0',
    cancellationPolicyText:
      'Orders in placed, confirmed, or preparing status may be cancelled by the customer before delivery or completion. Uncollected or cancelled orders do not incur cancellation penalty fees.',
    softwareLicense: 'Pending formal repository release',
  }),
});

/**
 * Registered System Presets
 */
export const CANTEEN_PRESETS: Readonly<Record<string, CanteenConfig>> = Object.freeze({
  'open-canteen': OPEN_CANTEEN_PRESET,
  'campora-cafe': OPEN_CANTEEN_PRESET, // Legacy ID normalized to Open Canteen
});

/**
 * Default preset for the application — Open Canteen is the sole active brand.
 */
export const DEFAULT_CANTEEN_PRESET: CanteenConfig = OPEN_CANTEEN_PRESET;

// ============================================================================
// 5. Immutable Configuration Resolver
// ============================================================================

/**
 * Resolves and normalizes an operator input configuration against a base preset.
 *
 * Rules:
 * - Requires non-empty `identity.id` and `identity.displayName`.
 * - Deeply merges overrides immutably without mutating input or base preset.
 * - Missing presentation values (shortName, monogram) are dynamically derived.
 * - Missing business data (phone, email, address, legal notices) are NOT fabricated.
 *
 * @param input Operator-supplied configuration overrides
 * @param base Base configuration preset to inherit from (defaults to OPEN_CANTEEN_PRESET)
 * @returns Fully normalized, frozen CanteenConfig
 */
export function resolveCanteenConfig(
  input: CanteenConfigInput,
  base: CanteenConfig = OPEN_CANTEEN_PRESET
): CanteenConfig {
  if (!input || typeof input !== 'object') {
    throw new TypeError('resolveCanteenConfig: input configuration must be a valid object');
  }

  const rawId = input.identity?.id?.trim();
  const rawDisplayName = input.identity?.displayName?.trim();

  if (!rawId) {
    throw new Error('resolveCanteenConfig: identity.id is required and cannot be empty');
  }
  if (!rawDisplayName) {
    throw new Error('resolveCanteenConfig: identity.displayName is required and cannot be empty');
  }

  // Derive identity fallbacks
  const shortName = input.identity.shortName?.trim() || deriveShortName(rawDisplayName);
  const monogram = input.identity.monogram?.trim().toUpperCase() || deriveMonogram(rawDisplayName);
  const tagline = input.identity.tagline?.trim() ?? (input.identity.id === base.identity.id ? base.identity.tagline : '');
  const description = input.identity.description?.trim() ?? (input.identity.id === base.identity.id ? base.identity.description : `Digital dining and ordering for ${rawDisplayName}.`);
  const logoUrl = input.identity.logoUrl?.trim() || undefined;
  const avatarUrl = input.identity.avatarUrl?.trim() || undefined;

  // Resolve branding
  const primaryColor = input.branding?.primaryColor?.trim() || base.branding.primaryColor;
  const primaryTextColor = input.branding?.primaryTextColor?.trim() || base.branding.primaryTextColor;
  const accentColor = input.branding?.accentColor?.trim() || base.branding.accentColor;

  // Resolve location
  const displayLocation = input.location?.displayLocation?.trim() || `${rawDisplayName} Counter`;
  const rawPickupLocations = input.location?.pickupLocations;
  const pickupLocations =
    Array.isArray(rawPickupLocations) && rawPickupLocations.length > 0
      ? Object.freeze(rawPickupLocations.map((loc) => loc.trim()).filter(Boolean))
      : Object.freeze([`${rawDisplayName} Pickup Station`]);
  const addressLine = input.location?.addressLine?.trim() || undefined;
  const mapUrl = input.location?.mapUrl?.trim() || undefined;

  // Resolve contact (no fabricated phone/email)
  const supportPhone = input.contact?.supportPhone?.trim() || undefined;
  const supportEmail = input.contact?.supportEmail?.trim() || undefined;
  const operatingHours = input.contact?.operatingHours?.trim() || undefined;
  const websiteUrl = input.contact?.websiteUrl?.trim() || undefined;

  // Resolve content
  const aboutTitle = input.content?.aboutTitle?.trim() || `About ${rawDisplayName}`;
  const aboutBody =
    input.content?.aboutBody?.trim() ||
    `Welcome to ${rawDisplayName}. Enjoy fresh meals, quick ordering, and seamless dining.`;
  const canteenStory = input.content?.canteenStory?.trim() || undefined;
  const servicesDescription = input.content?.servicesDescription?.trim() || undefined;
  const privacyNotice = input.content?.privacyNotice?.trim() || undefined;
  const footerCopyright =
    input.content?.footerCopyright?.trim() ||
    `© ${new Date().getFullYear()} ${rawDisplayName}. All rights reserved.`;

  // Resolve PWA metadata
  const appName = input.pwa?.appName?.trim() || rawDisplayName;
  const pwaShortName = input.pwa?.shortName?.trim() || shortName;
  const pwaDescription = input.pwa?.description?.trim() || description;
  const themeColor = input.pwa?.themeColor?.trim() || primaryColor;
  const backgroundColor = input.pwa?.backgroundColor?.trim() || '#F8F9FA';

  // Resolve legal policies and operator compliance
  const operatorLegalName = input.legal?.operatorLegalName?.trim() || base.legal?.operatorLegalName;
  const registeredAddress = input.legal?.registeredAddress?.trim() || base.legal?.registeredAddress;
  const privacyContactEmail = input.legal?.privacyContactEmail?.trim() || base.legal?.privacyContactEmail;
  const policyEffectiveDate = input.legal?.policyEffectiveDate?.trim() || base.legal?.policyEffectiveDate;
  const policyVersion = input.legal?.policyVersion?.trim() || base.legal?.policyVersion;
  const cancellationPolicyText = input.legal?.cancellationPolicyText?.trim() || base.legal?.cancellationPolicyText;
  const softwareLicense = input.legal?.softwareLicense?.trim() || base.legal?.softwareLicense;

  // Construct immutable normalized configuration
  return Object.freeze({
    identity: Object.freeze({
      id: rawId,
      displayName: rawDisplayName,
      shortName,
      monogram,
      tagline,
      description,
      ...(logoUrl ? { logoUrl } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
    }),
    branding: Object.freeze({
      primaryColor,
      primaryTextColor,
      ...(accentColor ? { accentColor } : {}),
    }),
    location: Object.freeze({
      displayLocation,
      pickupLocations,
      ...(addressLine ? { addressLine } : {}),
      ...(mapUrl ? { mapUrl } : {}),
    }),
    contact: Object.freeze({
      ...(supportPhone ? { supportPhone } : {}),
      ...(supportEmail ? { supportEmail } : {}),
      ...(operatingHours ? { operatingHours } : {}),
      ...(websiteUrl ? { websiteUrl } : {}),
    }),
    content: Object.freeze({
      aboutTitle,
      aboutBody,
      ...(canteenStory ? { canteenStory } : {}),
      ...(servicesDescription ? { servicesDescription } : {}),
      ...(privacyNotice ? { privacyNotice } : {}),
      footerCopyright,
    }),
    pwa: Object.freeze({
      appName,
      shortName: pwaShortName,
      description: pwaDescription,
      themeColor,
      backgroundColor,
    }),
    legal: Object.freeze({
      ...(operatorLegalName ? { operatorLegalName } : {}),
      ...(registeredAddress ? { registeredAddress } : {}),
      ...(privacyContactEmail ? { privacyContactEmail } : {}),
      ...(policyEffectiveDate ? { policyEffectiveDate } : {}),
      ...(policyVersion ? { policyVersion } : {}),
      ...(cancellationPolicyText ? { cancellationPolicyText } : {}),
      ...(softwareLicense ? { softwareLicense } : {}),
    }),
  });
}

/**
 * Resolves deployment-specific canteen configuration from Vite build/runtime environment variables.
 * Guarantees that environment-configured PWA deployments initialize the Customer PWA
 * consistently with the generated manifest instead of falling back to Campora Café.
 * Defaults to DEFAULT_CANTEEN_PRESET (Open Canteen) when no environment overrides are defined.
 */
export function getDeploymentCanteenConfig(): CanteenConfig {
  try {
    const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
    if (!env) return DEFAULT_CANTEEN_PRESET;

    const envId = env.VITE_CANTEEN_ID?.trim();
    const envAppName = env.VITE_CANTEEN_APP_NAME?.trim();

    // 1. If explicit registered preset ID is specified
    if (envId && CANTEEN_PRESETS[envId]) {
      return CANTEEN_PRESETS[envId];
    }

    // 2. If custom environment-level operator branding is defined
    if (envAppName && envAppName !== 'Campora Café' && envAppName !== 'Open Canteen') {
      return resolveCanteenConfig(
        {
          identity: {
            id: envId || envAppName.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
            displayName: envAppName,
            shortName: env.VITE_CANTEEN_SHORT_NAME?.trim(),
            description: env.VITE_CANTEEN_DESCRIPTION?.trim(),
          },
          branding: {
            primaryColor: env.VITE_CANTEEN_THEME_COLOR?.trim(),
          },
          pwa: {
            appName: envAppName,
            shortName: env.VITE_CANTEEN_SHORT_NAME?.trim() || envAppName,
            description: env.VITE_CANTEEN_DESCRIPTION?.trim(),
            themeColor: env.VITE_CANTEEN_THEME_COLOR?.trim(),
            backgroundColor: env.VITE_CANTEEN_BG_COLOR?.trim(),
          },
        },
        OPEN_CANTEEN_PRESET
      );
    }
  } catch {
    // Graceful fallback for non-browser / test runtimes
  }

  return DEFAULT_CANTEEN_PRESET;
}
