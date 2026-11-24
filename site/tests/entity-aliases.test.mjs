import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalPersonId, normalizePeople} from '../lib/entity-aliases.mjs';
import archive from '../lib/data/archive.json' with {type:'json'};

test('Beijing Internet Court aliases retain all event links without mutating source records', () => {
  const original = structuredClone(archive);
  const normalized = normalizePeople(archive);
  const canonical = 'org-beijing-internet-court';
  const ids = new Set(['org-beijing-court', canonical]);
  const expected = archive.events.filter(e => [...e.actors, ...e.organizations].some(id => ids.has(id))).map(e => e.id);
  assert.ok(expected.length > 0);
  assert.equal(normalized.people.filter(p => p.id === canonical).length, 1);
  assert.equal(normalized.people.some(p => p.id === 'org-beijing-court'), false);
  assert.deepEqual(normalized.events.filter(e => [...e.actors, ...e.organizations].includes(canonical)).map(e => e.id), expected);
  assert.equal(canonicalPersonId('org-beijing-court'), canonical); // Bookmarked filters still work.
  assert.equal(canonicalPersonId('unrelated-court'), 'unrelated-court');
  assert.deepEqual(archive, original);
  assert.deepEqual(normalizePeople(normalized), normalized);
});
