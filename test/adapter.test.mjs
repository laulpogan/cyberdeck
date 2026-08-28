import test from 'node:test';
import assert from 'node:assert/strict';

import { covers, filterPatch, applyPatch, darkModel, createAdapter } from '../app/adapter.js';
import { SPECS } from '../app/registry.js';
import { FIXTURES } from '../app/fixtures/index.js';
import { getPath } from '../app/util.js';

const radar = SPECS.radar;

test('declared-path matching covers wildcards and concrete indices', () => {
  assert.ok(covers('contacts[*].age_seconds', 'contacts.3.age_seconds'));
  assert.ok(covers('a[0].b', 'a.0.b'));
  assert.ok(!covers('contacts[*].age_seconds', 'contacts.3.band'));
  assert.ok(!covers('contacts[*]', 'contacts.3.age_seconds'));
});

test('a patch may only touch paths the component declares', () => {
  const [accepted, rejected] = filterPatch(radar, {
    pollElapsed: 2,
    pollPeriod: 6,
    sourceState: 'live',
    contacts: [{ age_seconds: 1, band: 'fresh', invented: 'truth' }],
    unclaimed: { deeply: 'nested' },
  });
  assert.equal(accepted.get('pollElapsed'), 2);
  assert.equal(accepted.get('contacts.0.band'), 'fresh');
  assert.deepEqual(rejected, ['contacts.0.invented', 'unclaimed.deeply']);
});

test('a successful poll yields a model measured on every declared path', async () => {
  const adapter = createAdapter({
    spec: radar, periodMs: 6000, sourceStatePath: 'sourceState',
    fetchJson: async () => ({
      pollElapsed: 2, pollPeriod: 6, sourceState: 'live',
      contacts: FIXTURES.radar.contacts.map(() => ({ age_seconds: 11, band: 'fresh' })),
    }),
  });
  assert.deepEqual(adapter.model(), darkModel(radar), 'a page with no poll yet is not dark');
  const model = await adapter.poll(1000);
  assert.equal(model.pollElapsed, 2);
  assert.equal(model.contacts[2].age_seconds, 11);
  assert.equal(model.contacts[2].bearing, FIXTURES.radar.contacts[2].bearing,
    'the adapter reached a field the component never claimed');
});

test('a failed poll leaves the dark model and counts the failure', async () => {
  let down = false;
  const adapter = createAdapter({
    spec: radar, periodMs: 6000, sourceStatePath: 'sourceState',
    fetchJson: async () => { if (down) throw new Error('ECONNREFUSED'); return {}; },
  });
  await adapter.poll(1000);
  down = true;
  const model = await adapter.poll(2000);
  assert.deepEqual(model, darkModel(radar));
  assert.equal(adapter.state().fails, 1);
  assert.match(adapter.state().error, /ECONNREFUSED/);
});

test('staleness is measured from the poll clock, not a label', async () => {
  const adapter = createAdapter({
    spec: radar, periodMs: 1000, sourceStatePath: 'sourceState',
    fetchJson: async () => ({ sourceState: 'live', pollElapsed: 0, pollPeriod: 1,
      contacts: FIXTURES.radar.contacts.map(() => ({ age_seconds: 1, band: 'fresh' })) }),
  });
  await adapter.poll(0);
  assert.equal(adapter.model(1500).sourceState, 'live', 'young reading called stale');
  assert.ok(!adapter.isStale(1500));
  assert.ok(adapter.isStale(2500));
  assert.equal(adapter.model(2500).sourceState, 'stale', 'overdue reading still called live');
});

test('an empty accepted patch still keeps the fixture honest elsewhere', async () => {
  const adapter = createAdapter({
    spec: SPECS.crush, periodMs: 6000,
    fetchJson: async () => ({ count: 99 }),
  });
  const model = await adapter.poll(0);
  assert.equal(model.count, 99);
  assert.deepEqual(applyPatch(FIXTURES.crush, new Map()), FIXTURES.crush,
    'applying nothing changed the fixture');
  const dark = getPath(darkModel(SPECS.crush), 'count');
  assert.equal(dark, null);
});
