import { PLANS, upgradeSubscription } from "../users";
import type { PlanId, UserAccount } from "../users";

interface PricingCardProps {
  currentUser: UserAccount;
  onSubscriptionChange: (user: UserAccount) => void;
}

export function PricingCard({ currentUser, onSubscriptionChange }: PricingCardProps) {
  const handleSubscribe = (planId: PlanId) => {
    const updatedUser = upgradeSubscription(currentUser.id, planId);
    if (updatedUser) {
      onSubscriptionChange(updatedUser);
    }
  };

  const handleCancel = () => {
    // Reset to free plan
    const updatedUser = upgradeSubscription(currentUser.id, "FREE");
    if (updatedUser) {
      onSubscriptionChange(updatedUser);
    }
  };

  return (
    <div className="pricing-card">
      <div className="pricing-header">
        <h2>Choose Your Plan</h2>
        <p>Unlock exclusive dealer invoice reports and savings insights</p>
      </div>

      <div className="pricing-plans">
        {Object.entries(PLANS).map(([planId, plan]) => {
          const isCurrentPlan = currentUser.subscription.plan === planId;
          const isActive = currentUser.subscription.status === "ACTIVE" && isCurrentPlan;

          return (
            <div
              key={planId}
              className={`pricing-plan ${isActive ? "pricing-plan-active" : ""} ${planId === "DEALER_PRO" ? "pricing-plan-popular" : ""}`}
            >
              {planId === "DEALER_PRO" && (
                <div className="pricing-popular-badge">Most Popular</div>
              )}
              <div className="pricing-plan-name">{plan.name}</div>
              <div className="pricing-plan-price">
                <span className="pricing-amount">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                <span className="pricing-period">/{plan.price === 0 ? "" : "mo"}</span>
              </div>
              <p className="pricing-plan-desc">{plan.description}</p>

              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature} className="pricing-feature">
                    <svg className="pricing-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`pricing-btn ${isActive ? "pricing-btn-active" : "pricing-btn-primary"}`}
                onClick={() => handleSubscribe(planId as PlanId)}
                disabled={isActive}
              >
                {isActive ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Current Plan
                  </>
                ) : (
                  "Subscribe Now"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {currentUser.subscription.plan !== "FREE" && currentUser.subscription.status === "ACTIVE" && (
        <div className="pricing-actions">
          <button className="pricing-cancel-btn" onClick={handleCancel}>
            Switch to Free Plan
          </button>
        </div>
      )}

      <div className="pricing-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <span>Test mode: 1-click subscription, no payment required</span>
      </div>
    </div>
  );
}
