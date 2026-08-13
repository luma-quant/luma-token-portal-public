import type { AxiosInstance } from 'axios';

import {
  parseArtifactForgeCollections,
  parseArtifactForgeJob,
  type ArtifactForgeCollection,
  type ArtifactForgeJob,
  type ArtifactForgeRarity,
  type ArtifactForgeTheme,
} from '../api/artifactForge';
import { tokenPortalApiClient } from './apiClient';

export const TOKEN_PORTAL_FORGE_BASE_PATH = '/api/v1/token-portal/artifacts/forge' as const;
export const TOKEN_PORTAL_FORGE_SCOPES = [
  'portal:forge:read',
  'portal:forge:create',
  'portal:forge:select',
] as const;
export const TOKEN_PORTAL_FORGE_SELECTABLE_GRADES = ['RARE', 'EPIC'] as const;
export const TOKEN_PORTAL_FORGE_EARNED_ONLY_GRADES = ['LEGENDARY', 'MYTHIC'] as const;
export const TOKEN_PORTAL_FORGE_MODES = ['GUIDED', 'SURPRISE'] as const;
export const TOKEN_PORTAL_FORGE_THEMES = [
  'QUANTUM_CORE',
  'DATA_FRONTIER',
  'PROBABILITY_FIELD',
  'PERSONAL_CONSTELLATION',
] as const;

export type TokenPortalForgeMode = typeof TOKEN_PORTAL_FORGE_MODES[number];
export type TokenPortalForgeRarity = typeof TOKEN_PORTAL_FORGE_SELECTABLE_GRADES[number];
export type TokenPortalForgeTheme = typeof TOKEN_PORTAL_FORGE_THEMES[number];

export type TokenPortalForgeConfig = {
  enabled: true;
  runtime: 'DETERMINISTIC_PREVIEW';
  candidate_count: 3;
  selectable_grades: TokenPortalForgeRarity[];
  earned_only_grades: Array<typeof TOKEN_PORTAL_FORGE_EARNED_ONLY_GRADES[number]>;
  paid_random: false;
  modes: TokenPortalForgeMode[];
  themes: TokenPortalForgeTheme[];
  achievement_mode_available: false;
  generation_payment_required: false;
  mint_enabled: false;
  mint_network: null;
  mint_cost_luma_atoms: null;
};

export type TokenPortalForgeCreateRequest =
  | {
      collection_id: string;
      mode: 'GUIDED';
      requested_rarity: TokenPortalForgeRarity;
      theme: TokenPortalForgeTheme;
    }
  | {
      collection_id: string;
      mode: 'SURPRISE';
      requested_rarity: TokenPortalForgeRarity;
    };

export type TokenPortalForgeTransport = Pick<AxiosInstance, 'get' | 'post'>;

