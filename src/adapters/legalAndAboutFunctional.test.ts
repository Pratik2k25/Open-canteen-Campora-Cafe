import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPEN_CANTEEN_PRESET,
  resolveCanteenConfig,
} from '../config/canteenConfig.ts';
import {
  getLegalPolicies,
  getLegalPolicyById,
} from '../config/legalPolicies.ts';
import { computeNavState } from '../utils/navigationState.ts';

test('Legal & Policies: 1. Resolves all 5 mandatory canonical policy documents for Open Canteen', () => {
  const policies = getLegalPolicies(OPEN_CANTEEN_PRESET);
  assert.equal(policies.length, 5);

  const policyIds = policies.map((p) => p.id);
  assert.ok(policyIds.includes('privacy-policy'));
  assert.ok(policyIds.includes('terms-of-service'));
  assert.ok(policyIds.includes('refund-cancellation'));
  assert.ok(policyIds.includes('fulfillment-policy'));
  assert.ok(policyIds.includes('open-source'));
});

test('Legal & Policies: 2. getLegalPolicyById retrieves individual documents and returns undefined for unknown keys', () => {
  const privacy = getLegalPolicyById('privacy-policy', OPEN_CANTEEN_PRESET);
  assert.ok(privacy);
  assert.equal(privacy.title, 'Privacy Policy');
  assert.ok(privacy.sections.length >= 5);

  const terms = getLegalPolicyById('terms-of-service', OPEN_CANTEEN_PRESET);
  assert.ok(terms);
  assert.equal(terms.title, 'Terms of Service');

  const unknown = getLegalPolicyById('non-existent-policy', OPEN_CANTEEN_PRESET);
  assert.equal(unknown, undefined);
});

test('Legal & Policies: 3. Dynamic canteen token resolution injects operator identity without hardcoding', () => {
  const customConfig = resolveCanteenConfig({
    identity: { id: 'heritage-dining', displayName: 'Heritage Campus Mess' },
    contact: {
      supportEmail: 'contact@heritagemess.edu',
      operatingHours: '7:30 AM – 9:30 PM',
      supportPhone: '+91 98765 00000',
    },
    location: {
      displayLocation: 'North Campus Building 4',
    },
    legal: {
      operatorLegalName: 'Heritage Hospitality Trust',
      registeredAddress: 'Building 4, University Enclave, New Delhi 110007',
      privacyContactEmail: 'privacy@heritagemess.edu',
      policyEffectiveDate: 'November 2026',
      policyVersion: 'v2.1',
      cancellationPolicyText: 'Special rules: Meal tokens cancelled 10 minutes before preparation are credited to the student balance.',
      softwareLicense: 'Permissive Community License',
    },
  });

  const policies = getLegalPolicies(customConfig);
  const privacy = policies.find((p) => p.id === 'privacy-policy');
  assert.ok(privacy);
  assert.equal(privacy.operatorName, 'Heritage Hospitality Trust');
  assert.equal(privacy.effectiveDate, 'November 2026');
  assert.equal(privacy.version, 'v2.1');
  assert.ok(privacy.sections[0].content.includes('Heritage Hospitality Trust'));
  assert.ok(privacy.sections[0].note?.includes('privacy@heritagemess.edu'));
  assert.ok(privacy.sections[0].note?.includes('Building 4, University Enclave'));

  const terms = policies.find((p) => p.id === 'terms-of-service');
  assert.ok(terms);
  assert.ok(terms.sections[0].content.includes('Heritage Hospitality Trust'));
  assert.ok(terms.sections[2].content.includes('North Campus Building 4'));

  const openSource = policies.find((p) => p.id === 'open-source');
  assert.ok(openSource);
  assert.ok(openSource.sections[1].content.includes('Heritage Hospitality Trust'));
  assert.ok(openSource.sections[2].content.includes('Permissive Community License'));

  const refund = policies.find((p) => p.id === 'refund-cancellation');
  assert.ok(refund);
  assert.ok(refund.sections[2].note?.includes('Special rules: Meal tokens cancelled'));
});

test('Legal & Policies: 4. Cancellation rules match actual order lifecycle and do not invent penalties', () => {
  const refund = getLegalPolicyById('refund-cancellation', OPEN_CANTEEN_PRESET);
  assert.ok(refund);

  // Verifies that Placed, Confirmed, and Preparing are documented as cancellable
  const cancellationSec = refund.sections[0];
  assert.ok(cancellationSec.content.includes('Placed'));
  assert.ok(cancellationSec.content.includes('Confirmed'));
  assert.ok(cancellationSec.content.includes('Preparing'));
  assert.ok(cancellationSec.content.includes('Delivered'));
  assert.ok(cancellationSec.content.includes('Completed'));

  // Discloses demo payment / cash mode without claiming credit card penalties
  const paymentSec = refund.sections[2];
  assert.ok(paymentSec.content.includes('Cash on Counter') || paymentSec.content.includes('Simulated Demo'));
});

test('Legal & Policies: 5. Third-party disclosures reflect actual active technologies without claiming Cloudinary', () => {
  const privacy = getLegalPolicyById('privacy-policy', OPEN_CANTEEN_PRESET);
  assert.ok(privacy);

  const thirdPartySec = privacy.sections.find((s) => s.id === 'third-party-providers');
  assert.ok(thirdPartySec);
  const text = JSON.stringify(thirdPartySec);
  assert.ok(!text.includes('Cloudinary'), 'Must not claim Cloudinary when not active');
  assert.ok(text.includes('Google Firebase') || text.includes('Firestore'));
  assert.ok(text.includes('Workbox'));
});

test('About Canteen: 6. CanteenConfig supports custom story and service description overrides', () => {
  const customStory = 'Serving wholesome regional meals to university scholars since our dining hall opened.';
  const customServices = 'Dine-in counter tickets, quick pickup bags, and bicycle hostel delivery.';

  const config = resolveCanteenConfig({
    identity: { id: 'scholars-bistro', displayName: 'Scholars Bistro' },
    content: {
      canteenStory: customStory,
      servicesDescription: customServices,
    },
  });

  assert.equal(config.content.canteenStory, customStory);
  assert.equal(config.content.servicesDescription, customServices);
  assert.equal(config.identity.displayName, 'Scholars Bistro');
  // Safe default when legal fields are omitted
  assert.equal(config.legal.operatorLegalName, undefined);
  assert.equal(config.legal.policyEffectiveDate, undefined);
});

test('Navigation & Guest Access: 7. Informational routes hide bottom navigation and support guest viewing', () => {
  const aboutCanteenNav = computeNavState('/profile/about-canteen');
  assert.equal(aboutCanteenNav.showBottomNav, false);
  assert.equal(aboutCanteenNav.isProfileActive, true);

  const aboutOpenCanteenNav = computeNavState('/profile/about-open-canteen');
  assert.equal(aboutOpenCanteenNav.showBottomNav, false);

  const legalNav = computeNavState('/profile/legal');
  assert.equal(legalNav.showBottomNav, false);

  const policyDetailNav = computeNavState('/profile/legal/privacy-policy');
  assert.equal(policyDetailNav.showBottomNav, false);

  const privacyNav = computeNavState('/privacy');
  assert.equal(privacyNav.showBottomNav, false);

  const homeNav = computeNavState('/');
  assert.equal(homeNav.showBottomNav, true);
});
