import type { CanteenConfig } from './canteenConfig.ts';

export interface PolicySection {
  readonly id: string;
  readonly heading: string;
  readonly content: string;
  readonly bullets?: readonly string[];
  readonly note?: string;
}

export interface LegalPolicyDocument {
  readonly id: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly summary: string;
  readonly iconName: 'ShieldCheck' | 'FileText' | 'RotateCcw' | 'Truck' | 'Code';
  readonly effectiveDate: string;
  readonly version: string;
  readonly operatorId: string;
  readonly operatorName: string;
  readonly sections: readonly PolicySection[];
}

/**
 * Returns all active legal policy documents dynamically resolved for the provided CanteenConfig.
 * This centralized engine ensures the Customer PWA, Account & Privacy page, Legal & Policies page,
 * and future Admin Panel reference one single, consistent source of truth.
 */
export function getLegalPolicies(config: CanteenConfig): readonly LegalPolicyDocument[] {
  const canteenName = config.identity.displayName || 'Open Canteen';
  const supportEmail = config.contact.supportEmail;
  const supportPhone = config.contact.supportPhone;
  const operatorName =
    config.legal?.operatorLegalName ||
    config.identity.displayName ||
    'Campus Canteen Operator';
  const registeredAddress =
    config.legal?.registeredAddress ||
    config.location.addressLine ||
    'Address pending operator publication';
  const privacyContact =
    config.legal?.privacyContactEmail ||
    config.contact.supportEmail ||
    'Contact canteen counter staff';
  const locationName = config.location.displayLocation || 'Central Campus Dining Hall';
  const hours = config.contact.operatingHours || 'Standard dining service hours';
  const effectiveDate = config.legal?.policyEffectiveDate || 'Pending operator publication';
  const policyVersion = config.legal?.policyVersion || 'v1.0 (Draft / Operator Review Pending)';
  const softwareLicense = config.legal?.softwareLicense || 'Pending formal repository release';
  const customCancellationText = config.legal?.cancellationPolicyText;

  const privacyPolicy: LegalPolicyDocument = {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    shortTitle: 'Privacy',
    summary:
      'Learn what personal information is collected, why it is needed, how it may be processed, and how to contact the canteen about privacy-related requests.',
    iconName: 'ShieldCheck',
    effectiveDate,
    version: policyVersion,
    operatorId: config.identity.id,
    operatorName,
    sections: [
      {
        id: 'operator-identity',
        heading: '1. Identity of the Responsible Canteen Operator',
        content: `This food ordering service is operated directly by ${operatorName} (${canteenName}). The canteen operator is the data controller responsible for managing customer records, receiving food orders, and selecting third-party services used in connection with this application.`,
        note: `Privacy contact: ${privacyContact}. Registered location: ${registeredAddress}.`,
      },
      {
        id: 'information-collected',
        heading: '2. Types of Personal Information Processed',
        content:
          'We limit personal data collection to information necessary for order placement, food preparation, campus delivery, and customer service:',
        bullets: [
          'Contact Details: Name, mobile telephone number, and email address when provided by the customer.',
          'Account & Authentication: Customer profile identifiers, guest tokens, and authentication session state.',
          'Orders & Transactions: Items ordered, quantities, customization notes, order totals, token numbers, and payment status.',
          'Campus Delivery Details: Saved hostel room numbers, campus building names, and pickup landmark instructions.',
          'Dietary Preferences: Vegetarian mode filters and display appearance choices (Light/Dark/System).',
          'Technical Logs: Browser type, operating system, and network reachability required for offline PWA operation.',
        ],
      },
      {
        id: 'processing-purposes',
        heading: '3. Why Your Information is Needed',
        content:
          'Your information is collected and processed solely for legitimate food service purposes:',
        bullets: [
          'To confirm, prepare, and deliver your food orders accurately.',
          'To help counter staff and delivery runners identify the correct customer and destination.',
          'To provide live order status notifications and token updates.',
          'To remember your dietary preferences across browsing sessions.',
          'To investigate order inquiries and provide dedicated customer support.',
          'To maintain transaction records required for tax and legal compliance.',
        ],
      },
      {
        id: 'storage-and-caching',
        heading: '4. Browser Storage and Application Caching',
        content: `To ensure fast performance and offline resilience on campus networks, this application stores your active cart, recent order tokens, and display preferences locally in your browser storage under the isolated operator namespace "opencanteen:${config.identity.id}:*".`,
        note: 'Clearing your browser cache or device storage removes locally stored preferences without corrupting your account records.',
      },
      {
        id: 'third-party-providers',
        heading: '5. Third-Party Technology Providers & Integrations',
        content:
          'Open Canteen supports modular deployments. In this deployment, disclosures reflect active services:',
        bullets: [
          'Web Hosting & PWA Cache: Serves application code and caches offline shell assets via Workbox service worker infrastructure.',
          'Cloud Authentication & Database (Google Firebase): When enabled, customer accounts and order records synchronize with Google Cloud Firestore (see local configuration).',
          'Local Asset Delivery: Menu photographs and interface icons are packaged and served locally from the web application without third-party CDN tracking.',
          'Payment Modes: Ordering runs in demonstration and counter payment mode (Cash on Pickup / Demo UPI). No third-party payment processing gateway is active in this demonstration.',
          'Analytics & Tracking: Zero third-party behavioral trackers or advertising networks are integrated.',
        ],
        note: 'Open Canteen open-source software developers do not have access to private customer orders or personal records maintained by independent canteen operators.',
      },
      {
        id: 'access-and-sharing',
        heading: '6. Who May Access Your Information',
        content:
          'Customer records are accessible strictly on a need-to-know basis to: (1) You, for viewing your account and order history; (2) Authorized canteen staff, for food preparation and delivery; (3) Configured technology providers, as necessary to maintain application infrastructure; and (4) Law enforcement or regulatory authorities, only when required by applicable law. Your personal records are never sold or rented.',
      },
      {
        id: 'retention-and-rights',
        heading: '7. Data Retention & Customer Privacy Rights',
        content:
          'Order records are retained in accordance with the canteen operator\'s published retention schedule and local statutory requirements. You have the right to request a copy of your personal data, update inaccurate information, or request account and profile deletion by contacting the canteen operator.',
        note: `Submit privacy and data access requests to ${privacyContact}.`,
      },
    ],
  };

  const termsOfService: LegalPolicyDocument = {
    id: 'terms-of-service',
    title: 'Terms of Service',
    shortTitle: 'Terms',
    summary:
      'Understand the responsibilities, conditions, and limitations involved in using this canteen\'s digital ordering services.',
    iconName: 'FileText',
    effectiveDate,
    version: policyVersion,
    operatorId: config.identity.id,
    operatorName,
    sections: [
      {
        id: 'acceptance',
        heading: '1. Acceptance of Service Terms',
        content: `By browsing the menu, placing an order, or creating an account with ${canteenName}, you acknowledge and agree to these terms of service and any operational guidelines published by ${operatorName}.`,
      },
      {
        id: 'account-responsibility',
        heading: '2. Account and Ordering Responsibilities',
        content:
          'Customers are responsible for providing accurate contact numbers, hostel room details, and dietary selections when placing an order. You agree to maintain the confidentiality of your session credentials and promptly notify the canteen of any unauthorized use.',
      },
      {
        id: 'ordering-and-menu',
        heading: '3. Menu Availability and Pricing',
        content: `All menu items are subject to daily kitchen availability at ${locationName}. Displayed prices include all applicable taxes unless otherwise itemized during checkout. The canteen reserves the right to adjust prices or mark items temporarily out of stock during peak rush hours.`,
      },
      {
        id: 'order-fulfillment',
        heading: '4. Order Fulfillment',
        content:
          'Fulfillment options (Dine-in, Takeaway, and Campus Delivery) depend on the active service mode configured by the operator. Orders marked for takeaway must be collected from the designated counter during operating hours.',
      },
      {
        id: 'payment-terms',
        heading: '5. Payment Terms & Demo Mode Disclosure',
        content:
          'Available payment methods are shown at checkout. When this application operates in demonstration or development mode, simulated payment confirmations do not debit real bank funds. For cash orders, payment is due upon food collection.',
      },
      {
        id: 'acceptable-use',
        heading: '6. Acceptable Use Policy',
        content:
          'You agree not to misuse this ordering platform, submit fictitious orders, deploy automated scripts, or attempt to bypass security measures or access another customer\'s private records.',
      },
      {
        id: 'operator-responsibility',
        heading: '7. Operator Responsibility & Support',
        content: `${operatorName} is solely responsible for food preparation, ingredient sourcing, kitchen hygiene, order fulfillment, and customer dispute resolution. Questions regarding specific dishes or delayed orders should be directed to canteen staff.`,
        note: `Contact our support desk at ${supportEmail || privacyContact}${supportPhone ? ` or ${supportPhone}` : ''}. Operating hours: ${hours}.`,
      },
    ],
  };

  const refundCancellation: LegalPolicyDocument = {
    id: 'refund-cancellation',
    title: 'Refund & Cancellation Policy',
    shortTitle: 'Refunds',
    summary:
      'Understand how order cancellations, order modifications, and refund requests are handled by the canteen.',
    iconName: 'RotateCcw',
    effectiveDate,
    version: policyVersion,
    operatorId: config.identity.id,
    operatorName,
    sections: [
      {
        id: 'cancellation-eligibility',
        heading: '1. Customer-Initiated Cancellations',
        content:
          'Orders may be cancelled directly by the customer through the Order Details screen while in non-terminal processing states: "Placed", "Confirmed", or "Preparing". Once an order advances to "Delivered", "Completed", or has already been "Cancelled", customer-initiated cancellation is no longer available.',
      },
      {
        id: 'canteen-cancellations',
        heading: '2. Canteen-Initiated Cancellations',
        content: `If an ordered item becomes unavailable or the kitchen cannot fulfill your request due to unexpected operational constraints, ${canteenName} will promptly update the order status to "Cancelled" with an explanatory reason.`,
      },
      {
        id: 'refund-methods',
        heading: '3. Payment & Refund Conditions',
        content:
          'Because this demonstration deployment processes orders via Cash on Counter or Simulated Demo tokens, cancelled orders do not incur cancellation penalty fees or bank reversal charges. For cash orders, no funds were collected prior to fulfillment. In production deployments where advance digital payments are enabled, refund handling and reconciliation are administered directly by the canteen operator according to institutional counter guidelines.',
        ...(customCancellationText ? { note: customCancellationText } : {}),
      },
      {
        id: 'incorrect-orders',
        heading: '4. Discrepancies and Missing Items',
        content:
          'If you receive an incorrect dish, missing item, or unsatisfactory order, please notify the canteen counter promptly upon receipt. Canteen staff will inspect and replace the item or provide an appropriate resolution.',
        note: `For immediate assistance, visit the counter at ${locationName}${supportEmail ? ` or email ${supportEmail}` : ''}.`,
      },
    ],
  };

  const fulfillmentPolicy: LegalPolicyDocument = {
    id: 'fulfillment-policy',
    title: 'Ordering & Fulfillment Policy',
    shortTitle: 'Fulfillment',
    summary:
      'Information about kitchen preparation, counter pickup, dine-in procedures, and campus delivery rules.',
    iconName: 'Truck',
    effectiveDate,
    version: policyVersion,
    operatorId: config.identity.id,
    operatorName,
    sections: [
      {
        id: 'service-modes',
        heading: '1. Supported Service Modes',
        content: `${canteenName} provides flexible dining options to accommodate campus life:`,
        bullets: [
          'Dine-in: Enjoy your meal at the canteen dining hall. Keep your digital token ready to present when called.',
          'Takeaway: Your food is packaged in eco-friendly kraft bags or sealed takeaway containers for convenient pickup.',
          'Campus Delivery: When enabled, orders are dispatched to eligible hostel blocks, departments, or campus gate points.',
        ],
      },
      {
        id: 'pickup-guidelines',
        heading: '2. Counter Pickup Guidelines',
        content: `Takeaway orders should be collected from the designated pickup counter at ${locationName}. Please arrive promptly once your digital order status displays "Ready for Pickup" to ensure your food is enjoyed fresh and hot.`,
      },
      {
        id: 'delivery-rules',
        heading: '3. Campus Delivery Guidelines',
        content:
          'For delivery orders, please ensure your saved hostel building, room number, or department landmark is accurate. Delivery personnel will contact your registered phone number upon arrival at the designated building drop point.',
      },
      {
        id: 'kitchen-cutoffs',
        heading: '4. Operating Hours & Service Availability',
        content: `Orders can be placed during active kitchen hours: ${hours}. Food preparation is subject to daily kitchen capacity and operational conditions.`,
      },
    ],
  };

  const openSourceAcknowledgements: LegalPolicyDocument = {
    id: 'open-source',
    title: 'Open-Source & Acknowledgements',
    shortTitle: 'Open Source',
    summary:
      'Information about the open-source software, platform independence, and third-party software licenses powering this application.',
    iconName: 'Code',
    effectiveDate,
    version: policyVersion,
    operatorId: config.identity.id,
    operatorName,
    sections: [
      {
        id: 'platform-overview',
        heading: '1. About the Open Canteen Platform',
        content:
          'This ordering application is powered by Open Canteen, an open-source canteen ordering and management platform designed to make digital dining accessible, customizable, and independent for institutions, educational campuses, and independent food operators worldwide.',
      },
      {
        id: 'independence',
        heading: '2. Independent Operator Model',
        content: `Open Canteen provides software tools. The operator of this canteen, ${operatorName}, independently manages its own food service, recipes, pricing, order fulfillment, and customer relationships. Open Canteen project maintainers do not operate the physical canteen or handle customer orders.`,
      },
      {
        id: 'license',
        heading: '3. Software License & Release Status',
        content: `The Open Canteen core software project is being prepared for open-source publication. The official repository license will be published with the public release (${softwareLicense}). Under its open-source philosophy, the platform is designed to allow developers, educational institutions, and canteen operators to inspect, customize, improve, and independently deploy the software under applicable open-source terms.`,
      },
      {
        id: 'third-party-libraries',
        heading: '4. Third-Party Libraries & Acknowledgements',
        content:
          'We gratefully acknowledge the open-source ecosystem that makes this application possible:',
        bullets: [
          'React (MIT License) — UI component architecture',
          'Vite & Rolldown (MIT License) — Modern web tooling and bundling',
          'Tailwind CSS (MIT License) — Utility-first design system',
          'Lucide React (ISC License) — Accessible interface icons',
          'Motion (MIT License) — Smooth micro-animations and transitions',
          'Workbox & Vite PWA (MIT License) — Progressive Web App service worker infrastructure',
          'Firebase JS SDK (Apache-2.0 License) — Cloud authentication and database client library',
        ],
        note: 'All trademarks, logos, and brand names are the property of their respective owners.',
      },
    ],
  };

  return [
    privacyPolicy,
    termsOfService,
    refundCancellation,
    fulfillmentPolicy,
    openSourceAcknowledgements,
  ];
}

/**
 * Retrieves a single policy document by its ID for the given CanteenConfig.
 */
export function getLegalPolicyById(
  id: string,
  config: CanteenConfig
): LegalPolicyDocument | undefined {
  const policies = getLegalPolicies(config);
  return policies.find((p) => p.id === id);
}
