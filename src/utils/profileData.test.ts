import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_MOCK_PROFILE_DATA,
  getAvatarInitial,
  validateProfileUpdate,
  toggleVegModeState,
  updateAppearanceTheme,
  mockProfileDataProvider,
} from './profileData.ts';

test('INITIAL_MOCK_PROFILE_DATA matches approved screenshot identity and defaults', () => {
  assert.equal(INITIAL_MOCK_PROFILE_DATA.displayName, 'Pratik Anand');
  assert.equal(INITIAL_MOCK_PROFILE_DATA.email, 'pratikanandmaurya@flash.co');
  assert.equal(INITIAL_MOCK_PROFILE_DATA.vegMode, true);
  assert.equal(INITIAL_MOCK_PROFILE_DATA.appearance, 'Light');
});

test('getAvatarInitial extracts uppercase first letter with fallback', () => {
  assert.equal(getAvatarInitial('Pratik Anand'), 'P');
  assert.equal(getAvatarInitial('  ananya sharma '), 'A');
  assert.equal(getAvatarInitial(''), 'P');
});

test('validateProfileUpdate rejects empty name or invalid email', () => {
  assert.deepEqual(validateProfileUpdate({ displayName: '', email: 'test@flash.co' }), {
    valid: false,
    error: 'Name cannot be empty.',
  });
  assert.deepEqual(validateProfileUpdate({ displayName: 'Pratik', email: 'not-an-email' }), {
    valid: false,
    error: 'Please enter a valid email address.',
  });
  assert.deepEqual(
    validateProfileUpdate({ displayName: 'Pratik Anand', email: 'pratikanandmaurya@flash.co' }),
    { valid: true }
  );
});

test('toggleVegModeState and updateAppearanceTheme transition state immutably', () => {
  const initial = mockProfileDataProvider.getProfile();
  assert.equal(initial.vegMode, true);

  const toggled = toggleVegModeState(initial);
  assert.equal(toggled.vegMode, false);
  assert.equal(initial.vegMode, true);

  const darkProfile = updateAppearanceTheme(toggled, 'Dark');
  assert.equal(darkProfile.appearance, 'Dark');
});
