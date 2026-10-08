export type PlanId = "FREE" | "UNLIMITED_REPORTS" | "DEALER_PRO";

export type SubscriptionStatus = "ACTIVE" | "INACTIVE";

export interface Subscription {
  plan: PlanId;
  status: SubscriptionStatus;
  subscribedAt: string;
  autoUpgradeTestMode: boolean;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  password: string; // Plain text for mock auth (demo only)
  subscription: Subscription;
  reportsRun: number;
  totalSavings: number;
}

export const PLANS: Record<PlanId, { name: string; price: number; features: string[]; description: string }> = {
  FREE: {
    name: "Basic Free",
    price: 0,
    description: "Essential pricing info for casual shoppers",
    features: [
      "View MSRP pricing",
      "Basic trim comparison",
      "5 reports per month",
      "Standard dealer contact info",
    ],
  },
  UNLIMITED_REPORTS: {
    name: "Unlimited Reports",
    price: 29,
    description: "Full pricing intelligence for serious buyers",
    features: [
      "Unlimited reports",
      "MSRP vs Invoice comparison",
      "Dealer profit margin analysis",
      "Rebate and incentive tracking",
      "Offer calculator",
      "5% savings on average",
    ],
  },
  DEALER_PRO: {
    name: "Dealer Pro",
    price: 99,
    description: "Wholesale-level intelligence for power users",
    features: [
      "Everything in Unlimited Reports",
      "Wholesale invoice access",
      "Factory-to-dealer rebate data",
      "Negotiation target calculator",
      "Local dealer verified contacts",
      "3% margin guarantee program",
      "$2,400 average savings",
    ],
  },
};

// Initial hardcoded accounts
export const MOCK_USERS: UserAccount[] = [
  {
    id: "user-001",
    email: "test@example.com",
    name: "Alex Patel",
    password: "demo123",
    subscription: {
      plan: "UNLIMITED_REPORTS",
      status: "ACTIVE",
      subscribedAt: "2026-10-01",
      autoUpgradeTestMode: true,
    },
    reportsRun: 12,
    totalSavings: 22200,
  },
];

// Helper to persist users to localStorage
const STORAGE_KEY = "carcostcanada_users";

export function loadUsers(): UserAccount[] {
  if (typeof window === "undefined") return MOCK_USERS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as UserAccount[];
      // Merge with defaults to ensure all fields exist
      return parsed.length > 0 ? parsed : MOCK_USERS;
    }
  } catch {
    // Ignore parse errors
  }
  return MOCK_USERS;
}

export function saveUsers(users: UserAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage errors
  }
}

// Initialize users from localStorage on module load (client-side only)
export const CURRENT_USERS_KEY = "carcostcanada_current_users";
export let CURRENT_USERS: UserAccount[] = [];

// Extend window interface for CURRENT_USERS
declare global {
  interface Window {
    CURRENT_USERS: UserAccount[];
  }
}

if (typeof window !== "undefined") {
  window.CURRENT_USERS = [];
}

export function initializeUsers(): void {
  if (typeof window !== "undefined") {
    window.CURRENT_USERS = loadUsers();
  CURRENT_USERS = window.CURRENT_USERS;
  }
}

// Export current users for direct access (after initialization)
export function getUsers(): UserAccount[] {
  return CURRENT_USERS;
}

// Find user by email
export function findUserByEmail(email: string): UserAccount | undefined {
  return CURRENT_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// Find user by ID
export function findUserById(id: string): UserAccount | undefined {
  return CURRENT_USERS.find((u) => u.id === id);
}

// Create a new user
export function createUser(email: string, password: string, name: string): UserAccount {
  const newUser: UserAccount = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    name,
    password,
    subscription: {
      plan: "FREE",
      status: "INACTIVE",
      subscribedAt: "",
      autoUpgradeTestMode: false,
    },
    reportsRun: 0,
    totalSavings: 0,
  };
  window.CURRENT_USERS.push(newUser);
  saveUsers(window.CURRENT_USERS);
  CURRENT_USERS = window.CURRENT_USERS;
  return newUser;
}

// Update subscription for a user (auto-subscribe test mode)
export function upgradeSubscription(userId: string, plan: PlanId): UserAccount | undefined {
  const user = findUserById(userId);
  if (!user) return undefined;

  user.subscription = {
    plan,
    status: "ACTIVE",
    subscribedAt: new Date().toISOString().split("T")[0] || new Date().toISOString().slice(0, 10),
    autoUpgradeTestMode: true,
  };

  saveUsers(window.CURRENT_USERS);
  return user;
}

// Track a report run
export function incrementReportsRun(userId: string, savings: number): UserAccount | undefined {
  const user = findUserById(userId);
  if (!user) return undefined;

  user.reportsRun += 1;
  user.totalSavings += savings;

  saveUsers(window.CURRENT_USERS);
  return user;
}
