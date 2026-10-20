import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getServiceTheme, SERVICE_THEMES } from './serviceTheme.ts';

describe('Case 3 Dynamic Service Theme System', () => {
  it('returns mint green Zone A and ADD button tokens for dinein', () => {
    const theme = getServiceTheme('dinein');
    assert.equal(theme.zoneABgHex, '#D2F8E1');
    assert.equal(theme.tabStrokeHex, '#36B871');
    assert.ok(theme.addButtonBgClass.includes('#D2F8E1'));
    assert.ok(theme.addButtonTextClass.includes('#0E6B39'));
  });

  it('returns warm beige Zone A and amber/peach ADD button tokens for takeaway', () => {
    const theme = getServiceTheme('takeaway');
    assert.equal(theme.zoneABgHex, '#FAF0E7');
    assert.equal(theme.tabStrokeHex, '#E29B61');
    assert.ok(theme.addButtonBgClass.includes('#F9E3CE'));
    assert.ok(theme.addButtonTextClass.includes('#9A4A12'));
  });

  it('returns soft sky blue Zone A and ocean blue ADD button tokens for delivery', () => {
    const theme = getServiceTheme('delivery');
    assert.equal(theme.zoneABgHex, '#DEF0FE');
    assert.equal(theme.tabStrokeHex, '#5BA8E6');
    assert.ok(theme.addButtonBgClass.includes('#DEF0FE'));
    assert.ok(theme.addButtonTextClass.includes('#0D528C'));
  });

  it('defines distinct Zone A and ADD button themes across all three service modes', () => {
    const modes = Object.keys(SERVICE_THEMES) as Array<keyof typeof SERVICE_THEMES>;
    assert.equal(modes.length, 3);
    const zoneColors = new Set(modes.map((m) => SERVICE_THEMES[m].zoneABgHex));
    const btnColors = new Set(modes.map((m) => SERVICE_THEMES[m].addButtonBgClass));
    assert.equal(zoneColors.size, 3);
    assert.equal(btnColors.size, 3);
  });
});
