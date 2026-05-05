export type FindingStatus = 'at-risk' | 'reduced';

export interface App {
  id: string;
  name: string;
  sector: string;
  agency: string;
  version: string;
  risks: number;
  atRisk: number;
}

export interface Feature {
  id: string;
  name: string;
  platform: string;
  desc: string;
}

export interface Risk {
  id: string;
  featureId: string;
  title: string;
  block: boolean;
  desc: string;
}

export type FindingsMap = Record<string, Record<string, FindingStatus>>;


export const APPS: App[] = [
  { id: 'A-001', name: 'NorthBank Mobile', sector: 'Financial Services', agency: 'NorthBank Holdings', version: '4.12.1', risks: 18, atRisk: 7 },
  { id: 'A-002', name: 'MetroPay Wallet', sector: 'Financial Services', agency: 'MetroPay Inc.', version: '2.8.0', risks: 14, atRisk: 5 },
  { id: 'A-003', name: 'HealthTrack', sector: 'Healthcare', agency: 'CareSync Health', version: '1.5.3', risks: 12, atRisk: 4 },
  { id: 'A-004', name: 'GovConnect', sector: 'Public Sector', agency: 'Ministry of Digital Services', version: '3.2.0', risks: 16, atRisk: 9 },
  { id: 'A-005', name: 'CargoFleet', sector: 'Logistics', agency: 'CargoFleet Group', version: '5.0.4', risks: 9, atRisk: 2 },
  { id: 'A-006', name: 'EduCampus', sector: 'Education', agency: 'EduCampus Foundation', version: '2.1.7', risks: 7, atRisk: 1 },
  { id: 'A-007', name: 'RetailGo', sector: 'Retail', agency: 'RetailGo Ltd.', version: '6.4.0', risks: 11, atRisk: 3 },
];

export const FEATURES: Feature[] = [
  { id: 'F-001', name: 'Biometric Authentication', platform: 'iOS / Android', desc: 'Fingerprint and Face ID login flow used to unlock the application.' },
  { id: 'F-002', name: 'In-App Payments', platform: 'iOS / Android', desc: 'Card-on-file checkout and tokenized transaction handling.' },
  { id: 'F-003', name: 'Local Data Storage', platform: 'iOS / Android', desc: 'Encrypted cache for user profile, sessions, and offline content.' },
  { id: 'F-004', name: 'Push Notifications', platform: 'iOS / Android', desc: 'Transactional and marketing push delivery via APNs / FCM.' },
  { id: 'F-005', name: 'Deep Linking', platform: 'iOS / Android', desc: 'Universal links and Android App Links handling for routing.' },
  { id: 'F-006', name: 'Third-Party SDKs', platform: 'iOS / Android', desc: 'Analytics, attribution, crash reporting and ads SDKs bundled in app.' },
];

export const RISKS: Risk[] = [
  { id: 'R-001', featureId: 'F-001', title: 'Weak biometric fallback', block: true, desc: 'Biometric prompt allows fallback to a 4-digit PIN that is not rate-limited and not bound to the secure enclave.' },
  { id: 'R-002', featureId: 'F-002', title: 'Card data logged in plaintext', block: true, desc: 'PAN and CVV briefly captured in debug logs during checkout flow on certain device profiles.' },
  { id: 'R-003', featureId: 'F-003', title: 'Cache not cleared on logout', block: false, desc: 'Encrypted cache persists across user sessions and is not invalidated when a user signs out.' },
  { id: 'R-004', featureId: 'F-004', title: 'Sensitive content in lock-screen notifications', block: false, desc: 'OTP codes and balances appear in notification previews on the lock screen.' },
  { id: 'R-005', featureId: 'F-005', title: 'Open redirect via deep link', block: true, desc: 'Deep link handler forwards arbitrary URLs to an in-app browser without allowlist checks.' },
  { id: 'R-006', featureId: 'F-006', title: 'Outdated third-party SDK', block: false, desc: 'Bundled analytics SDK is two major versions behind and has known CVEs published.' },
  { id: 'R-007', featureId: 'F-001', title: 'No jailbreak/root detection', block: false, desc: 'App runs unrestricted on jailbroken / rooted devices with no warning or attestation.' },
];

export const FINDINGS: FindingsMap = {
  'A-001': { 'R-001': 'reduced', 'R-002': 'at-risk', 'R-003': 'at-risk', 'R-004': 'reduced', 'R-005': 'at-risk', 'R-006': 'reduced', 'R-007': 'at-risk' },
  'A-002': { 'R-001': 'at-risk', 'R-002': 'reduced', 'R-003': 'reduced', 'R-004': 'at-risk', 'R-005': 'reduced', 'R-006': 'at-risk', 'R-007': 'reduced' },
  'A-003': { 'R-001': 'reduced', 'R-002': 'reduced', 'R-003': 'at-risk', 'R-004': 'reduced', 'R-005': 'at-risk', 'R-006': 'reduced', 'R-007': 'reduced' },
  'A-004': { 'R-001': 'at-risk', 'R-002': 'at-risk', 'R-003': 'at-risk', 'R-004': 'at-risk', 'R-005': 'at-risk', 'R-006': 'reduced', 'R-007': 'reduced' },
  'A-005': { 'R-001': 'reduced', 'R-002': 'reduced', 'R-003': 'reduced', 'R-004': 'reduced', 'R-005': 'reduced', 'R-006': 'at-risk', 'R-007': 'at-risk' },
  'A-006': { 'R-001': 'reduced', 'R-002': 'reduced', 'R-003': 'reduced', 'R-004': 'reduced', 'R-005': 'reduced', 'R-006': 'reduced', 'R-007': 'at-risk' },
  'A-007': { 'R-001': 'reduced', 'R-002': 'at-risk', 'R-003': 'reduced', 'R-004': 'at-risk', 'R-005': 'at-risk', 'R-006': 'reduced', 'R-007': 'reduced' },
};

export const SECTORS = ['Financial Services', 'Healthcare', 'Public Sector', 'Logistics', 'Education', 'Retail', 'Telecommunications'];
