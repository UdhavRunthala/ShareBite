import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maskContact, CONTACT_HIDDEN, safeUntil, distanceKm } from '../src/domain.js';
test('chat masks spaced phones, email, social handles and direct URLs', () => {
  for (const contact of ['+91 98765 43210', '987-654-3210', 'help@example.com', '@team.jaipur', 'https://instagram.com/team']) assert.equal(maskContact(contact), CONTACT_HIDDEN);
  assert.equal(maskContact('We have 200 meals; pickup at 4:30.'), 'We have 200 meals; pickup at 4:30.');
});
test('safety windows and distances use consistent units', () => {
  assert.equal(safeUntil('Cooked meals', '2026-01-01T00:00:00Z').toISOString(), '2026-01-01T04:00:00.000Z');
  assert.equal(distanceKm([75.8, 26.9], [75.8, 26.9]), 0);
});