export type TokenPortalForgeApi = {
  getConfig(): Promise<TokenPortalForgeConfig>;
  getCollections(): Promise<ArtifactForgeCollection[]>;
  createJob(request: TokenPortalForgeCreateRequest, idempotencyKey: string): Promise<ArtifactForgeJob>;
  getJob(jobId: string): Promise<ArtifactForgeJob>;
  selectCandidate(jobId: string, candidateIndex: 1 | 2 | 3): Promise<ArtifactForgeJob>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FREE_PREVIEW_JOB_STATUSES = new Set<ArtifactForgeJob['status']>([
  'GENERATION_RUNNING',
  'CANDIDATES_READY',
  'FINAL_SELECTED',
  'FAILED',
  'CANCELLED',
]);

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} returned an invalid response.`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(source: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(source).sort();
  const contract = [...expected].sort();
  if (actual.length !== contract.length || actual.some((key, index) => key !== contract[index])) {
    throw new Error(`${label} does not match the frozen contract.`);
  }
}

function exactArray<T extends string>(value: unknown, expected: readonly T[], label: string): T[] {
  if (
    !Array.isArray(value)
    || value.length !== expected.length
    || value.some((item, index) => item !== expected[index])
  ) throw new Error(`${label} does not match the frozen contract.`);
  return [...expected];
}

function uuid(value: unknown, label: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) throw new Error(`${label} is invalid.`);
  return value.toLowerCase();
}

export function parseTokenPortalForgeConfig(value: unknown): TokenPortalForgeConfig {
  const source = record(value, 'Token Portal Forge config');
  exactKeys(source, [
    'enabled',
    'runtime',
    'candidate_count',
    'selectable_grades',
    'earned_only_grades',
    'paid_random',
    'modes',
    'themes',
    'achievement_mode_available',
    'generation_payment_required',
    'mint_enabled',
    'mint_network',
    'mint_cost_luma_atoms',
  ], 'Token Portal Forge config');
  if (
    source.enabled !== true
    || source.runtime !== 'DETERMINISTIC_PREVIEW'
    || source.candidate_count !== 3
    || source.paid_random !== false
    || source.achievement_mode_available !== false
    || source.generation_payment_required !== false
    || source.mint_enabled !== false
    || source.mint_network !== null
    || source.mint_cost_luma_atoms !== null
  ) throw new Error('Token Portal Forge is not the frozen free preview contract.');
  return {
    enabled: true,
    runtime: 'DETERMINISTIC_PREVIEW',
    candidate_count: 3,
    selectable_grades: exactArray(source.selectable_grades, TOKEN_PORTAL_FORGE_SELECTABLE_GRADES, 'Token Portal Forge selectable grades'),
    earned_only_grades: exactArray(source.earned_only_grades, TOKEN_PORTAL_FORGE_EARNED_ONLY_GRADES, 'Token Portal Forge earned-only grades'),
    paid_random: false,
    modes: exactArray(source.modes, TOKEN_PORTAL_FORGE_MODES, 'Token Portal Forge modes'),
    themes: exactArray(source.themes, TOKEN_PORTAL_FORGE_THEMES, 'Token Portal Forge themes'),
    achievement_mode_available: false,
    generation_payment_required: false,
    mint_enabled: false,
    mint_network: null,
    mint_cost_luma_atoms: null,
  };
}

function parsePortalCollections(value: unknown): ArtifactForgeCollection[] {
  const collections = parseArtifactForgeCollections(value);
  for (const collection of collections) {
    const contract = collection.public_contract;
    if (
      contract.access_mode !== 'VERIFIED_WALLET_FORGE'
      || contract.marketplace_enabled !== false
      || contract.trading_enabled !== false
      || contract.minting_enabled !== false
      || contract.paid_random_rarity !== false
    ) throw new Error('Token Portal Forge collection is not a wallet-only, non-minting preview.');
  }
  return collections;
}

function parsePortalJob(value: unknown): ArtifactForgeJob {
  const job = parseArtifactForgeJob(value);
  if (
    !TOKEN_PORTAL_FORGE_MODES.includes(job.mode as TokenPortalForgeMode)
    || !TOKEN_PORTAL_FORGE_SELECTABLE_GRADES.includes(job.requested_rarity as TokenPortalForgeRarity)
    || !FREE_PREVIEW_JOB_STATUSES.has(job.status)
  ) throw new Error('Token Portal Forge job crossed the free preview boundary.');
  return job;
}

function canonicalRequest(request: TokenPortalForgeCreateRequest): TokenPortalForgeCreateRequest {
  const source = record(request, 'Token Portal Forge request');
  const collectionId = uuid(source.collection_id, 'Token Portal Forge collection id');
  if (!TOKEN_PORTAL_FORGE_SELECTABLE_GRADES.includes(source.requested_rarity as TokenPortalForgeRarity)) {
    throw new Error('Token Portal Forge requested grade is invalid.');
  }
  if (source.mode === 'GUIDED') {
    exactKeys(source, ['collection_id', 'mode', 'requested_rarity', 'theme'], 'Token Portal Guided Forge request');
    if (!TOKEN_PORTAL_FORGE_THEMES.includes(source.theme as TokenPortalForgeTheme)) {
      throw new Error('Token Portal Forge theme is invalid.');
    }
    return {
      collection_id: collectionId,
      mode: 'GUIDED',
      requested_rarity: source.requested_rarity as TokenPortalForgeRarity,
      theme: source.theme as TokenPortalForgeTheme,
    };
  }
  if (source.mode === 'SURPRISE') {
    exactKeys(source, ['collection_id', 'mode', 'requested_rarity'], 'Token Portal Surprise Forge request');
    return {
      collection_id: collectionId,
      mode: 'SURPRISE',
      requested_rarity: source.requested_rarity as TokenPortalForgeRarity,
    };
  }
  throw new Error('Token Portal Forge mode is invalid.');
}

export function createTokenPortalForgeApi(
  transport: TokenPortalForgeTransport = tokenPortalApiClient,
): TokenPortalForgeApi {
  return {
    async getConfig() {
      return parseTokenPortalForgeConfig((await transport.get(`${TOKEN_PORTAL_FORGE_BASE_PATH}/config`)).data);
    },
    async getCollections() {
      return parsePortalCollections((await transport.get(`${TOKEN_PORTAL_FORGE_BASE_PATH}/collections`)).data);
    },
    async createJob(request, idempotencyKey) {
      const body = canonicalRequest(request);
      const response = await transport.post(
        `${TOKEN_PORTAL_FORGE_BASE_PATH}/jobs`,
        body,
        { headers: { 'Idempotency-Key': uuid(idempotencyKey, 'Token Portal Forge idempotency key') } },
      );
      const job = parsePortalJob(response.data);
      if (
        job.collection_id !== body.collection_id
        || job.mode !== body.mode
        || job.requested_rarity !== body.requested_rarity
      ) throw new Error('Token Portal Forge job does not match its request.');
      return job;
    },
    async getJob(jobId) {
      const id = uuid(jobId, 'Token Portal Forge job id');
      const job = parsePortalJob((await transport.get(`${TOKEN_PORTAL_FORGE_BASE_PATH}/jobs/${id}`)).data);
      if (job.id !== id) throw new Error('Token Portal Forge job identity mismatch.');
      return job;
    },
    async selectCandidate(jobId, candidateIndex) {
      const id = uuid(jobId, 'Token Portal Forge job id');
      if (candidateIndex !== 1 && candidateIndex !== 2 && candidateIndex !== 3) {
        throw new Error('Token Portal Forge candidate selection is invalid.');
      }
      const job = parsePortalJob((await transport.post(
        `${TOKEN_PORTAL_FORGE_BASE_PATH}/jobs/${id}/selection`,
        { candidate_index: candidateIndex },
      )).data);
      if (
        job.id !== id
        || job.status !== 'FINAL_SELECTED'
        || job.selected_candidate_index !== candidateIndex
      ) throw new Error('Token Portal Forge selection result is invalid.');
      return job;
    },
  };
}

export const tokenPortalForgeApi = createTokenPortalForgeApi();

export function isTokenPortalForgeRarity(value: ArtifactForgeRarity): value is TokenPortalForgeRarity {
  return TOKEN_PORTAL_FORGE_SELECTABLE_GRADES.includes(value as TokenPortalForgeRarity);
}

export function isTokenPortalForgeTheme(value: ArtifactForgeTheme): value is TokenPortalForgeTheme {
  return TOKEN_PORTAL_FORGE_THEMES.includes(value as TokenPortalForgeTheme);
}
