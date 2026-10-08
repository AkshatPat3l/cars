import { useState, useEffect } from "react";
import {
  MAKES,
  getModelsByMake,
  getYearsByMakeModel,
  getTrimsByMakeModelYear,
  formatCAD,
} from "../vehicles";
import type { Vehicle } from "../vehicles";

interface VehicleConfiguratorProps {
  onVehicleSelect: (vehicle: Vehicle) => void;
  disabled?: boolean;
}

export function VehicleConfigurator({ onVehicleSelect, disabled = false }: VehicleConfiguratorProps) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Reset model/year when make changes
  useEffect(() => {
    if (make) {
      const models = getModelsByMake(make);
      setModel(models[0] || "");
      setYear(null);
      setSelectedVehicle(null);
    } else {
      setModel("");
      setYear(null);
      setSelectedVehicle(null);
    }
  }, [make]);

  // Reset year when model changes
  useEffect(() => {
    if (model && make) {
      const years = getYearsByMakeModel(make, model);
      setYear(years[0] || null);
      setSelectedVehicle(null);
    } else {
      setYear(null);
      setSelectedVehicle(null);
    }
  }, [model, make]);

  // Auto-select vehicle when year is chosen
  useEffect(() => {
    if (year && model && make) {
      const matchedTrims = getTrimsByMakeModelYear(make, model, year);
      const firstVehicle = matchedTrims[0];
      if (matchedTrims.length === 1 && firstVehicle) {
        setSelectedVehicle(firstVehicle);
        onVehicleSelect(firstVehicle);
      } else if (matchedTrims.length > 1 && firstVehicle) {
        // Select first trim if multiple available
        setSelectedVehicle(firstVehicle);
        onVehicleSelect(firstVehicle);
      }
    } else {
      setSelectedVehicle(null);
    }
  }, [year, model, make, onVehicleSelect]);

  const trims: Vehicle[] = year && model && make
    ? getTrimsByMakeModelYear(make, model, year)
    : [];

  return (
    <div className="configurator">
      <div className="configurator-header">
        <h2>Build & Price Your Vehicle</h2>
        <p>Select your preferences to see pricing details</p>
      </div>

      <div className="configurator-grid">
        <div className="configurator-field">
          <label htmlFor="make">Make</label>
          <select
            id="make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            disabled={disabled}
          >
            <option value="">Select Make</option>
            {MAKES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="configurator-field">
          <label htmlFor="model">Model</label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!make || disabled}
          >
            <option value="">Select Model</option>
            {model && make
              ? getModelsByMake(make).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))
              : []}
          </select>
        </div>

        <div className="configurator-field">
          <label htmlFor="year">Year</label>
          <select
            id="year"
            value={year || ""}
            onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
            disabled={!model || !make || disabled}
          >
            <option value="">Select Year</option>
            {year && model && make
              ? getYearsByMakeModel(make, model).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))
              : []}
          </select>
        </div>

        <div className="configurator-field">
          <label htmlFor="trim">Trim</label>
          <select
            id="trim"
            value={selectedVehicle?.trim || ""}
            onChange={(e) => {
              const selectedVehicleFromList = trims.find((t) => t.trim === e.target.value);
              if (selectedVehicleFromList) {
                setSelectedVehicle(selectedVehicleFromList as Vehicle);
                onVehicleSelect(selectedVehicleFromList);
              }
            }}
            disabled={trims.length === 0 || disabled}
          >
            <option value="">Select Trim</option>
            {trims.map((v) => (
              <option key={v.id} value={v.trim}>
                {v.trim} — {formatCAD(v.pricing.msrp)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedVehicle && (
        <div className="configurator-summary">
          <div className="configurator-vehicle-info">
            <span className="configurator-badge">{selectedVehicle.fuelType}</span>
            <span className="configurator-badge">{selectedVehicle.drivetrain}</span>
          </div>
          <div className="configurator-prices">
            <div className="configurator-price-row">
              <span className="configurator-price-label">Estimated MSRP</span>
              <span className="configurator-price-value">{formatCAD(selectedVehicle.pricing.msrp)}</span>
            </div>
            <div className="configurator-price-row">
              <span className="configurator-price-label">Dealer Invoice</span>
              <span className="configurator-price-value configurator-price-highlight">
                {formatCAD(selectedVehicle.pricing.invoicePrice)}
              </span>
            </div>
            <div className="configurator-price-row configurator-savings">
              <span className="configurator-price-label">Potential Savings</span>
              <span className="configurator-price-value configurator-savings-value">
                {formatCAD(selectedVehicle.pricing.msrp - selectedVehicle.pricing.invoicePrice)}
              </span>
            </div>
          </div>
        </div>
      )}

      {!selectedVehicle && make && model && year && (
        <div className="configurator-empty">
          Select a trim to see detailed pricing
        </div>
      )}

      {!make && (
        <div className="configurator-empty">
          Start by selecting a vehicle make
        </div>
      )}
    </div>
  );
}
