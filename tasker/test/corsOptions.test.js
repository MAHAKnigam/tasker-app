const test = require('node:test');
const assert = require('node:assert/strict');
const { getAllowedOrigins, isOriginAllowed } = require('../src/config/corsOptions');

test('getAllowedOrigins trims entries and removes empty values', () => {
  assert.deepEqual(
    getAllowedOrigins(' https://app.example.com, ,http://localhost:3000 '),
    ['https://app.example.com', 'http://localhost:3000']
  );
});

test('allows requests without an Origin header', () => {
  assert.equal(isOriginAllowed(undefined, [], true), true);
});

test('allows configured origins in production', () => {
  assert.equal(
    isOriginAllowed('https://app.example.com', ['https://app.example.com'], true),
    true
  );
});

test('blocks unconfigured origins in production', () => {
  assert.equal(isOriginAllowed('https://unknown.example', [], true), false);
});

test('allows local development origins when no allowlist is configured', () => {
  assert.equal(isOriginAllowed('http://localhost:3000', [], false), true);
});
