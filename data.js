// ── USERS ────────────────────────────────────────────────────────────────────
// Passwords stored as plain text here for demo purposes.
// In production, use bcrypt hashes and a real backend / Azure AD B2C.
const USERS = [
  { id: 1, username: 'admin',   password: 'admin123',  displayName: 'Admin User',       role: 'admin',  branch: 'Castries Main' },
  { id: 2, username: 'derick',  password: 'pass123',   displayName: 'Derick Hippolyte', role: 'officer', branch: 'Castries Main' },
  { id: 3, username: 'sandra',  password: 'pass123',   displayName: 'Sandra Charles',   role: 'officer', branch: 'Vieux Fort' },
  { id: 4, username: 'marie',   password: 'pass123',   displayName: 'Marie-Claire Louis', role: 'officer', branch: 'Soufrière' },
  { id: 5, username: 'kevin',   password: 'pass123',   displayName: 'Kevin Augustin',   role: 'officer', branch: 'Gros Islet' },
];

// ── STAGES ───────────────────────────────────────────────────────────────────
const STAGES = [
  'Application', 'Doc review', 'Credit check', 'Underwriting', 'Approval', 'Disbursement'
];

const STAGE_BADGES = [
  'received', 'docreview', 'credit', 'underwriting', 'approved', 'disbursed'
];

const STAGE_LABELS_FULL = [
  'Application received', 'Document review', 'Credit assessment',
  'Underwriting', 'Approval', 'Disbursement'
];

// ── LOAN SEED DATA ────────────────────────────────────────────────────────────
let loans = [
  { id: 1, customerName: 'Margaret Fontenelle', accountNo: 'ACC-004821', officerUsername: 'derick', officerName: 'Derick Hippolyte', branch: 'Castries Main', amount: 75000, type: 'Mortgage',  stage: 4, notes: 'Awaiting final sign-off.', createdAt: '2025-05-10' },
  { id: 2, customerName: 'Kevin Joseph',        accountNo: 'ACC-003317', officerUsername: 'sandra', officerName: 'Sandra Charles',   branch: 'Vieux Fort',    amount: 25000, type: 'Business',  stage: 2, notes: 'Credit report requested.', createdAt: '2025-05-18' },
  { id: 3, customerName: 'Alicia Thomas',       accountNo: 'ACC-007104', officerUsername: 'derick', officerName: 'Derick Hippolyte', branch: 'Gros Islet',    amount: 12000, type: 'Personal',  stage: 5, notes: 'Funds disbursed 28 May.', createdAt: '2025-04-02' },
  { id: 4, customerName: 'Ronnie Baptiste',     accountNo: 'ACC-005592', officerUsername: 'marie',  officerName: 'Marie-Claire Louis', branch: 'Soufrière',   amount: 40000, type: 'Auto',      stage: 1, notes: 'Waiting on payslips.', createdAt: '2025-05-29' },
  { id: 5, customerName: 'Sheryl Augustin',     accountNo: 'ACC-002980', officerUsername: 'sandra', officerName: 'Sandra Charles',   branch: 'Castries Main', amount: 8500,  type: 'Education', stage: 3, notes: '', createdAt: '2025-05-22' },
  { id: 6, customerName: 'Paul Emmanuel',       accountNo: 'ACC-008841', officerUsername: 'kevin',  officerName: 'Kevin Augustin',   branch: 'Gros Islet',    amount: 55000, type: 'Mortgage',  stage: 0, notes: 'Application just submitted.', createdAt: '2025-06-01' },
];

let nextLoanId = 7;

function getLoansByOfficer(username) {
  return loans.filter(l => l.officerUsername === username);
}

function getUserByUsername(username) {
  return USERS.find(u => u.username === username) || null;
}

function addLoan(data) {
  const loan = { id: nextLoanId++, ...data, createdAt: new Date().toISOString().slice(0,10) };
  loans.push(loan);
  return loan;
}

function updateLoan(id, data) {
  const idx = loans.findIndex(l => l.id === id);
  if (idx === -1) return null;
  loans[idx] = { ...loans[idx], ...data };
  return loans[idx];
}
