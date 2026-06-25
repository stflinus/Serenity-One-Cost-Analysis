import { useState, useMemo } from "react";
import { CalculatorInputs, TimeshareContract } from "./types";
import { calculateTimeshareCosts, combineCalculationResults, getCombinedInputs } from "./utils/calculator";
import { SerenityLogo } from "./components/SerenityLogo";
import { InputForm } from "./components/InputForm";
import { StatsGrid } from "./components/StatsGrid";
import { CashFlowTable } from "./components/CashFlowTable";
import { Landmark, Info, PhoneCall, ExternalLink, Printer, Plus, Trash2 } from "lucide-react";
import { generatePdfSummary } from "./utils/pdfGenerator";
import { RESORT_LIST } from "./data/resorts";

const INITIAL_INPUTS: CalculatorInputs = {
  resortId: "mvc", // Marriott Vacation Club
  customAnnualIncrease: 6.0,
  purchasePrice: 22000,
  contractCount: 1,
  
  // Financing Defaults
  isFinanced: false,
  isMortgagePaidOff: true,
  downPayment: 4000,
  monthlyPayment: 350,
  loanTermYears: 10,
  
  // Yearly Operation Defaults
  initialMaintenanceFee: 1250,
  specialAssessmentsCount: 2,
  specialAssessmentAmount: 1800,
  annualMembershipDues: 180,
  
  // Advanced Interactive Dynamic Costs
  hasExchangeDues: false,
  exchangeProvider: null,
  exchangeAnnualAmount: 100,
  customExchangeDues: [],
  hasSpecialAssessments: false,
  customSpecialAssessments: [],
  hasPaidExitFees: false,
  customExitFees: [],
  
  // Horizon Defaults
  yearsOwnedPast: 5,
  yearsProjectedFuture: 15,
  
  // Comparative Parameters
  alternativeVacationCost: 1800,
  investmentReturnRate: 8.0,
};

