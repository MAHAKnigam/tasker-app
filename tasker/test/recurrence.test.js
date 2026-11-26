const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRecurrence, getNextDueDate } = require('../src/utils/recurrence');

test('calculates daily and weekly occurrences', () => {
  assert.equal(getNextDueDate('2026-11-26T09:00:00.000Z', { frequency: 'daily' }).toISOString(), '2026-11-27T09:00:00.000Z');
  assert.equal(getNextDueDate('2026-11-26T09:00:00.000Z', { frequency: 'weekly', interval: 2 }).toISOString(), '2026-12-10T09:00:00.000Z');
});

test('clamps monthly recurrence to the last valid day', () => {
  assert.equal(getNextDueDate('2026-01-31T09:00:00.000Z', { frequency: 'monthly' }).toISOString(), '2026-02-28T09:00:00.000Z');
});

test('stops when the next occurrence would exceed the end date', () => {
  assert.equal(getNextDueDate('2026-11-26T09:00:00.000Z', { frequency: 'daily', endDate: '2026-11-26T23:59:59.000Z' }), null);
});

test('rejects unsupported frequencies and invalid intervals', () => {
  assert.match(validateRecurrence({ frequency: 'yearly' }), /Frequency/);
  assert.match(validateRecurrence({ frequency: 'daily', interval: 0 }), /interval/);
});
