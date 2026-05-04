export interface Feature {
  id: string;                      // e.g. "F-001"
  name: string;
  platform: string;
  description: string;
  additionalContext?: string;
  demonstration: DemonstrationItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Risk {
  id: string;                      // e.g. "R-001"
  featureId: string;               // FK → features.id, CASCADE DELETE
  title: string;
  description: string;
  goal: string;
  isBlocking: boolean;
  demonstration: DemonstrationItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface App {
  id: string;                      // e.g. "A-001"
  name: string;
  sector: string;
  agency: string;
  version: string;
  cisos: CISO[];
  createdAt: Date;
  updatedAt: Date;
  // risks and atRisk are computed at query time — not stored
}

export type FindingStatus = 'at-risk' | 'reduced' | 'unclassified';

export interface Finding {
  id: string;                      // UUID v4
  appId: string;                   // FK → apps.id, CASCADE DELETE
  riskId: string;                  // FK → risks.id, CASCADE DELETE
  status: FindingStatus;
  observation: ObservationItem[];
  createdAt: Date;
  updatedAt: Date;
  // UNIQUE constraint: (appId, riskId)
}

export interface CISO {
  name: string;
  email: string;
}

export type DemonstrationItem = DemoTableItem | DemoStepsItem;

export interface DemoTableItem {
  id: string;
  type: 'table';
  label: string;
  rows: Array<{ Configuration: string; Detail: string }>;
}

export interface DemoStepsItem {
  id: string;
  type: 'steps';
  label: string;
  items: Array<{
    id: string;
    text: string;
    images: string[];
  }>;
}

export type ObservationItem = RiskStatusItem | EvalItem | DemoTableItem | DemoStepsItem;

export interface RiskStatusItem {
  id: 'risk_status';
  text: 'at-risk' | 'reduced';
}

export interface EvalItem {
  id: 'description_status' | 'goal_status';
  label: string;
  text: 'met' | 'not-met';
}
