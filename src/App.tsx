import { useState, useMemo } from "react";
import { CalculatorInputs } from "./types";
import { calculateTimeshareCosts } from "./utils/calculator";
import { SerenityLogo } from "./components/SerenityLogo";
import { InputForm } from "./components/InputForm";
import { StatsGrid } from "./components/StatsGrid";
import { CashFlowTable } from "./components/CashFlowTable";
import { Landmark, Info, PhoneCall, FileDown, Printer } from "lucide-react";
import { generatePdfSummary } from "./utils/pdfGenerator";

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
  // Predefined realistic default values for timeshare contract calculations
  const [inputs, setInputs] = useState<CalculatorInputs>(INITIAL_INPUTS);

  const handleResetToDefaults = () => {
    setInputs({
      resortId: "mvc",
      customAnnualIncrease: 0,
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
    });
  };

  // Calculate costs reactively on state modifications
  const results = useMemo(() => {
    return calculateTimeshareCosts(inputs);
  }, [inputs]);

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
              id="download-summary-pdf"
              onClick={() => generatePdfSummary(inputs, results)}
              className="flex items-center gap-1.5 text-slate-900 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 px-4 py-1.5 rounded-xl font-bold transition-all border border-amber-500/30 shadow-sm shadow-amber-500/10 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-900" />
              Download Summary
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
      <main className="flex-grow max-w-none w-full px-4 sm:px-8 lg:px-12 py-8 space-y-8">
        
        {/* Print-Only Corporate Header Block */}
        <div className="hidden print:block border-b-2 border-indigo-500 pb-4 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">SERENITY 1 CONSULTING GROUP</h1>
              <p className="text-sm text-slate-500 font-medium">Timeshare Portfolio Audit & Forensic Outflow Analysis</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-black text-indigo-600 tracking-widest leading-none mb-1">Confidential Diagnostic Report</p>
              <p className="text-xs text-slate-600 font-bold">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
        </div>
        
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

        {/* Stats Grid Dashboard Bento Banner */}
        <StatsGrid results={results} inputs={inputs} />

        {/* Two Column Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Inputs (Span 5 of 12) */}
          <section className="lg:col-span-5 w-full print:hidden">
            <InputForm inputs={inputs} onChange={setInputs} onReset={handleResetToDefaults} />
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

      {/* Print-Only Corporate Disclaimer Footer */}
      <div className="hidden print:block text-center text-[9px] text-slate-400 mt-12 pt-4 border-t border-slate-200">
        <p className="leading-relaxed max-w-3xl mx-auto">
          Disclaimer: This Serenity 1 Consulting Group portfolio audit is based on user-inputs, historical SEC public filings, and regional industry averages. Cumulative cash calculations are projections and do not constitute absolute legal binding advice.
        </p>
        <p className="mt-1 font-bold">
          © {new Date().getFullYear()} Serenity 1 Consulting Group. Confidential Diagnostic.
        </p>
      </div>
    </div>
  );
}
