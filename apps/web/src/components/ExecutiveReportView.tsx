import { PLANS } from "../users";
import type { UserAccount } from "../users";

interface ExecutiveReportViewProps {
  currentUser: UserAccount;
  totalReportsRun: number;
  totalSubscribers: number;
  averageSavings: number;
}

export function ExecutiveReportView({
  currentUser,
  totalReportsRun,
  totalSubscribers,
  averageSavings,
}: ExecutiveReportViewProps) {
  // Calculate user's average savings per report
  const userAverageSavings = currentUser.reportsRun > 0
    ? Math.round(currentUser.totalSavings / currentUser.reportsRun)
    : 0;

  // Stats based on subscription tier
  const statsByPlan = {
    FREE: {
      reportsRemaining: Math.max(0, 5 - currentUser.reportsRun),
      averageSavingsRange: "$0 - $500",
      accessLevel: "Basic MSRP Only",
    },
    UNLIMITED_REPORTS: {
      reportsRemaining: "Unlimited",
      averageSavingsRange: "$1,200 - $2,400",
      accessLevel: "MSRP + Invoice Comparison",
    },
    DEALER_PRO: {
      reportsRemaining: "Unlimited",
      averageSavingsRange: "$1,850 - $3,200",
      accessLevel: "Full Wholesale Access",
    },
  };

  const userStats = statsByPlan[currentUser.subscription.plan];

  // Calculate total potential savings across all users
  const totalPotentialSavings = totalSubscribers * averageSavings;

  return (
    <div className="executive-report">
      <div className="exec-header">
        <h2>Executive Summary Dashboard</h2>
        <div className="exec-date">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          October 2026
        </div>
      </div>

      {/* User Account Card */}
      <div className="user-card">
        <div className="user-card-header">
          <div className="user-avatar">
            {currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser.name}</div>
            <div className="user-email">{currentUser.email}</div>
          </div>
          <div className={`user-plan-badge plan-${currentUser.subscription.plan.toLowerCase()}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            {currentUser.subscription.plan}
          </div>
        </div>
        <div className="user-stats-row">
          <div className="user-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <div>
              <div className="user-stat-value">{currentUser.reportsRun}</div>
              <div className="user-stat-label">Reports Generated</div>
            </div>
          </div>
          <div className="user-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            <div>
              <div className="user-stat-value savings">{formatCAD(currentUser.totalSavings)}</div>
              <div className="user-stat-label">Total Savings</div>
            </div>
          </div>
          <div className="user-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <div className="user-stat-value">{userAverageSavings > 0 ? formatCAD(userAverageSavings) : "—"}</div>
              <div className="user-stat-label">Avg. Savings/Report</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Reports Run</div>
            <div className="kpi-value">{totalReportsRun.toLocaleString()}</div>
            <div className="kpi-subtitle">All time across platform</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon active-subscribers">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Active Subscribers</div>
            <div className="kpi-value">{totalSubscribers}</div>
            <div className="kpi-subtitle">Test mode subscribers</div>
          </div>
        </div>

        <div className="kpi-card highlight">
          <div className="kpi-icon savings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Member Savings</div>
            <div className="kpi-value savings-value">{formatCAD(totalPotentialSavings)}</div>
            <div className="kpi-subtitle">
              {averageSavings > 0 ? `Avg. ${formatCAD(averageSavings)}/member` : "Est. annual savings"}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon access-level">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Your Access Level</div>
            <div className="kpi-value">{userStats.accessLevel}</div>
            <div className="kpi-subtitle">
              {typeof userStats.reportsRemaining === "number"
                ? `Reports remaining: ${userStats.reportsRemaining}`
                : `Reports: ${userStats.reportsRemaining}`}
            </div>
          </div>
        </div>
      </div>

      {/* Savings Range Indicator */}
      <div className="savings-range">
        <h3>Typical Member Savings</h3>
        <div className="savings-bars">
          <div className="savings-bar-group">
            <div className="savings-bar-label">
              <span>Basic Free</span>
              <span className="savings-bar-value">$0</span>
            </div>
            <div className="savings-bar-track">
              <div className="savings-bar-fill savings-bar-free" style={{ width: "10%" }} />
            </div>
          </div>
          <div className="savings-bar-group">
            <div className="savings-bar-label">
              <span>Unlimited Reports</span>
              <span className="savings-bar-value">$1,200 - $2,400</span>
            </div>
            <div className="savings-bar-track">
              <div className="savings-bar-fill savings-bar-mid" style={{ width: "50%" }} />
            </div>
          </div>
          <div className="savings-bar-group">
            <div className="savings-bar-label">
              <span>Dealer Pro</span>
              <span className="savings-bar-value">$1,850 - $3,200</span>
            </div>
            <div className="savings-bar-track">
              <div className="savings-bar-fill savings-bar-pro" style={{ width: "80%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Usage Stats */}
      <div className="platform-stats">
        <h3>Platform Activity</h3>
        <div className="activity-grid">
          <div className="activity-item">
            <div className="activity-value">{totalReportsRun}</div>
            <div className="activity-label">Reports Generated</div>
          </div>
          <div className="activity-item">
            <div className="activity-value">{totalSubscribers}</div>
            <div className="activity-label">Active Test Subscribers</div>
          </div>
          <div className="activity-item">
            <div className="activity-value">{Object.keys(PLANS).length}</div>
            <div className="activity-label">Subscription Tiers</div>
          </div>
          <div className="activity-item">
            <div className="activity-value">100%</div>
            <div className="activity-label">Test Mode Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Test Mode Notice */}
      <div className="test-mode-notice">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <div>
          <strong>Demo Mode Notice</strong>
          <p>
            This is a demonstration application. All user accounts, subscription data,
            and savings metrics are simulated for testing purposes. No real financial
            transactions occur.
          </p>
        </div>
      </div>
    </div>
  );
}

function formatCAD(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
