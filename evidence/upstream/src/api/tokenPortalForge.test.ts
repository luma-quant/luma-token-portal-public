import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  createTokenPortalForgeApi,
  parseTokenPortalForgeConfig,
  TOKEN_PORTAL_FORGE_BASE_PATH,
  type TokenPortalForgeTransport,
} from '../tokenPortal/forge';
import type { ArtifactForgeJob } from './artifactForge';

const JOB_ID = '11111111-1111-4111-8111-111111111111';
const COLLECTION_ID = '22222222-2222-4222-8222-222222222222';
const IDEMPOTENCY_KEY = '33333333-3333-4333-8333-333333333333';
const CREATED_AT = '2026-08-12T12:00:00Z';

const config = {
  enabled: true,
  runtime: 'DETERMINISTIC_PREVIEW',
  candidate_count: 3,
  selectable_grades: ['RARE', 'EPIC'],
  earned_only_grades: ['LEGENDARY', 'MYTHIC'],
  paid_random: false,
  modes: ['GUIDED', 'SURPRISE'],
  themes: ['QUANTUM_CORE', 'DATA_FRONTIER', 'PROBABILITY_FIELD', 'PERSONAL_CONSTELLATION'],
  achievement_mode_available: false,
  generation_payment_required: false,
  mint_enabled: false,
  mint_network: null,
  mint_cost_luma_atoms: null,
};

const collection = {
  id: COLLECTION_ID,
  key: 'season-zero-user-forge',
  version: 1,
  display_name: 'Season Zero User Forge',
  description: 'Controlled wallet preview collection.',
  season_key: 'season-zero',
  trait_schema_version: 'season-zero.v1',
  metadata_schema_version: 'artifact-public.v1',
  public_contract: {
    kind: 'FORGE',
    access_mode: 'VERIFIED_WALLET_FORGE',
    marketplace_enabled: false,
    trading_enabled: false,
    minting_enabled: false,
    paid_random_rarity: false,
  },
};

function candidate(index: 1 | 2 | 3, status = 'READY') {
  const digit = String(index);
  return {
    id: `${digit.repeat(8)}-${digit.repeat(4)}-4${digit.repeat(3)}-8${digit.repeat(3)}-${digit.repeat(12)}`,
    candidate_index: index,
    status,
    media_uri: `https://media.lumaquant.tech/artifacts/portal-${index}.png`,
    media_sha256: digit.repeat(64),
    render_contract_sha256: `${index + 3}`.repeat(64),
    similarity_score: 0.1 * index,
    qa_passed: true,
    brand_rule_ids: ['luma.palette.v1'],
    trait_selection_sha256: `${index + 6}`.repeat(64),
    created_at: CREATED_AT,
    rendered_at: CREATED_AT,
  };
}

function job(overrides: Record<string, unknown> = {}) {
  return {
    id: JOB_ID,
    collection_id: COLLECTION_ID,
    mode: 'GUIDED',
    requested_rarity: 'RARE',
    status: 'CANDIDATES_READY',
    candidate_count: 3,
    selected_candidate_index: null,
    error_code: null,
    created_at: CREATED_AT,
    updated_at: CREATED_AT,
    completed_at: null,
    candidates: [candidate(1), candidate(2), candidate(3)],
    ...overrides,
  };
}

test('Token Portal Forge config accepts only the exact free deterministic contract', () => {
  const parsed = parseTokenPortalForgeConfig(config);
  assert.equal(parsed.runtime, 'DETERMINISTIC_PREVIEW');
  assert.deepEqual(parsed.selectable_grades, ['RARE', 'EPIC']);
  assert.deepEqual(parsed.earned_only_grades, ['LEGENDARY', 'MYTHIC']);
  assert.equal(parsed.generation_payment_required, false);
  assert.equal(parsed.mint_enabled, false);

  assert.throws(() => parseTokenPortalForgeConfig({ ...config, paid_random: true }), /free preview contract/);
  assert.throws(() => parseTokenPortalForgeConfig({ ...config, mint_enabled: true }), /free preview contract/);
  assert.throws(() => parseTokenPortalForgeConfig({ ...config, selectable_grades: ['EPIC', 'RARE'] }), /frozen contract/);
  assert.throws(() => parseTokenPortalForgeConfig({ ...config, extra: true }), /frozen contract/);
});

