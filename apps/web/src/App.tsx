import { useEffect, useState, useCallback } from "react";
import { initializeUsers, findUserById, incrementReportsRun } from "./users";
import type { UserAccount } from "./users";
import { getVehicleById } from "./vehicles";
import type { Vehicle } from "./vehicles";
import { AuthModal } from "./components/AuthModal";
import { PricingCard } from "./components/PricingCard";
import { VehicleConfigurator } from "./components/VehicleConfigurator";
import { InvoiceReportView } from "./components/InvoiceReportView";
import { ExecutiveReportView } from "./components/ExecutiveReportView";

type View = "home" | "pricing" | "configurator" | "invoice" | "executive";

function parseHash(): View {
  const h = window.location.hash.replace(/^#/, "");
  const parts = (h ?? "").split("/").filter(Boolean);

  if (parts[0] === "pricing") return "pricing";
  if (parts[0] === "configurator") return "configurator";
  if (parts[0] === "invoice") return "invoice";
  if (parts[0] === "executive") return "executive";
  return "home";
}

export function App() {
  const [view, setView] = useState<View>(parseHash);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  const [platformStats, setPlatformStats] = useState({
    totalReportsRun: 0,
    totalSubscribers: 0,
    averageSavings: 0,
  });

  // Initialize users from localStorage
  useEffect(() => {
    initializeUsers();
  }, []);

  // Load current user from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("carcostcanada_current_user");
    if (storedUserId) {
      const user = findUserById(storedUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
    setLoading(false);
  }, []);

  // Update platform stats when user changes
  useEffect(() => {
    if (currentUser) {
      const users = [...window.CURRENT_USERS || []];
      const activeSubscribers = users.filter(
        (u) => u.subscription.status === "ACTIVE" && u.id !== currentUser.id
      ).length;
      const totalReports = users.reduce((sum, u) => sum + u.reportsRun, 0);
      const totalSavings = users.reduce((sum, u) => sum + u.totalSavings, 0);
      const avgSavings = activeSubscribers > 0 ? Math.round(totalSavings / activeSubscribers) : 1850;

      setPlatformStats({
        totalReportsRun: totalReports + currentUser.reportsRun,
        totalSubscribers: activeSubscribers + (currentUser.subscription.status === "ACTIVE" ? 1 : 0),
        averageSavings: avgSavings,
      });
    }
  }, [currentUser]);

  // Persist current user to localStorage
  const handleAuthSuccess = useCallback((user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem("carcostcanada_current_user", user.id);
    setAuthModalOpen(false);
    window.location.hash = "";
  }, []);

  const handleSubscriptionChange = useCallback((user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem("carcostcanada_current_user", user.id);
  }, []);

  const handleSignOut = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("carcostcanada_current_user");
    window.location.hash = "";
  }, []);

  const handleVehicleSelect = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  }, []);

  const handleRunReport = useCallback(() => {
    if (!currentUser || !selectedVehicle) return;

    // Calculate simulated savings (10-25% of MSRP difference)
    const msrpDiff = selectedVehicle.pricing.msrp - selectedVehicle.pricing.invoicePrice;
    const simulatedSavings = Math.round(msrpDiff * (0.1 + Math.random() * 0.15));

    // Increment reports run and savings
    const updatedUser = incrementReportsRun(currentUser.id, simulatedSavings);
    if (updatedUser) {
      setCurrentUser(updatedUser);
      localStorage.setItem("carcostcanada_current_user", updatedUser.id);

      // Show success feedback
      alert(`Report generated! Estimated savings: ${new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: 0,
      }).format(simulatedSavings)}`);
    }
  }, [currentUser, selectedVehicle]);

  const navigate = useCallback((v: View) => {
    if (v === "home") window.location.hash = "";
    else if (v === "pricing") window.location.hash = "#pricing";
    else if (v === "configurator") window.location.hash = "#configurator";
    else if (v === "invoice") window.location.hash = "#invoice";
    else if (v === "executive") window.location.hash = "#executive";
    setView(v);
  }, []);

  // React to hash changes
  useEffect(() => {
    const onHash = () => setView(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading CarCostCanada...</p>
      </div>
    );
  }

  // Auth modal when not logged in
  if (!currentUser) {
    return (
      <div className="auth-container">
        <div className="auth-logo">
          <svg viewBox="0 0 48 48" width="48" height="48">
            <rect width="48" height="48" rx="12" fill="#1a56db"/>
            <path d="M14 34V14h4v12h6v8h-6z M24 34V14h4v12h6v8h-6z M34 34V14h4v20h-4z" fill="white"/>
          </svg>
          <h1>CarCostCanada</h1>
        </div>
        <p className="auth-tagline">
          Smart vehicle pricing intelligence for Canadian buyers
        </p>
        <button className="btn btn-primary btn-large auth-cta" onClick={() => setAuthModalOpen(true)}>
          Get Started
        </button>
        <AuthModal onAuthSuccess={handleAuthSuccess} onClose={() => window.location.reload()} />
      </div>
    );
  }

  // Main app layout
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-brand" onClick={() => navigate("home")}>
          <svg viewBox="0 0 48 48" width="32" height="32">
            <rect width="48" height="48" rx="12" fill="#1a56db"/>
            <path d="M14 34V14h4v12h6v8h-6z M24 34V14h4v12h6v8h-6z M34 34V14h4v20h-4z" fill="white"/>
          </svg>
          <span>CarCostCanada</span>
        </div>

        <div className="nav-links">
          <button className={`nav-link ${view === "configurator" ? "active" : ""}`} onClick={() => navigate("configurator")}>
            Build & Price
          </button>
          <button className={`nav-link ${view === "invoice" ? "active" : ""}`} onClick={() => navigate("invoice")}>
            Invoice Report
          </button>
          <button className={`nav-link ${view === "executive" ? "active" : ""}`} onClick={() => navigate("executive")}>
            Dashboard
          </button>
        </div>

        <div className="nav-user">
          <div className="user-badge">
            <span className="user-plan-indicator plan-{currentUser.subscription.plan.toLowerCase()}"></span>
            <span className="user-plan-name">{currentUser.subscription.plan}</span>
          </div>
          <button className="btn btn-ghost" onClick={() => setAuthModalOpen(true)}>
            Switch Account
          </button>
          <button className="btn btn-ghost" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {view === "home" && (
          <div className="home-view">
            {/* Account Dashboard Banner */}
            <div className="account-banner">
              <div className="banner-user">
                <div className="banner-avatar">
                  {currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="banner-info">
                  <div className="banner-name">{currentUser.name}</div>
                  <div className="banner-email">{currentUser.email}</div>
                </div>
              </div>
              <div className="banner-stats">
                <div className="banner-stat">
                  <span className="stat-value">{currentUser.reportsRun}</span>
                  <span className="stat-label">Reports</span>
                </div>
                <div className="banner-stat">
                  <span className="stat-value savings">
                    {new Intl.NumberFormat("en-CA", {
                      style: "currency",
                      currency: "CAD",
                      minimumFractionDigits: 0,
                    }).format(currentUser.totalSavings)}
                  </span>
                  <span className="stat-label">Savings</span>
                </div>
                <div className="banner-plan">
                  <span className="plan-badge plan-{currentUser.subscription.plan.toLowerCase()}">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    {currentUser.subscription.plan === "FREE" ? "Free Plan" : `${currentUser.subscription.plan.replace("_", " ")} - Active`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h2>What would you like to do?</h2>
              <div className="action-cards">
                <button className="action-card" onClick={() => navigate("configurator")}>
                  <div className="action-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div className="action-text">
                    <h3>Build & Price a Vehicle</h3>
                    <p>Select make, model, year, and trim to see pricing details</p>
                  </div>
                  <svg className="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>

                <button className="action-card" onClick={() => navigate("invoice")}>
                  <div className="action-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <div className="action-text">
                    <h3>View Dealer Invoice Report</h3>
                    <p>See MSRP vs invoice, dealer margins, and rebates</p>
                  </div>
                  <svg className="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>

                <button className="action-card" onClick={() => navigate("executive")}>
                  <div className="action-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </div>
                  <div className="action-text">
                    <h3>View Your Dashboard</h3>
                    <p>Track your reports, savings, and usage metrics</p>
                  </div>
                  <svg className="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>

                <button className="action-card highlight" onClick={() => navigate("pricing")}>
                  <div className="action-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div className="action-text">
                    <h3>Upgrade Your Plan</h3>
                    <p>Unlock full dealer invoice reports and savings tools</p>
                  </div>
                  <svg className="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "pricing" && (
          <div className="pricing-view">
            <div className="page-header">
              <h2>Pricing & Subscription</h2>
              <p>Choose the plan that fits your vehicle buying needs</p>
            </div>
            <div className="pricing-container">
              <PricingCard currentUser={currentUser} onSubscriptionChange={handleSubscriptionChange} />
            </div>
          </div>
        )}

        {view === "configurator" && (
          <div className="configurator-view">
            <VehicleConfigurator onVehicleSelect={handleVehicleSelect} />
          </div>
        )}

        {view === "invoice" && (
          <div className="invoice-view">
            {selectedVehicle ? (
              <InvoiceReportView
                vehicle={selectedVehicle}
                currentUser={currentUser}
                onRunReport={handleRunReport}
              />
            ) : (
              <div className="invoice-prompt">
                <div className="prompt-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <h3>Select a Vehicle First</h3>
                <p>
                  Go to <button className="inline-link" onClick={() => navigate("configurator")}>Build & Price</button>
                  to select a vehicle, then come back here to view the dealer invoice report.
                </p>
                <button className="btn btn-primary" onClick={() => navigate("configurator")}>
                  Browse Vehicles
                </button>
              </div>
            )}
          </div>
        )}

        {view === "executive" && (
          <div className="executive-view">
            <ExecutiveReportView
              currentUser={currentUser}
              totalReportsRun={platformStats.totalReportsRun}
              totalSubscribers={platformStats.totalSubscribers}
              averageSavings={platformStats.averageSavings}
            />
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal onAuthSuccess={handleAuthSuccess} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
