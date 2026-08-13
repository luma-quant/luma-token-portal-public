import { FROZEN_FORGE_PREVIEW, parseRelease, parseTokenFacts } from './public-contract.mjs';

const main = document.querySelector('#main');

function element(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(options)) {
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'href') node.setAttribute('href', value);
    else if (key === 'ariaLabel') node.setAttribute('aria-label', value);
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  return node;
}

function fact(label, value, note) {
  return element('article', { className: 'fact-card' }, [
    element('p', { className: 'eyebrow', text: label }),
    element('p', { className: 'fact-value', text: value }),
    element('p', { className: 'fact-note', text: note }),
  ]);
}

function badge(text, tone = 'neutral') {
  return element('span', { className: `badge badge-${tone}`, text });
}

function render(facts, release) {
  const treasury = facts.operational_addresses.find((entry) => entry.label === 'Treasury vault');
  const sale = facts.operational_addresses.find((entry) => entry.label === 'Sale wallet');
  if (!treasury || !sale) throw new Error('Published operational roles are incomplete.');

  const header = element('header', { className: 'site-header' }, [
    element('div', { className: 'brand' }, [
      element('img', { src: './logo-1.webp', alt: 'LUMA Quant mark', width: '42', height: '42' }),
      element('div', {}, [
        element('p', { className: 'brand-name', text: 'LUMA Quant' }),
        element('p', { className: 'brand-subtitle', text: 'Trust Reference Candidate' }),
      ]),
    ]),
    element('div', { className: 'header-badges' }, [
      badge(release.version, 'cyan'),
      badge('Reference only', 'green'),
      badge('Audit not completed', 'amber'),
    ]),
  ]);

  const hero = element('section', { className: 'hero', 'aria-labelledby': 'hero-title' }, [
    element('p', { className: 'eyebrow cyan', text: 'SANITIZED PUBLIC REVIEW · EVIDENCE FIRST' }),
    element('h1', { id: 'hero-title', text: 'Verify the facts. See the boundary.' }),
    element('p', {
      className: 'hero-copy',
      text: 'This local reference implementation publishes a narrow, reviewable trust surface for LUMA. It is not the production frontend and does not connect wallets, accept money, deliver tokens, issue keys, mint NFTs or sign transactions.',
    }),
    element('div', { className: 'trust-line' }, [
      badge('Solana Mainnet facts observed', 'cyan'),
      badge('Operator claims labelled', 'violet'),
      badge('Production alignment: reference only', 'green'),
    ]),
  ]);

  const tokenFacts = element('section', { className: 'section', 'aria-labelledby': 'token-title' }, [
    element('div', { className: 'section-heading' }, [
      element('div', {}, [
        element('p', { className: 'eyebrow cyan', text: 'TOKEN FACTS' }),
        element('h2', { id: 'token-title', text: '$LUMA on Solana' }),
      ]),
      element('p', { className: 'timestamp', text: `Finalized observation · slot ${facts.observation.supply_slot} · ${facts.observed_at}` }),
    ]),
    element('div', { className: 'facts-grid' }, [
      fact('Mint address', facts.asset.mint_address, 'On-chain mint account'),
      fact('Token program', facts.asset.token_program, 'Classic SPL Token program'),
      fact('Decimals', String(facts.asset.decimals), 'On-chain mint field'),
      fact('Observed supply', `${facts.asset.supply_display} LUMA`, 'Point-in-time total mint supply; not circulating supply'),
      fact('Mint authority', facts.asset.mint_authority, 'On-chain authority field'),
      fact('Freeze authority', facts.asset.freeze_authority, 'On-chain authority field'),
    ]),
    element('p', { className: 'boundary-note', text: 'The chain proves account state. It does not prove product utility, price, legal classification, treasury role, reserve allocation or future value.' }),
  ]);

  const operations = element('section', { className: 'section split', 'aria-labelledby': 'roles-title' }, [
    element('div', {}, [
      element('p', { className: 'eyebrow cyan', text: 'OPERATIONAL ROLES' }),
      element('h2', { id: 'roles-title', text: 'Declared addresses, carefully labelled' }),
      element('p', { className: 'section-copy', text: 'Both addresses existed as non-executable System Program accounts at the observation slot. Their named roles are operator declarations, not fields encoded by Solana.' }),
    ]),
    element('div', { className: 'address-list' }, [
      fact(treasury.label, treasury.address, 'Operator-declared role · raw point-in-time account evidence included'),
      fact(sale.label, sale.address, 'Operator-declared role · raw point-in-time account evidence included'),
    ]),
  ]);

  const utility = facts.utility_policy;
  const utilitySection = element('section', { className: 'section', 'aria-labelledby': 'utility-title' }, [
    element('p', { className: 'eyebrow cyan', text: 'DECLARED PRODUCT POLICY · NOT ON-CHAIN' }),
    element('h2', { id: 'utility-title', text: 'Utility terms are separate from token facts' }),
    element('div', { className: 'facts-grid policy-grid' }, [
      fact('Reference allocation price', `${utility.reference_price_usdc_per_luma} USDC / LUMA`, 'Operator product configuration; no execution here'),
      fact('One LUMAKey', `${utility.lumakey_cost_display} LUMA`, `${utility.lumakey_credit_entitlement.toLocaleString('en-US')} Quant Lab credits after valid redemption`),
      fact('Package policy', '25 · 100 · 500+ USDC', 'Declared package sizes; this candidate has no checkout'),
      fact('Access model', 'Credits, not 365 days', 'A key is single-use; access duration is not represented by this candidate'),
    ]),
  ]);

  const forge = element('section', { className: 'section', 'aria-labelledby': 'forge-title' }, [
    element('div', { className: 'section-heading' }, [
      element('div', {}, [
        element('p', { className: 'eyebrow cyan', text: 'NFT FORGE CONTRACT' }),
        element('h2', { id: 'forge-title', text: 'Free deterministic preview only' }),
      ]),
      badge(`${FROZEN_FORGE_PREVIEW.candidate_count} candidates · choose 1`, 'violet'),
    ]),
    element('div', { className: 'forge-grid' }, [
      fact('Selectable visual grades', FROZEN_FORGE_PREVIEW.selectable_grades.join(' · '), 'Explicit choice; never a paid random roll'),
      fact('Earned-only labels', FROZEN_FORGE_PREVIEW.earned_only_grades.join(' · '), 'Not selectable; current preview assigns neither'),
      fact('Modes', FROZEN_FORGE_PREVIEW.modes.join(' · '), 'Guided or Surprise'),
      fact('Execution', 'No payment · no mint', 'No LUMA spend and no transaction signature'),
    ]),
    element('p', { className: 'boundary-note', text: 'Rarity is a visual treatment, not a promise of market value. Achievement mode, minting and paid generation are disabled in this public contract.' }),
  ]);

  const boundary = element('section', { className: 'section boundary', 'aria-labelledby': 'boundary-title' }, [
    element('p', { className: 'eyebrow cyan', text: 'PUBLIC / PRIVATE BOUNDARY' }),
    element('h2', { id: 'boundary-title', text: 'What this candidate intentionally cannot do' }),
    element('ul', { className: 'boundary-list' }, [
      'No wallet connection or identity signature',
      'No SOL or USDC checkout',
      'No LUMA transfer or fulfillment',
      'No LUMAKey issuance or redemption',
      'No NFT mint or marketplace action',
      'No backend, database, administration or treasury control code',
    ].map((text) => element('li', { text }))),
  ]);

  const antiScam = element('section', { className: 'section boundary', 'aria-labelledby': 'security-title' }, [
    element('p', { className: 'eyebrow cyan', text: 'SECURITY / ANTI-SCAM' }),
    element('h2', { id: 'security-title', text: 'Verify before you interact' }),
    element('ul', { className: 'boundary-list' }, [
      `Verify the domain and canonical mint ${facts.asset.mint_address} before trusting a token link.`,
      'Never share a seed phrase, private key, recovery phrase or wallet export with anyone.',
      'Do not send SOL, USDC or LUMA manually to an address without a server-issued order and matching reference.',
      'This reference cannot request a wallet signature or payment. Treat any such prompt here as fraudulent.',
    ].map((text) => element('li', { text }))),
  ]);

  const footer = element('footer', { className: 'footer' }, [
    element('p', { text: `${release.version} · ${release.release_class} · ${release.production_alignment} · ${release.publish_state}` }),
    element('div', { className: 'footer-links' }, [
      element('a', { href: facts.links.solana_rpc_docs, text: 'Solana RPC method' }),
      element('a', { href: facts.links.mint_explorer, text: 'Mint explorer' }),
    ]),
  ]);

  main.replaceChildren(header, hero, tokenFacts, operations, utilitySection, forge, boundary, antiScam, footer);
  main.setAttribute('aria-busy', 'false');
}

async function loadJson(path) {
  const response = await fetch(path, { credentials: 'omit', cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not load ${path}.`);
  return response.json();
}

try {
  const [factsValue, releaseValue] = await Promise.all([
    loadJson('./TOKEN_FACTS.json'),
    loadJson('./RELEASE.json'),
  ]);
  render(parseTokenFacts(factsValue), parseRelease(releaseValue));
} catch {
  main.replaceChildren(element('section', { className: 'fatal', role: 'alert' }, [
    element('p', { className: 'eyebrow', text: 'FAIL CLOSED' }),
    element('h1', { text: 'Public evidence could not be verified.' }),
    element('p', { text: 'No token, utility or Forge claims are shown because the bundled contract failed validation.' }),
  ]));
  main.setAttribute('aria-busy', 'false');
}