test('Token Portal Forge uses only the five isolated portal routes', async () => {
  const calls: Array<{ method: string; path: string; body?: unknown; config?: unknown }> = [];
  const transport: TokenPortalForgeTransport = {
    get: async (path) => {
      calls.push({ method: 'GET', path });
      if (path.endsWith('/config')) return { data: config } as never;
      if (path.endsWith('/collections')) return { data: { items: [collection] } } as never;
      return { data: job() } as never;
    },
    post: async (path, body, requestConfig) => {
      calls.push({ method: 'POST', path, body, config: requestConfig });
      if (path.endsWith('/selection')) {
        return { data: job({
          status: 'FINAL_SELECTED',
          selected_candidate_index: 2,
          completed_at: CREATED_AT,
          candidates: [candidate(1, 'REJECTED'), candidate(2, 'SELECTED'), candidate(3, 'REJECTED')],
        }) } as never;
      }
      return { data: job() } as never;
    },
  };
  const api = createTokenPortalForgeApi(transport);

  await api.getConfig();
  await api.getCollections();
  await api.createJob({
    collection_id: COLLECTION_ID,
    mode: 'GUIDED',
    requested_rarity: 'RARE',
    theme: 'QUANTUM_CORE',
  }, IDEMPOTENCY_KEY);
  await api.getJob(JOB_ID);
  await api.selectCandidate(JOB_ID, 2);

  assert.deepEqual(calls.map(({ method, path }) => [method, path]), [
    ['GET', `${TOKEN_PORTAL_FORGE_BASE_PATH}/config`],
    ['GET', `${TOKEN_PORTAL_FORGE_BASE_PATH}/collections`],
    ['POST', `${TOKEN_PORTAL_FORGE_BASE_PATH}/jobs`],
    ['GET', `${TOKEN_PORTAL_FORGE_BASE_PATH}/jobs/${JOB_ID}`],
    ['POST', `${TOKEN_PORTAL_FORGE_BASE_PATH}/jobs/${JOB_ID}/selection`],
  ]);
  assert.deepEqual(calls[2].body, {
    collection_id: COLLECTION_ID,
    mode: 'GUIDED',
    requested_rarity: 'RARE',
    theme: 'QUANTUM_CORE',
  });
  assert.deepEqual(calls[2].config, { headers: { 'Idempotency-Key': IDEMPOTENCY_KEY } });
  assert.deepEqual(calls[4].body, { candidate_index: 2 });
});

test('Token Portal Surprise Forge omits theme and rejects prompts or achievement fields', async () => {
  const bodies: unknown[] = [];
  const api = createTokenPortalForgeApi({
    get: async () => ({ data: job({ mode: 'SURPRISE', requested_rarity: 'EPIC' }) }) as never,
    post: async (_path, body) => {
      bodies.push(body);
      return { data: job({ mode: 'SURPRISE', requested_rarity: 'EPIC' }) } as never;
    },
  });
  await api.createJob({
    collection_id: COLLECTION_ID,
    mode: 'SURPRISE',
    requested_rarity: 'EPIC',
  }, IDEMPOTENCY_KEY);
  assert.deepEqual(bodies[0], {
    collection_id: COLLECTION_ID,
    mode: 'SURPRISE',
    requested_rarity: 'EPIC',
  });
  await assert.rejects(
    api.createJob({
      collection_id: COLLECTION_ID,
      mode: 'SURPRISE',
      requested_rarity: 'EPIC',
      prompt: 'make it valuable',
    } as never, IDEMPOTENCY_KEY),
    /frozen contract/,
  );
  await assert.rejects(
    api.createJob({
      collection_id: COLLECTION_ID,
      mode: 'ACHIEVEMENT',
      requested_rarity: 'MYTHIC',
      achievement_award_id: JOB_ID,
    } as never, IDEMPOTENCY_KEY),
    /requested grade|mode/,
  );
});

test('Token Portal Forge rejects mint, payment, achievement and mismatched job responses', async () => {
  const response = { current: job() };
  const api = createTokenPortalForgeApi({
    get: async () => ({ data: response.current }) as never,
    post: async () => ({ data: response.current }) as never,
  });

  for (const status of ['PAYMENT_PENDING', 'PAYMENT_CONFIRMED', 'MINT_PENDING', 'MINTED'] as ArtifactForgeJob['status'][]) {
    response.current = job({ status, candidates: [] });
    await assert.rejects(api.getJob(JOB_ID), /free preview boundary/);
  }
  response.current = job({ mode: 'ACHIEVEMENT', requested_rarity: 'LEGENDARY' });
  await assert.rejects(api.getJob(JOB_ID), /free preview boundary/);
  response.current = job({ id: '44444444-4444-4444-8444-444444444444' });
  await assert.rejects(api.getJob(JOB_ID), /identity mismatch/);
});

test('Token Portal Forge client never imports or calls the workspace Forge transport', () => {
  const source = readFileSync(new URL('../tokenPortal/forge.ts', import.meta.url), 'utf8');
  assert.match(source, /tokenPortalApiClient/);
  assert.doesNotMatch(source, /from ['"]\.\.\/api\/apiClient['"]/);
  assert.doesNotMatch(source, /['"]\/api\/v1\/artifacts\/forge/);
  assert.doesNotMatch(source, /signTransaction|sendTransaction|valueRail/i);
});
