import { randomUUID } from 'crypto';
import type { Knex } from 'knex';
import type { DemonstrationItem, ObservationItem, FindingStatus, CISO } from '../../shared/types/domain';
import { APPS, FEATURES, RISKS, FINDINGS } from '../../shared/utils/data';

const RISK_GOALS: Record<string, string> = {
  'F-001-R-001': 'Ensure the biometric fallback PIN is rate-limited and bound to the secure enclave.',
  'F-002-R-001': 'Ensure card data is never written to debug logs on any device profile.',
  'F-003-R-001': 'Ensure the encrypted cache is fully invalidated when a user signs out.',
  'F-004-R-001': 'Ensure sensitive content is suppressed from lock-screen notification previews.',
  'F-005-R-001': 'Ensure deep link targets are validated against an allowlist before navigation.',
  'F-006-R-001': 'Ensure all bundled third-party SDKs are current and free of known CVEs.',
  'F-001-R-002': 'Ensure the app detects and responds appropriately to jailbroken or rooted devices.',
};

const APP_CISOS: Record<string, CISO> = {
  'A-001': { name: 'Alex Chen', email: 'a.chen@northbankholdings.com' },
  'A-002': { name: 'Maria Santos', email: 'm.santos@metropay.com' },
  'A-003': { name: 'James Park', email: 'j.park@caresynchealth.com' },
  'A-004': { name: 'Sarah Williams', email: 's.williams@digitalservices.gov' },
  'A-005': { name: 'David Kim', email: 'd.kim@cargofleetgroup.com' },
  'A-006': { name: 'Emma Johnson', email: 'e.johnson@educampus.org' },
  'A-007': { name: 'Michael Brown', email: 'm.brown@retailgo.com' },
};

function placeholderDemonstration(): DemonstrationItem[] {
  return [
    {
      id: 'setup_table',
      type: 'table',
      label: 'Setup',
      rows: [
        { Configuration: 'Platform', Detail: 'iOS / Android' },
        { Configuration: 'Status', Detail: 'Under Review' },
      ],
    },
    {
      id: 'steps',
      type: 'steps',
      label: 'Demonstration',
      items: [{ id: 'step_1', text: 'Placeholder step — to be filled in.', images: [] }],
    },
  ];
}

function buildObservation(status: FindingStatus): ObservationItem[] {
  return [
    { id: 'risk_status', text: status },
    { id: 'description_status', label: 'Description', text: 'met' },
    { id: 'goal_status', label: 'Goal', text: 'met' },
  ];
}

export async function seed(db: Knex): Promise<void> {
  const now = new Date().toISOString();
  const demo = JSON.stringify(placeholderDemonstration());

  for (const f of FEATURES) {
    await db('features').insert({
      id: f.id,
      name: f.name,
      description: f.desc,
      additionalContext: null,
      demonstration: demo,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const r of RISKS) {
    await db('risks').insert({
      id: r.id,
      featureId: r.featureId,
      title: r.title,
      description: r.desc,
      goal: RISK_GOALS[r.id] ?? r.desc,
      isBlocking: r.block ? 1 : 0,
      demonstration: demo,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const a of APPS) {
    await db('apps').insert({
      id: a.id,
      name: a.name,
      sector: a.sector,
      agency: a.agency,
      version: a.version,
      cisos: JSON.stringify([APP_CISOS[a.id] ?? { name: 'Unknown', email: 'unknown@example.com' }]),
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const [appId, risks] of Object.entries(FINDINGS)) {
    for (const [riskId, status] of Object.entries(risks)) {
      await db('findings').insert({
        id: randomUUID(),
        appId,
        riskId,
        status,
        observation: JSON.stringify(buildObservation(status as FindingStatus)),
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}
