import React from "react";
import { RESORT_LIST } from "../data/resorts";
import { CalculatorInputs } from "../types";
import { HelpCircle, AlertCircle, Sparkles, Receipt, DollarSign, Calendar, Landmark, Trash2, Plus, RotateCcw } from "lucide-react";

interface InputFormProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
  onReset: () => void;
}

export const InputForm: React.FC<InputFormProps> = ({ inputs, onChange, onReset }) => {
  // Local state for Special Assessments conversational questionnaire
  const [saFlowStep, setSaFlowStep] = React.useState<"not_started" | "asking_yes_no" | "adding" | "more_prompt" | "completed">("not_started");

  // Local state for Exit, Sales or Termination Fees conversational questionnaire
  const [exitFlowStep, setExitFlowStep] = React.useState<"not_started" | "asking_yes_no" | "adding" | "more_prompt" | "completed">("not_started");

  const handleResetClick = () => {
    setSaFlowStep("not_started");
    setExitFlowStep("not_started");
    onReset();
  };
  const [tempSaYear, setTempSaYear] = React.useState<number>(1);
  const [tempSaAmount, setTempSaAmount] = React.useState<string>("");
  const [tempExitYear, setTempExitYear] = React.useState<number>(1);
  const [tempExitAmount, setTempExitAmount] = React.useState<string>("");

  const totalYears = inputs.yearsOwnedPast + inputs.yearsProjectedFuture;
  const currentCalendarYear = new Date().getFullYear();
  const startCalendarYear = currentCalendarYear - inputs.yearsOwnedPast + 1;

  // Build simple calendar years of ownership
  const yearOptions = React.useMemo(() => {
    return Array.from({ length: totalYears }, (_, i) => {
      const y = i + 1;
      const calYear = startCalendarYear + y - 1;
      return { year: y, label: `${calYear}` };
    });
  }, [totalYears, startCalendarYear]);

  React.useEffect(() => {
    if (saFlowStep === "not_started") {
      if (inputs.customSpecialAssessments && inputs.customSpecialAssessments.length > 0) {
        setSaFlowStep("completed");
      } else if (inputs.hasSpecialAssessments) {
        setSaFlowStep("adding");
      } else {
        setSaFlowStep("asking_yes_no");
      }
    }
  }, [inputs.hasSpecialAssessments, inputs.customSpecialAssessments, saFlowStep]);

  React.useEffect(() => {
    if (exitFlowStep === "not_started") {
      if (inputs.customExitFees && inputs.customExitFees.length > 0) {
        setExitFlowStep("completed");
      } else if (inputs.hasPaidExitFees) {
        setExitFlowStep("adding");
      } else {
        setExitFlowStep("asking_yes_no");
      }
    }
  }, [inputs.hasPaidExitFees, inputs.customExitFees, exitFlowStep]);

  // Handler functions for itemized Exit, Sales, or Rental Fees
  const handleAddExitFee = () => {
    const amount = Number(tempExitAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      year: tempExitYear,
      amount
    };
    
    onChange({
      ...inputs,
      hasPaidExitFees: true,
      customExitFees: [...(inputs.customExitFees || []), newEntry]
    });
    
    setTempExitAmount("");
    setExitFlowStep("more_prompt");
  };

  const handleNoExitFee = () => {
    onChange({
      ...inputs,
      hasPaidExitFees: false,
      customExitFees: []
    });
    setExitFlowStep("completed");
  };

  const handleDeleteExitFee = (id: string) => {
    const updated = (inputs.customExitFees || []).filter(item => item.id !== id);
    onChange({
      ...inputs,
      customExitFees: updated,
      hasPaidExitFees: updated.length > 0
    });
  };

  // Handler functions for itemized Emergency Special Assessment Levies
  const handleAddAssessment = () => {
    const amount = Number(tempSaAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      year: tempSaYear,
      amount
    };
    
    onChange({
      ...inputs,
      hasSpecialAssessments: true,
      customSpecialAssessments: [...(inputs.customSpecialAssessments || []), newEntry]
    });
    
    setTempSaAmount("");
    setSaFlowStep("more_prompt");
  };

  const handleNoAssessment = () => {
    onChange({
      ...inputs,
      hasSpecialAssessments: false,
      customSpecialAssessments: []
    });
    setSaFlowStep("completed");
  };

  const handleDeleteAssessment = (id: string) => {
    const updated = (inputs.customSpecialAssessments || []).filter(item => item.id !== id);
    onChange({
      ...inputs,
      customSpecialAssessments: updated,
      hasSpecialAssessments: updated.length > 0
    });
  };

  const handleSelectResort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rId = e.target.value;
    const resort = RESORT_LIST.find((r) => r.id === rId);
    if (resort) {
      onChange({
        ...inputs,
        resortId: rId,
        customAnnualIncrease: resort.avgIncrease,
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let typedValue: string | number | boolean = value;

    if (type === "number" || type === "range") {
      typedValue = value === "" ? 0 : Number(value);
    } else if (type === "checkbox") {
      typedValue = (e.target as HTMLInputElement).checked;
    }

    onChange({
      ...inputs,
      [name]: typedValue,
    });
  };

  const selectedResort = RESORT_LIST.find((r) => r.id === inputs.resortId) || RESORT_LIST[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
      {/* Head section */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Timeshare Cost Profile
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Fill in your purchase details and contract terms. The simulator computes your total lifetime costs.
          </p>
        </div>
        <button
          onClick={handleResetClick}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 self-start sm:self-center text-xs font-bold text-indigo-650 hover:text-indigo-850 bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-150/80 rounded-lg transition-all shadow-sm cursor-pointer shrink-0"
          title="Reset all fields to initial audit defaults"
        >
          <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
          Reset to Defaults
        </button>
      </div>

      {/* Developer Dropdown */}
      <div className="space-y-2">
        <label htmlFor="resortId" className="block text-xs font-bold text-slate-550 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Landmark className="w-4 h-4 text-slate-400" />
            Timeshare Developer Brand
          </span>
          <span className="text-[10px] font-semibold text-slate-400">SEC-Reporting Data</span>
        </label>
        <select
          id="resortId"
          name="resortId"
          value={inputs.resortId}
          onChange={handleSelectResort}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer font-medium"
        >
          {RESORT_LIST.map((resort) => (
            <option key={resort.id} value={resort.id}>
              {resort.name}
            </option>
          ))}
        </select>
        
        {/* Info Banner for chosen Developer */}
        <div className="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100/40 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-600">
            <span className="font-bold text-indigo-900">
              Avg. Increase: {selectedResort.minIncrease}%–{selectedResort.maxIncrease}% annually.{" "}
            </span>
            {selectedResort.description}
          </div>
        </div>
      </div>

      {/* Annual Increase Overrides (Custom Rate Sliders) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-slate-400" />
            Annual Maintenance Increase Rate
          </span>
          <span className="text-base font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            {inputs.customAnnualIncrease.toFixed(1)}%
          </span>
        </div>
        <input
          type="range"
          name="customAnnualIncrease"
          min="0"
          max="20"
          step="0.1"
          value={inputs.customAnnualIncrease}
          onChange={handleInputChange}
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-[11px] font-medium text-slate-400">
          <span>0% (No Inflation)</span>
          <span>10% (Florida Coastal Spike)</span>
          <span>20% (Crippling Increase)</span>
        </div>
      </div>

      {/* Core Timeshare Costs Section */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Purchase & Financing Structure
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="purchasePrice" className="block text-xs font-semibold text-slate-600">
              Contract Purchase Price ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
              <input
                id="purchasePrice"
                type="number"
                name="purchasePrice"
                value={inputs.purchasePrice}
                onChange={handleInputChange}
                min="0"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="initialMaintenanceFee" className="block text-xs font-semibold text-slate-600">
              Starting Annual Maintenance Fee ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
              <input
                id="initialMaintenanceFee"
                type="number"
                name="initialMaintenanceFee"
                value={inputs.initialMaintenanceFee}
                onChange={handleInputChange}
                min="0"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Financing Section Toggle */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-slate-700">Finance Contract Mortgage</span>
              <span className="text-[11px] text-slate-400">Check if you borrowed/financed instead of cash</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isFinanced"
                checked={inputs.isFinanced}
                onChange={(e) => {
                  onChange({
                    ...inputs,
                    isFinanced: e.target.checked,
                  });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {inputs.isFinanced && (
            <div className="pt-3 border-t border-slate-200/50 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700">Mortgage Status</span>
                  <span className="text-[10px] text-slate-400">Is the loan fully paid off now?</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ ...inputs, isMortgagePaidOff: true })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      inputs.isMortgagePaidOff
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-250"
                        : "bg-slate-150 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Paid Off
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...inputs, isMortgagePaidOff: false })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !inputs.isMortgagePaidOff
                        ? "bg-amber-50 text-amber-900 border border-amber-250"
                        : "bg-slate-150 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Financed (Ongoing)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label htmlFor="downPayment" className="block text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    Down Payment ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      id="downPayment"
                      type="number"
                      name="downPayment"
                      value={inputs.downPayment}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-6 pr-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="monthlyPayment" className="block text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    Monthly Payment ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      id="monthlyPayment"
                      type="number"
                      name="monthlyPayment"
                      value={inputs.monthlyPayment}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-6 pr-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="loanTermYears" className="block text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    Loan Term (Years)
                  </label>
                  <input
                    id="loanTermYears"
                    type="number"
                    name="loanTermYears"
                    value={inputs.loanTermYears}
                    onChange={handleInputChange}
                    min="1"
                    max="30"
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Horizon Slider Panel */}
      <div className="space-y-5 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Simulation Timeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Past Years Owned */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-650">
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                Years Owned (Past)
              </span>
              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                {inputs.yearsOwnedPast} yrs
              </span>
            </div>
            <input
              type="range"
              name="yearsOwnedPast"
              min="0"
              max="50"
              step="1"
              value={inputs.yearsOwnedPast}
              onChange={handleInputChange}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>0 (Just custom purchased)</span>
              <span>50 years</span>
            </div>
          </div>

          {/* Future Years to Project */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-650">
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                Years to Project (Future)
              </span>
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                +{inputs.yearsProjectedFuture} yrs
              </span>
            </div>
            <input
              type="range"
              name="yearsProjectedFuture"
              min="1"
              max="30"
              step="1"
              value={inputs.yearsProjectedFuture}
              onChange={handleInputChange}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>1 year</span>
              <span>30 years (Generational)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Costs section (Assessments & Membership Dues) */}
      <div className="space-y-6 pt-6 border-t border-slate-100">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-cyan-500" />
            Hidden Fees & Strategic Auditor
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            Audit your contract for sneaky exchange company charges and random coastal/resort special assessments.
          </p>
        </div>        {/* --- DYNAMIC SECTION 1: EXCHANGE DUES --- */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
              Exchange Company Membership Dues
            </h4>
            <span className="text-[10px] bg-slate-200 py-0.5 px-2 rounded-md font-mono text-slate-500 font-bold">
              RCI / Interval Dues
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium font-semibold">Do you have exchange company dues (RCI/II)?</span>
              <button
                type="button"
                onClick={() => {
                  onChange({
                    ...inputs,
                    hasExchangeDues: !inputs.hasExchangeDues,
                    exchangeProvider: !inputs.hasExchangeDues ? 'rci' : null,
                    exchangeAnnualAmount: !inputs.hasExchangeDues ? 100 : 0
                  });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  inputs.hasExchangeDues
                    ? "bg-cyan-600 text-white border-cyan-600 hover:bg-cyan-700"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {inputs.hasExchangeDues ? "Enabled (Yes)" : "Disabled (No)"}
              </button>
            </div>

            {inputs.hasExchangeDues && (
              <div className="space-y-4 border-t border-slate-250/20 pt-3.5">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">
                    Select Member Network
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onChange({
                          ...inputs,
                          exchangeProvider: 'rci',
                          exchangeAnnualAmount: 100
                        });
                      }}
                      className={`py-2 px-3 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        inputs.exchangeProvider === 'rci'
                          ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                          : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      RCI
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChange({
                          ...inputs,
                          exchangeProvider: 'ii',
                          exchangeAnnualAmount: 100
                        });
                      }}
                      className={`py-2 px-3 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        inputs.exchangeProvider === 'ii'
                          ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                          : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Interval Int (II)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChange({
                          ...inputs,
                          exchangeProvider: 'custom'
                        });
                      }}
                      className={`py-2 px-3 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        inputs.exchangeProvider === 'custom'
                          ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                          : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Custom/Other
                    </button>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-650 space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <span>Industry Averages:</span>
                    <span className="font-semibold text-slate-700">RCI Average: $100 | II Average: $100</span>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="exchangeAnnualAmount" className="block text-[10px] font-bold text-slate-500 uppercase">
                      Annual Dues Amount ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                      <input
                        id="exchangeAnnualAmount"
                        type="number"
                        value={inputs.exchangeAnnualAmount}
                        onChange={(e) => {
                          onChange({
                            ...inputs,
                            exchangeAnnualAmount: Number(e.target.value) || 0
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-6 pr-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-cyan-500/10 text-cyan-850 p-2.5 rounded-lg border border-cyan-200/40">
                  <AlertCircle className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed">
                    This adds an annual <span className="font-extrabold text-cyan-900">${inputs.exchangeAnnualAmount}</span> directly to <span className="font-bold text-cyan-950">each year they have owned</span> and project to own ({totalYears} years total), for a cumulative total of <span className="font-bold text-cyan-950">${inputs.exchangeAnnualAmount * totalYears}</span>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- DYNAMIC SECTION 2: SPECIAL ASSESSMENTS --- */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              Emergency Special Assessments & Levies
            </h4>
            <span className="text-[10px] bg-rose-50 py-0.5 px-2 rounded-md font-mono text-rose-600 font-bold border border-rose-100/40">
              One-Off Surcharges
            </span>
          </div>

          {saFlowStep === "asking_yes_no" && (
            <div className="space-y-3 py-1">
              <p className="text-xs text-slate-600 font-medium">
                Has the resort/developer ever charged you any surprise special assessments?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange({ ...inputs, hasSpecialAssessments: true });
                    setSaFlowStep("adding");
                  }}
                  className="flex-1 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all text-center cursor-pointer"
                >
                  Yes, I had assessments
                </button>
                <button
                  type="button"
                  onClick={handleNoAssessment}
                  className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-250 border border-transparent rounded-lg text-xs font-bold text-slate-650 transition-all text-center cursor-pointer"
                >
                  No, never
                </button>
              </div>
            </div>
          )}

          {saFlowStep === "adding" && (
            <div className="space-y-3 border-t border-slate-200/40 pt-3">
              <p className="text-xs font-bold text-slate-700">Add Special Assessment Year & Cost:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="tempSaYear" className="block text-[10px] font-bold text-slate-500 uppercase">Year of Ownership</label>
                  <select
                    id="tempSaYear"
                    value={tempSaYear}
                    onChange={(e) => setTempSaYear(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {yearOptions.map(opt => (
                      <option key={`sa-opt-${opt.year}`} value={opt.year}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="tempSaAmount" className="block text-[10px] font-bold text-slate-500 uppercase">Assessment Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      id="tempSaAmount"
                      type="number"
                      placeholder="e.g. 1800"
                      value={tempSaAmount}
                      onChange={(e) => setTempSaAmount(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-6 pr-2 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddAssessment}
                  disabled={!tempSaAmount || Number(tempSaAmount) <= 0}
                  className="flex-grow py-2 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save & Log Surcharge
                </button>
                <button
                  type="button"
                  onClick={() => setSaFlowStep((inputs.customSpecialAssessments || []).length > 0 ? "completed" : "asking_yes_no")}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {saFlowStep === "more_prompt" && (
            <div className="space-y-3 border-t border-slate-200/40 pt-3">
              <div className="bg-emerald-50 text-emerald-800 text-xs p-2.5 rounded-lg font-medium flex items-center gap-2 border border-emerald-200/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Assessment registered! Compiled in compounding totals.
              </div>

              {/* Show itemized logs */}
              {(inputs.customSpecialAssessments || []).length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200/80 divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {(inputs.customSpecialAssessments || []).map((item) => {
                    const matchedOption = yearOptions.find(o => o.year === item.year);
                    return (
                      <div key={item.id} className="p-2 flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">
                          {matchedOption ? matchedOption.label : `Year ${item.year}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">${item.amount}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAssessment(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all cursor-pointer"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-slate-700 font-bold pt-1">
                Did you have any more special assessments to record?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSaFlowStep("adding")}
                  className="flex-1 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Yes, add another entry
                </button>
                <button
                  type="button"
                  onClick={() => setSaFlowStep("completed")}
                  className="flex-1 py-1.5 px-3 bg-slate-200 hover:bg-slate-250 border border-transparent text-slate-655 rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                >
                  No, that's all
                </button>
              </div>
            </div>
          )}

          {saFlowStep === "completed" && (
            <div className="space-y-3">
              {inputs.hasSpecialAssessments && (inputs.customSpecialAssessments || []).length > 0 ? (
                <div className="space-y-2">
                  <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-42 overflow-y-auto">
                    {(inputs.customSpecialAssessments || []).map((item) => {
                      const matchedOption = yearOptions.find(o => o.year === item.year);
                      return (
                        <div key={item.id} className="p-2 flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-600">
                            {matchedOption ? matchedOption.label : `Year ${item.year}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-600">${item.amount}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAssessment(item.id)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-all cursor-pointer"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Recorded: {(inputs.customSpecialAssessments || []).length} stated years
                    </span>
                    <button
                      type="button"
                      onClick={() => setSaFlowStep("adding")}
                      className="text-xs text-rose-705 hover:text-rose-800 font-bold flex items-center gap-1 bg-rose-50 hover:bg-rose-100/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-rose-200/40"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Assessment Year
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center py-1">
                  <p className="text-xs text-slate-500 font-medium italic">
                    Skipped / No special assessments logged.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ ...inputs, hasSpecialAssessments: true });
                      setSaFlowStep("adding");
                    }}
                    className="text-xs text-rose-650 hover:text-rose-705 font-bold py-1 px-2.5 bg-rose-50 hover:bg-rose-100/80 rounded-md transition-all cursor-pointer border border-rose-200/40"
                  >
                    Specify assessments
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- DYNAMIC SECTION 3: PAID TO RENT, SELL, OR TERMINATE --- */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              Exit, Sales, or Rental Transfer Fees
            </h4>
            <span className="text-[10px] bg-amber-50 py-0.5 px-2 rounded-md font-mono text-amber-600 font-bold border border-amber-100/40">
              Paid Services & Filings
            </span>
          </div>

          {exitFlowStep === "asking_yes_no" && (
            <div className="space-y-3 py-1">
              <p className="text-xs text-slate-600 font-medium">
                Have you ever paid anyone to rent, sell, or terminate your timeshare?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange({ ...inputs, hasPaidExitFees: true });
                    setExitFlowStep("adding");
                  }}
                  className="flex-1 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all text-center cursor-pointer"
                >
                  Yes, I paid fees
                </button>
                <button
                  type="button"
                  onClick={handleNoExitFee}
                  className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-250 border border-transparent rounded-lg text-xs font-bold text-slate-655 transition-all text-center cursor-pointer"
                >
                  No, never
                </button>
              </div>
            </div>
          )}

          {exitFlowStep === "adding" && (
            <div className="space-y-3 border-t border-slate-200/40 pt-3">
              <p className="text-xs font-bold text-slate-700">Add Paid service/filing Year & Amount:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="tempExitYear" className="block text-[10px] font-bold text-slate-500 uppercase">Year of Ownership</label>
                  <select
                    id="tempExitYear"
                    value={tempExitYear}
                    onChange={(e) => setTempExitYear(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {yearOptions.map(opt => (
                      <option key={`exit-opt-${opt.year}`} value={opt.year}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="tempExitAmount" className="block text-[10px] font-bold text-slate-500 uppercase">Paid Fee Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      id="tempExitAmount"
                      type="number"
                      placeholder="e.g. 2500"
                      value={tempExitAmount}
                      onChange={(e) => setTempExitAmount(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-6 pr-2 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddExitFee}
                  disabled={!tempExitAmount || Number(tempExitAmount) <= 0}
                  className="flex-grow py-2 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save & Log Costs
                </button>
                <button
                  type="button"
                  onClick={() => setExitFlowStep((inputs.customExitFees || []).length > 0 ? "completed" : "asking_yes_no")}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {exitFlowStep === "more_prompt" && (
            <div className="space-y-3 border-t border-slate-200/40 pt-3">
              <div className="bg-emerald-50 text-emerald-800 text-xs p-2.5 rounded-lg font-medium flex items-center gap-2 border border-emerald-200/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Paid service cost registered in compiling totals.
              </div>

              {/* Show itemized logs */}
              {(inputs.customExitFees || []).length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200/80 divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {(inputs.customExitFees || []).map((item) => {
                    const matchedOption = yearOptions.find(o => o.year === item.year);
                    return (
                      <div key={item.id} className="p-2 flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">
                          {matchedOption ? matchedOption.label : `Year ${item.year}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">${item.amount}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteExitFee(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all cursor-pointer"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-slate-700 font-bold pt-1">
                Did you pay any other rental, resale, or termination fees to register?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExitFlowStep("adding")}
                  className="flex-1 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-805 rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Yes, add another entry
                </button>
                <button
                  type="button"
                  onClick={() => setExitFlowStep("completed")}
                  className="flex-1 py-1.5 px-3 bg-slate-200 hover:bg-slate-250 border border-transparent text-slate-655 rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                >
                  No, that's all
                </button>
              </div>
            </div>
          )}

          {exitFlowStep === "completed" && (
            <div className="space-y-3">
              {inputs.hasPaidExitFees && (inputs.customExitFees || []).length > 0 ? (
                <div className="space-y-2">
                  <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-42 overflow-y-auto">
                    {(inputs.customExitFees || []).map((item) => {
                      const matchedOption = yearOptions.find(o => o.year === item.year);
                      return (
                        <div key={item.id} className="p-2 flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-600">
                            {matchedOption ? matchedOption.label : `Year ${item.year}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-600">${item.amount}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteExitFee(item.id)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-all cursor-pointer"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Recorded: {(inputs.customExitFees || []).length} items
                    </span>
                    <button
                      type="button"
                      onClick={() => setExitFlowStep("adding")}
                      className="text-xs text-amber-705 hover:text-amber-800 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-amber-200/40"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Exit/Sales Fee
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center py-1">
                  <p className="text-xs text-slate-500 font-medium italic">
                    No resale, rent support, or termination exit fees registered.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ ...inputs, hasPaidExitFees: true });
                      setExitFlowStep("adding");
                    }}
                    className="text-xs text-amber-650 hover:text-amber-705 font-bold py-1 px-2.5 bg-amber-50 hover:bg-amber-100/80 rounded-md transition-all cursor-pointer border border-amber-200/40"
                  >
                    Specify paid fees
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