export default function App() {
  // Multi-resort portfolio state
  const [contracts, setContracts] = useState<TimeshareContract[]>(() => [
    { id: "c1", label: "Timeshare Contract #1", inputs: INITIAL_INPUTS },
  ]);
  const [activeContractId, setActiveContractId] = useState<string>("c1");
  const [viewMode, setViewMode] = useState<"combined" | "single">("combined");

  // Handler to add a new contract safely
  const handleAddContract = () => {
    const currentResorts = contracts.map(c => c.inputs.resortId);
    const availableResort = RESORT_LIST.find(r => !currentResorts.includes(r.id)) || RESORT_LIST[0];
    
    const newId = `c_${Date.now()}`;
    const newInputs: CalculatorInputs = {
      ...INITIAL_INPUTS,
      resortId: availableResort.id,
      purchasePrice: 18000,
      customAnnualIncrease: availableResort.avgIncrease,
      initialMaintenanceFee: 1100,
      contractCount: 1,
      yearsOwnedPast: 3,
      yearsProjectedFuture: 12,
    };
    
    const newContract: TimeshareContract = {
      id: newId,
      label: `New Contract (${availableResort.name})`,
      inputs: newInputs,
    };
    
    setContracts(prev => [...prev, newContract]);
    setActiveContractId(newId);
    setViewMode("single"); // Switch to focus view so they can immediately modify its parameters
  };

  // Handler to delete a contract safely
  const handleDeleteContract = (idToDelete: string) => {
    if (contracts.length <= 1) return;
    setContracts(prev => {
      const filtered = prev.filter(c => c.id !== idToDelete);
      if (activeContractId === idToDelete) {
        setActiveContractId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Handler to modify inputs of the active contract
  const handleInputsChange = (newInputs: CalculatorInputs) => {
    setContracts(prev =>
      prev.map(c => (c.id === activeContractId ? { ...c, inputs: newInputs } : c))
    );
  };

  const handleContractLabelChange = (contractId: string, newLabel: string) => {
    setContracts(prev =>
      prev.map(c => (c.id === contractId ? { ...c, label: newLabel } : c))
    );
  };

  const handleResetActiveContract = () => {
    setContracts(prev =>
      prev.map(c =>
        c.id === activeContractId
          ? {
              ...c,
              inputs: {
                resortId: "mvc",
                customAnnualIncrease: 6.0,
                purchasePrice: "",
                isFinanced: false,
                isMortgagePaidOff: false,
                downPayment: "",
                monthlyPayment: "",
                loanTermYears: "",
                initialMaintenanceFee: "",
                specialAssessmentsCount: "",
                specialAssessmentAmount: "",
                annualMembershipDues: "",
                hasExchangeDues: false,
                exchangeProvider: null,
                exchangeAnnualAmount: "",
                customExchangeDues: [],
                hasSpecialAssessments: false,
                customSpecialAssessments: [],
                hasPaidExitFees: false,
                customExitFees: [],
                yearsOwnedPast: "",
                yearsProjectedFuture: "",
                alternativeVacationCost: "",
                investmentReturnRate: "",
                contractCount: "",
              },
            }
          : c
      )
    );
  };

  // Find the current active contract
  const activeContract = useMemo(() => {
    return contracts.find(c => c.id === activeContractId) || contracts[0];
  }, [contracts, activeContractId]);

  // Compute individual results
  const resultsArray = useMemo(() => {
    return contracts.map(c => calculateTimeshareCosts(c.inputs));
  }, [contracts]);

  // Compute combined elements
  const combinedResults = useMemo(() => {
    return combineCalculationResults(resultsArray, contracts);
  }, [resultsArray, contracts]);

  const combinedInputs = useMemo(() => {
    return getCombinedInputs(contracts);
  }, [contracts]);

  // Read current active viewing items based on selected scope
  const results = useMemo(() => {
    return viewMode === "combined" ? combinedResults : calculateTimeshareCosts(activeContract.inputs);
  }, [viewMode, combinedResults, activeContract.inputs]);

  const inputs = useMemo(() => {
    return viewMode === "combined" ? combinedInputs : activeContract.inputs;
  }, [viewMode, combinedInputs, activeContract.inputs]);

  // Resolve developer / resort name for print layout
  const resortName = useMemo(() => {
    if (viewMode === "combined") {
      return "Consolidated Portfolio (All Resorts)";
    }
    const resort = RESORT_LIST.find((r) => r.id === inputs.resortId);
    return resort ? resort.name : inputs.resortId;
  }, [inputs.resortId, viewMode]);

  // Compute pricing values for print layout
  const cCount = useMemo(() => {
    return inputs.contractCount === "" || inputs.contractCount === null ? 0 : Number(inputs.contractCount);
  }, [inputs.contractCount]);

  const exitOnlyCost = useMemo(() => {
    if (cCount === 1) {
      return 4567.32;
    } else if (cCount === 2) {
      return 7245.50;
    } else if (cCount >= 3) {
      return 9438.15 + (cCount > 3 ? (cCount - 3) * 2500 : 0);
    }
    return 0;
  }, [cCount]);

  const refundCost = useMemo(() => {
    return results.pastTotalSpent > 0 ? Math.max(4000, results.pastTotalSpent * 0.70 * 0.12) : 0;
  }, [results.pastTotalSpent]);

  const combinedCost = useMemo(() => {
    if (refundCost > 0 && exitOnlyCost > 0) {
      let val = (refundCost + exitOnlyCost) * 0.725;
      const maxIndivid = Math.max(refundCost, exitOnlyCost);
      const sumC = refundCost + exitOnlyCost;
      if (val <= maxIndivid) {
        val = maxIndivid + (sumC - maxIndivid) * 0.3;
      }
      return val;
    } else if (refundCost > 0) {
      return refundCost;
    } else if (exitOnlyCost > 0) {
      return exitOnlyCost;
    }
    return 0;
  }, [refundCost, exitOnlyCost]);

  const formatCurrencyLocal = (val: number, showDecimals = false) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Premium Dark Corporate Top bar */}
      <header className="bg-[#1e293b] border-b border-slate-800 shadow-md sticky top-0 z-50 print:hidden">
        <div className="max-w-none px-4 sm:px-8 lg:px-12 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <SerenityLogo iconSize={40} />
          
          {/* Sub-header info badges to convey trustworthy expertise */}
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg">
              <Landmark className="w-3.5 h-3.5 text-indigo-400" />
              Strategic Contract Valuations
            </span>
            <a
              href="tel:+18005550199"
              className="flex items-center gap-1.5 text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-1.5 rounded-xl font-bold transition-all border border-indigo-500/30"
            >
              <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
              1-800-SERENITY
            </a>
            <button
              id="view-summary-pdf"
              onClick={() => generatePdfSummary(inputs, results)}
              className="flex items-center gap-1.5 text-slate-900 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 px-4 py-1.5 rounded-xl font-bold transition-all border border-amber-500/30 shadow-sm shadow-amber-500/10 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-900" />
              View Summary
            </button>
            <button
              id="print-summary-button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-1.5 rounded-xl font-bold transition-all border border-indigo-500/30 shadow-sm shadow-indigo-500/10 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              Print Report
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-grow max-w-none w-full px-4 sm:px-8 lg:px-12 py-8 space-y-8 print:hidden">
        
        {/* Dynamic Warning Alert on Coastal Hurricane Spikes */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border-l-4 border-indigo-500 p-4 rounded-r-xl flex items-start gap-3.5 print:hidden">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">
              Coastal Surcharge Warning (Florida & Islands)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
              Due to catastrophic insurance hikes and hurricanes in 2024–2025, properties under HGV, PVC, and Bluegreen in coastal regions experienced unprecedented <span className="font-semibold text-slate-800">10% to 17% maintenance spikes</span>. Ensure your annual increase slider reflects historical regional rates for extreme precision.
            </p>
          </div>
        </div>

        {/* Portfolio Control Deck Bar */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 flex flex-col xl:flex-row justify-between items-center gap-4 print:hidden">
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="bg-indigo-600/10 p-2.5 rounded-lg text-indigo-600">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Portfolio Forensic Audit Deck</h3>
              <p className="text-xs text-slate-500">Consolidated cross-developer audits & asset analysis</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
            {/* Combined View Button */}
            <button
              onClick={() => setViewMode("combined")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                viewMode === "combined"
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm shadow-slate-900/10"
                  : "bg-white border-slate-205 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span>💼 Combined Portfolio ({contracts.length})</span>
            </button>
            
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            
            {/* Individual Contract List */}
            {contracts.map((c, i) => {
              const r = RESORT_LIST.find((res) => res.id === c.inputs.resortId);
              const nameAbbr = r ? r.name.replace(/\(.*?\)/, "").trim() : c.inputs.resortId.toUpperCase();
              const isSelected = viewMode === "single" && activeContractId === c.id;
              
              return (
                <div key={c.id} className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setActiveContractId(c.id);
                      setViewMode("single");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10"
                        : "bg-white border-slate-205 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>🌴 {nameAbbr}</span>
                  </button>
                  {contracts.length > 1 && (
                    <button
                      onClick={() => handleDeleteContract(c.id)}
                      title="Remove from Audit"
                      className="p-1 px-1.5 text-slate-450 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
            
            <button
              onClick={handleAddContract}
              className="flex items-center gap-1 px-3 py-2 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-900 rounded-lg text-xs font-bold transition-all cursor-pointer border border-amber-500/10 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Resort
            </button>
          </div>
        </div>

        {/* Stats Grid Dashboard Bento Banner */}
        <StatsGrid results={results} inputs={inputs} />

        {/* Two Column Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Inputs (Span 5 of 12) */}
          <section className="lg:col-span-5 w-full print:hidden">
            {viewMode === "combined" && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 mb-4 text-xs text-slate-705 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-800">Combined Portfolio Mode:</span> Custom mortgage rates, dues, and assessment histories must be configured on an individual contract basis. Below, customize parameters for <strong className="text-slate-900">{RESORT_LIST.find(r => r.id === activeContract.inputs.resortId)?.name || activeContract.inputs.resortId}</strong>. Switch tabs in the Control Deck bar above to choose a different contract to modify.
                </div>
              </div>
            )}
            <InputForm
              key={activeContract.id}
              inputs={activeContract.inputs}
              onChange={handleInputsChange}
              onReset={handleResetActiveContract}
              contractLabel={activeContract.label}
              onLabelChange={(newLabel) => handleContractLabelChange(activeContract.id, newLabel)}
              onAddAnotherContract={handleAddContract}
              onCompletePortfolio={() => setViewMode("combined")}
              contractIndex={contracts.indexOf(activeContract) + 1}
              totalContracts={contracts.length}
            />
          </section>

          {/* Right Column: Ledger (Span 7 of 12) */}
          <section className="lg:col-span-7 w-full space-y-8 print:w-full print:col-span-12">
            {/* Detail Cashflow Ledger (Expandable) */}
            <CashFlowTable results={results} />
          </section>

        </div>
      </main>

      {/* Corporate Footing and Professional Disclaimers */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-850 py-10 print:hidden">
        <div className="max-w-none px-4 sm:px-8 lg:px-12 text-center space-y-4">
          <div className="flex justify-center">
            <SerenityLogo iconSize={32} subTextColor="text-slate-500" textColor="text-slate-300" />
          </div>
          <p className="text-[11px] leading-relaxed max-w-2xl mx-auto text-slate-500">
            Disclaimer: The results provided by the Serenity 1 Timeshare Cost Simulator are estimates based on user inputs, historical SEC public filings, and industry averages. Cumulative cash calculations do not constitute absolute legal binding advice. Resort-specific special assessment fees may vary. Claims related to contract exiting should be assessed with a qualified legal analyst.
          </p>
          <div className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest pt-4 border-t border-slate-800">
            © {new Date().getFullYear()} Serenity 1 Consulting Group. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* 
        =========================================================
        HIGH FIDELITY PRINT-ONLY PORTFOLIO REPORT (MATCHING PDF)
        =========================================================
      */}
      <div className="hidden print:block w-full max-w-[210mm] mx-auto bg-white p-6 font-sans text-slate-800 space-y-6">
        
        {/* --- PAGE 1: EXECUTIVE AUDIT & PORTFOLIO METRICS --- */}
        <div className="space-y-6 min-h-[270mm] flex flex-col justify-between">
          <div className="space-y-6">
            {/* Corporate Header Banner */}
            <div className="bg-slate-800 text-white p-5 rounded-md flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold tracking-tight">SERENITY 1 CONSULTING GROUP</h1>
                <p className="text-xs text-indigo-200">Timeshare Portfolio Audit & Forensic Outflow Analysis</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase bg-indigo-600 px-2 py-0.5 rounded text-white tracking-widest block mb-1">EXECUTIVE REPORT</span>
                <p className="text-xs font-semibold text-indigo-100">CONFIDENTIAL DIAGNOSTIC</p>
              </div>
            </div>

            <div className="h-[4px] bg-indigo-500 rounded-sm w-full" />

            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
              1. EXECUTIVE AUDIT PORTFOLIO DIAGNOSTIC
            </h2>

            {/* Cards Grid: Parameters vs Cumulative Liability Analysis */}
            <div className="grid grid-cols-2 gap-6">
              
              {/* Portfolio Parameters Card */}
              <div className="bg-[#f8fafc] border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-[#475569] text-white py-1.5 px-4 font-bold text-[11px] uppercase tracking-wide">
                  Portfolio Contract Parameters
                </div>
                <div className="p-4 flex-grow space-y-2.5 text-[11px] leading-relaxed text-slate-600">
                  <div className="grid grid-cols-2">
                    <span className="font-bold text-slate-700">Property Brand:</span>
                    <span className="text-slate-800 font-semibold">{resortName}</span>
                  </div>
                  {viewMode === "combined" && (
                    <div className="border-b border-dashed border-slate-200/60 pb-1.5 mb-1 text-[10px] text-slate-500">
                      <strong>Resort Breakdown:</strong>
                      <ul className="list-disc pl-3.5 space-y-0.5 mt-1 font-medium">
                        {contracts.map((c, i) => {
                          return <li key={c.id}><strong>{c.label}</strong> (Started: {new Date().getFullYear() - (Number(c.inputs.yearsOwnedPast) || 0) + 1}, Initial MF: {c.inputs.initialMaintenanceFee ? `$${c.inputs.initialMaintenanceFee}` : "—"})</li>;
                        })}
                      </ul>
                    </div>
                  )}
                  <div className="grid grid-cols-2">
                    <span className="font-bold text-slate-700">Purchase Price:</span>
                    <span className="text-slate-800">{formatCurrencyLocal(Number(inputs.purchasePrice) || 0)}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-bold text-slate-700">Contract Terms:</span>
                    <span className="text-slate-800">
                      {inputs.isFinanced
                        ? `${inputs.isMortgagePaidOff ? "Fully Paid Off" : `Active (Term: ${inputs.loanTermYears} yrs)`}`
                        : "No (Paid in Cash)"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-bold text-slate-700">Annual Increase:</span>
                    <span className="text-slate-800">{(inputs.customAnnualIncrease || 0).toFixed(1)}% compounding</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-bold text-slate-700">Base Maintenance Fee:</span>
                    <span className="text-slate-800">{formatCurrencyLocal(Number(inputs.initialMaintenanceFee) || 0)} / yr</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-bold text-slate-700">Exchange & Club Dues:</span>
                    <span className="text-slate-800">
                      {inputs.hasExchangeDues
                        ? `${formatCurrencyLocal(Number(inputs.exchangeAnnualAmount) || 0)} / year (${String(inputs.exchangeProvider || "RCI").toUpperCase()})`
                        : "None"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-bold text-slate-700">Assessments Schedule:</span>
                    <span className="text-slate-800">
                      {inputs.hasSpecialAssessments
                        ? "Custom active schedule"
                        : `Avg ${formatCurrencyLocal(Number(inputs.specialAssessmentAmount) || 0)} (${Number(inputs.specialAssessmentsCount) || 0} times)`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="font-bold text-slate-700">Timeline Horizon:</span>
                    <span className="text-slate-800">{results.yearsOwnedPast} yrs past / {results.yearsProjectedFuture} yrs future</span>
                  </div>
                  <div className="grid grid-cols-2 border-t border-slate-200/60 pt-2 mt-2">
                    <span className="font-bold text-slate-800">Total Evaluation Period:</span>
                    <span className="text-slate-800 font-extrabold">{results.totalYears} Years total</span>
                  </div>
                </div>
              </div>

              {/* Financial Liability Diagnostics Card */}
              <div className="bg-[#f8fafc] border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-[#0f172a] text-white py-1.5 px-4 font-bold text-[11px] uppercase tracking-wide">
                  Cumulative Liability Analysis
                </div>
                <div className="p-4 flex-grow space-y-2.5 text-[11px] leading-relaxed text-slate-600">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700">Future Outflow:</span>
                    <span>{formatCurrencyLocal(results.futureTotalSpent)}</span>
                  </div>
                  <div className="border-t border-slate-200" />
                  
                  <div className="flex justify-between text-rose-700 font-bold">
                    <span>LIFETIME CONTRACT TOTAL:</span>
                    <span>{formatCurrencyLocal(results.grandTotalCost)}</span>
                  </div>
                  
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Total Mortgage & Interest:</span>
                    <span>{formatCurrencyLocal(results.grandTotalMortgage)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Total Maintenance & Dues:</span>
                    <span>{formatCurrencyLocal(results.grandTotalMaintenanceFees + results.grandTotalOther)}</span>
                  </div>
                  <div className="border-t border-slate-200" />

                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Estimated Refund (Full accounting):</span>
                    <span>{formatCurrencyLocal(results.pastTotalSpent * 0.70)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Refund-Only Program Fee:</span>
                    <span>{formatCurrencyLocal(refundCost, refundCost % 1 !== 0)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Exit-Only Program Fee:</span>
                    <span>{formatCurrencyLocal(exitOnlyCost, exitOnlyCost % 1 !== 0)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold text-indigo-600">
                    <span>Combined Refund & Exit Fee:</span>
                    <span>{formatCurrencyLocal(combinedCost, combinedCost % 1 !== 0)}</span>
                  </div>

                </div>
              </div>

            </div>

            {/* Section 2: Guaranteed Program Remediation Solutions */}
            <div className="space-y-2 mt-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                2. GUARANTEED PROGRAM REMEDIATION SOLUTIONS
              </h2>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Escrow-backed legal structures and forensic auditing profiles mapped to this contract cases.
              </p>

              {/* 3 Solutions Cards */}
              <div className="grid grid-cols-3 gap-4">
                
                {/* CARD 1: Refund Only */}
                <div className="bg-[#f8fafc] border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-[#475569] text-white py-1 px-3 font-bold text-[9px] uppercase tracking-wide">
                      Refund-Only Path
                    </div>
                    <div className="p-3.5 space-y-2.5">
                      <h4 className="text-base font-black text-slate-800 leading-none">
                        {refundCost > 0 ? formatCurrencyLocal(refundCost, refundCost % 1 !== 0) : "$0"}
                      </h4>
                      <p className="text-[10px] text-slate-400">Recovers up to 70% of sunk cash.</p>
                      <div className="border-t border-slate-100" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-700 uppercase mb-1">Program Scope Covers:</p>
                        <ul className="text-[10px] text-slate-500 space-y-1">
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            CUSIP File Search
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            State Filing Fee
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            CPA & Tax Attorney Registry
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Combined Refund & Exit (MIDDLE!) */}
                <div className="bg-indigo-50/50 border-2 border-indigo-200 rounded-xl overflow-hidden flex flex-col justify-between relative shadow-sm">
                  <div>
                    <div className="bg-[#4f46e5] text-white py-1 px-3 font-bold text-[9px] uppercase tracking-wider text-center">
                      Combined Refund & Exit
                    </div>
                    <div className="p-3.5 space-y-2.5">
                      <h4 className="text-base font-black text-indigo-900 leading-none">
                        {combinedCost > 0 ? formatCurrencyLocal(combinedCost, combinedCost % 1 !== 0) : "$0"}
                      </h4>
                      <p className="text-[10px] text-indigo-600 font-extrabold tracking-wide">Bundle-Saver Program Applied</p>
                      <div className="border-t border-indigo-100" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-850 uppercase mb-1">Program Scope Covers:</p>
                        <ul className="text-[10px] text-indigo-950 space-y-1 font-semibold">
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Refund Search & CPA Audits
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Legal & Filing Preparations
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Escrow Title & Deed Release
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Exit Only */}
                <div className="bg-[#f8fafc] border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-[#475569] text-white py-1 px-3 font-bold text-[9px] uppercase tracking-wide">
                      Exit-Only Path
                    </div>
                    <div className="p-3.5 space-y-2.5">
                      <h4 className="text-base font-black text-slate-800 leading-none">
                        {exitOnlyCost > 0 ? formatCurrencyLocal(exitOnlyCost, exitOnlyCost % 1 !== 0) : "$0"}
                      </h4>
                      <p className="text-[10px] text-slate-400">Complete deed/contract release.</p>
                      <div className="border-t border-slate-100" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-700 uppercase mb-1">Program Scope Covers:</p>
                        <ul className="text-[10px] text-slate-500 space-y-1">
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Contract Legal Fees
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Resort Filing Fees
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Title and Deed Transfer
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-200/80 pt-3">
            <span>SERENITY 1 PORTFOLIO DIAGNOSTIC SPECIALTIES</span>
            <span>Page 1 of 2</span>
          </div>
        </div>

        {/* PAGE BREAK FOR PRINT */}
        <div className="page-break" style={{ pageBreakBefore: 'always', breakBefore: 'page' }} />

        {/* --- PAGE 2: DETAILED CONTRACT LEDGER TABLE --- */}
        <div className="space-y-6 pt-4 min-h-[270mm] flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header Block Page 2 */}
            <div className="bg-slate-800 text-white p-4 rounded-md flex justify-between items-center">
              <h1 className="text-xs font-bold tracking-tight uppercase">SERENITY COMPREHENSIVE LEDGER SHEET - DETAILED OUTFLOWS</h1>
              <span className="text-[9px] text-indigo-300 font-mono font-bold">Reference ID: SER-TS-2026</span>
            </div>

            <div className="h-[4px] bg-indigo-500 rounded-sm w-full" />

            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
              3. DETAILED LEDGER COMPILING
            </h2>

            {/* Sunk Cost & Projected Future Split Box */}
            <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-xl p-4 bg-[#f8fafc]">
              <div className="border-r border-slate-200 pr-4">
                <span className="text-[9px] uppercase tracking-widest font-black text-slate-500 leading-none">ACCRUED PAST OUTFLOWS (SPENT)</span>
                <p className="text-lg font-black text-slate-900 mt-1">{formatCurrencyLocal(results.pastTotalSpent)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Accumulated across last {results.yearsOwnedPast} years of ownership.</p>
              </div>
              <div className="pl-4">
                <span className="text-[9px] uppercase tracking-widest font-black text-indigo-600 leading-none">PROJECTED FUTURE OUTFLOWS RISK</span>
                <p className="text-lg font-black text-indigo-950 mt-1">{formatCurrencyLocal(results.futureTotalSpent)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Projected exposure across selected {results.yearsProjectedFuture} future years.</p>
              </div>
            </div>

            {/* Ledger Table Filtered to Current Year Moving Forward */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-200 collapse">
                <thead>
                  <tr className="bg-[#f1f5f9] text-slate-700 text-[9px] font-bold uppercase border-b border-slate-200">
                    <th className="py-2 px-2.5 border-r border-slate-200">Yr</th>
                    <th className="py-2 px-2.5 border-r border-slate-200">Cal. Yr</th>
                    <th className="py-2 px-3 border-r border-slate-200">Ownership Phase</th>
                    <th className="py-2 px-2.5 text-right border-r border-slate-200">Mortgage Paid</th>
                    <th className="py-2 px-2.5 text-right border-r border-slate-200">Maintenance Fee</th>
                    <th className="py-2 px-2.5 text-right border-r border-slate-200">Assess/Dues</th>
                    <th className="py-2 px-2.5 text-right border-r border-slate-200 font-bold text-slate-900">Annual Outflow</th>
                    <th className="py-2 px-2.5 text-right font-bold text-indigo-650">Cumulative Sum</th>
                  </tr>
                </thead>
                <tbody>
                  {results.breakdown
                    .filter((item) => item.calendarYear >= new Date().getFullYear())
                    .map((item, index) => (
                      <tr
                        key={index}
                        className={`text-[9px] text-slate-600 border-b border-slate-100 ${
                          index % 2 === 1 ? "bg-slate-50/70" : "bg-white"
                        }`}
                      >
                        <td className="py-1 px-2.5 border-r border-slate-100">{item.year}</td>
                        <td className="py-1 px-2.5 border-r border-slate-100">{item.calendarYear}</td>
                        <td className="py-1 px-3 border-r border-slate-100 font-medium">
                          {item.label}
                        </td>
                        <td className="py-1 px-2.5 text-right border-r border-slate-100">
                          {item.mortgagePaidThisYear > 0 ? formatCurrencyLocal(item.mortgagePaidThisYear) : "—"}
                        </td>
                        <td className="py-1 px-2.5 text-right border-r border-slate-100">
                          {formatCurrencyLocal(item.maintenanceFeePaidThisYear)}
                        </td>
                        <td className="py-1 px-2.5 text-right border-r border-slate-100">
                          {item.otherFeesPaidThisYear + item.specialAssessmentsThisYear > 0
                            ? formatCurrencyLocal(item.otherFeesPaidThisYear + item.specialAssessmentsThisYear)
                            : "—"}
                        </td>
                        <td className="py-1 px-2.5 text-right border-r border-slate-100 font-bold text-slate-900">
                          {formatCurrencyLocal(item.yearlyTotal)}
                        </td>
                        <td className="py-1 px-2.5 text-right font-bold text-slate-950">
                          {formatCurrencyLocal(item.cumulativeTotal)}
                        </td>
                      </tr>
                    ))}
                  {/* Total Summary Row */}
                  <tr className="bg-[#f8fafc] border-t-2 border-slate-300 font-extrabold text-[9px] text-slate-805">
                    <td className="py-2 px-2.5" colSpan={3}>
                      LIFETIME CUMULATIVE SUMS (FULL HISTORY)
                    </td>
                    <td className="py-2 px-2.5 text-right border-r border-slate-200">
                      {formatCurrencyLocal(results.grandTotalMortgage)}
                    </td>
                    <td className="py-2 px-2.5 text-right border-r border-slate-200">
                      {formatCurrencyLocal(results.grandTotalMaintenanceFees)}
                    </td>
                    <td className="py-2 px-2.5 text-right border-r border-slate-200">
                      {formatCurrencyLocal(results.grandTotalOther)}
                    </td>
                    <td className="py-2 px-2.5 text-right border-r border-slate-200">
                      {formatCurrencyLocal(results.grandTotalCost)}
                    </td>
                    <td className="py-2 px-2.5 text-right text-indigo-700">
                      {formatCurrencyLocal(results.grandTotalCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 4: Audit Compliance & Release Protocols */}
            <div className="space-y-1.5 mt-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                4. AUDIT COMPLIANCE & ESCROW RELEASE PROTOCOLS
              </h3>
              <p className="text-[10px] text-slate-500 leading-relaxed max-w-3xl">
                This dossier marks the formal initiation of legal profile compilation. In accordance with Serenity 1 Consulting's certified escrow guarantees, all files are submitted directly to the board of legal analysts for immediate audit processing. Any subsequent financial claims vs the developer properties will be executed in a dedicated fiduciary attorney channel.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Disclaimer block */}
            <div className="text-center text-[8px] text-slate-400 mt-6 pt-3 border-t border-slate-200 max-w-3xl mx-auto">
              Disclaimer: This Serenity 1 Consulting Group portfolio audit is based on user-inputs, historical SEC public filings, and regional industry averages. Cumulative cash calculations are projections and do not constitute absolute legal binding advice.
            </div>

            <div className="flex justify-between items-center text-[9px] text-slate-400 pt-2 font-semibold">
              <span>© {new Date().getFullYear()} SERENITY 1 CONSULTING GROUP – SYSTEM REVISION 2026</span>
              <span>Page 2 of 2</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
