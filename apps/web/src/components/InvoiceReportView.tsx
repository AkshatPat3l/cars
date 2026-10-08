import { useState } from "react";
import { formatCAD } from "../vehicles";
import type { Vehicle } from "../vehicles";
import type { UserAccount } from "../users";

interface InvoiceReportViewProps {
  vehicle: Vehicle;
  currentUser: UserAccount;
  onRunReport: () => void;
}

export function InvoiceReportView({ vehicle, currentUser, onRunReport }: InvoiceReportViewProps) {
  const [desiredMargin, setDesiredMargin] = useState(5);

  const isSubscribed = currentUser.subscription.status === "ACTIVE";

  // Calculate dealer profit
  const dealerProfit = vehicle.pricing.msrp - vehicle.pricing.invoicePrice;
  const dealerProfitPercent = (dealerProfit / vehicle.pricing.invoicePrice) * 100;

  // Calculate target offer based on desired margin
  const targetOffer = vehicle.pricing.invoicePrice * (1 + desiredMargin / 100);
  const savingsVsMsrp = vehicle.pricing.msrp - targetOffer;

  // Calculate potential savings from incentives
  const incentives = vehicle.incentives || {
    unadvertisedDealerRebate: 0,
    customerCashRebate: 0,
    financeRate: 0,
    leaseRate: 0,
  };

  const totalRebates = incentives.unadvertisedDealerRebate + incentives.customerCashRebate;

  // For unauthorized users, show a simulated lower amount
  const displayInvoice = isSubscribed
    ? vehicle.pricing.invoicePrice
    : Math.round(vehicle.pricing.invoicePrice * 0.85); // Show ~85% as "unlockable"

  return (
    <div className="invoice-report">
      <div className="invoice-report-header">
        <h2>Dealer Invoice Report</h2>
        {isSubscribed ? (
          <div className="invoice-report-badge unlocked">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Full Access Unlocked
          </div>
        ) : (
          <div className="invoice-report-badge locked">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Subscription Required
          </div>
        )}
      </div>

      {!isSubscribed ? (
        <div className="invoice-report-locked">
          <div className="invoice-locked-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h3>Upgrade to View Full Invoice Data</h3>
          <p>
            Subscribe to unlock complete wholesale pricing, dealer profit margins, and
            our interactive offer calculator.
          </p>
          <div className="invoice-locked-features">
            <div className="invoice-locked-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              MSRP vs Invoice comparison
            </div>
            <div className="invoice-locked-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Dealer profit margin analysis
            </div>
            <div className="invoice-locked-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Unadvertised rebate data
            </div>
            <div className="invoice-locked-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Interactive offer calculator
            </div>
          </div>
          <p className="invoice-locked-cta">
            Click the "Subscribe Now" button on the pricing page to unlock instantly
            — no payment required in test mode.
          </p>
        </div>
      ) : (
        <>
          {/* MSRP vs Invoice Comparison */}
          <div className="invoice-comparison">
            <h3>MSRP vs Dealer Invoice</h3>
            <div className="comparison-table">
              <div className="comparison-row comparison-header">
                <div className="comparison-label">Item</div>
                <div className="comparison-value">Amount (CAD)</div>
                <div className="comparison-diff">vs MSRP</div>
              </div>
              <div className="comparison-row">
                <div className="comparison-label">
                  <span className="comparison-badge msrp">MSRP</span>
                  Manufacturer's Suggested Retail Price
                </div>
                <div className="comparison-value">{formatCAD(vehicle.pricing.msrp)}</div>
                <div className="comparison-diff">—</div>
              </div>
              <div className="comparison-row highlight">
                <div className="comparison-label">
                  <span className="comparison-badge invoice">INVOICE</span>
                  Dealer Wholesale Cost
                </div>
                <div className="comparison-value">{formatCAD(vehicle.pricing.invoicePrice)}</div>
                <div className="comparison-diff comparison-savings">
                  -{formatCAD(vehicle.pricing.msrp - vehicle.pricing.invoicePrice)} ({((dealerProfitPercent)).toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>

          {/* Dealer Profit Margin Gauge */}
          <div className="margin-gauge">
            <h3>Dealer Profit Margin</h3>
            <div className="gauge-container">
              <div className="gauge-value">
                <span className="gauge-number">{dealerProfitPercent.toFixed(1)}%</span>
                <span className="gauge-label">Estimated Margin</span>
              </div>
              <div className="gauge-bar">
                <div
                  className="gauge-fill"
                  style={{
                    width: `${Math.min(dealerProfitPercent, 20)}%`,
                    background: dealerProfitPercent > 8
                      ? "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)"
                      : "linear-gradient(90deg, #eab308 0%, #ca8a04 100%)",
                  }}
                />
              </div>
              <div className="gauge-scale">
                <span>0%</span>
                <span>5%</span>
                <span>10%</span>
                <span>15%</span>
                <span>20%</span>
              </div>
            </div>
            <p className="margin-caption">
              Typical dealer margins range from 3-15% over wholesale cost.
              {dealerProfitPercent > 8
                ? " This vehicle has above-average markup potential."
                : " This vehicle has competitive markup."}
            </p>
          </div>

          {/* Unadvertised Rebates */}
          <div className="rebates-panel">
            <div className="rebates-header">
              <h3>Unadvertised Incentives</h3>
              <span className="rebates-badge">Confidential</span>
            </div>
            <div className="rebates-grid">
              <div className="rebate-item">
                <div className="rebate-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </div>
                <div className="rebate-info">
                  <div className="rebate-label">Factory-to-Dealer Cash</div>
                  <div className="rebate-amount">{formatCAD(incentives.unadvertisedDealerRebate)}</div>
                  <div className="rebate-desc">Unadvertised dealer rebate from manufacturer</div>
                </div>
              </div>
              <div className="rebate-item">
                <div className="rebate-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <div className="rebate-info">
                  <div className="rebate-label">Customer Cash Rebate</div>
                  <div className="rebate-amount">{formatCAD(incentives.customerCashRebate)}</div>
                  <div className="rebate-desc">Direct cash incentive for qualified buyers</div>
                </div>
              </div>
              <div className="rebate-item">
                <div className="rebate-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </div>
                <div className="rebate-info">
                  <div className="rebate-label">Special Financing Rate</div>
                  <div className="rebate-amount">{incentives.financeRate.toFixed(2)}% APR</div>
                  <div className="rebate-desc">Qualifying low-interest financing available</div>
                </div>
              </div>
              <div className="rebate-item">
                <div className="rebate-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <path d="M6 12h4M6 16h2" />
                  </svg>
                </div>
                <div className="rebate-info">
                  <div className="rebate-label">Lease Rate</div>
                  <div className="rebate-amount">{incentives.leaseRate.toFixed(2)}%</div>
                  <div className="rebate-desc">Competitive lease money factor</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Offer Calculator */}
          <div className="offer-calculator">
            <h3>Negotiation Target Calculator</h3>
            <p className="calculator-desc">
              Set your desired dealer profit margin to calculate your target offer price.
            </p>

            <div className="calculator-slider">
              <div className="slider-header">
                <label>Desired Dealer Margin</label>
                <span className="slider-value">{desiredMargin}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={desiredMargin}
                onChange={(e) => setDesiredMargin(Number(e.target.value))}
                className="slider-input"
              />
              <div className="slider-labels">
                <span>Fair Deal (0%)</span>
                <span>Fair (5%)</span>
                <span>Premium (10%)</span>
                <span>High (15%)</span>
              </div>
            </div>

            <div className="calculator-results">
              <div className="result-row">
                <span className="result-label">Your Target Offer</span>
                <span className="result-value target">{formatCAD(targetOffer)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">You Save vs MSRP</span>
                <span className="result-value savings">{formatCAD(savingsVsMsrp)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Dealer Profit at Your Offer</span>
                <span className="result-value">{formatCAD(targetOffer - vehicle.pricing.invoicePrice)}</span>
              </div>
            </div>
          </div>

          {/* Local Dealer Contact Card */}
          <div className="dealer-contact">
            <div className="dealer-contact-header">
              <h3>Recommended Dealer</h3>
              <span className="dealer-guarantee">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Guaranteed Markup Program
              </span>
            </div>
            {vehicle.recommendedDealer && (
              <div className="dealer-card">
                <div className="dealer-name">{vehicle.recommendedDealer.name}</div>
                <div className="dealer-contact-person">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {vehicle.recommendedDealer.contactPerson}
                </div>
                <div className="dealer-address">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {vehicle.recommendedDealer.address}
                </div>
                <div className="dealer-markup">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  {vehicle.recommendedDealer.guaranteedMarkup}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Run Report Button */}
      <div className="report-actions">
        <button className="btn btn-primary btn-large" onClick={onRunReport}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Generate Report
        </button>
      </div>
    </div>
  );
}
