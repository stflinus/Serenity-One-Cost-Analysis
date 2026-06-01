import { useState, useMemo } from "react";
import { CalculatorInputs } from "./types";
import { RESORT_LIST } from "./data/resorts";
import { calculateTimeshareCosts } from "./utils/calculator";
import { SerenityLogo } from "./components/SerenityLogo";
import { InputForm } from "./components/InputForm";
import { StatsGrid } from "./components/StatsGrid";
import { CashFlowTable } from "./components/CashFlowTable";
import { Landmark, ArrowDownCircle, Info, PhoneCall, Copy, Check, ExternalLink, Share2, Sparkles } from "lucide-react";
import { MiniSIcon } from "./components/MiniSIcon";

const INITIAL_INPUTS: CalculatorInputs = {
  resortId: "mvc", // Marriott Vacation Club
  customAnnualIncrease: 6.0,
  purchasePrice: 22000,
  
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
  const [copied, setCopied] = useState(false);
  
  const handleCopyLink = () => {
    // Falls back to direct live testing URL in case of localhost
    const testUrl = window.location.origin.includes("localhost") || !window.location.origin
      ? "https://ais-pre-uint65jwfwksg3wf2zau5z-22470939327.us-west2.run.app" 
      : window.location.origin;
    navigator.clipboard.writeText(testUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Predefined realistic default values for timeshare contract calculations
  const [inputs, setInputs] = useState<CalculatorInputs>(INITIAL_INPUTS);

  const handleResetToDefaults = () => {
    setInputs(INITIAL_INPUTS);
  };

  // Calculate costs reactively on state modifications
  const results = useMemo(() => {
    return calculateTimeshareCosts(inputs);
  }, [inputs]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Premium Dark Corporate Top bar */}
      <header className="bg-[#1e293b] border-b border-slate-800 shadow-md sticky top-0 z-50">
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
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-grow max-w-none w-full px-4 sm:px-8 lg:px-12 py-8 space-y-8">
        
        {/* Dynamic Warning Alert on Coastal Hurricane Spikes */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border-l-4 border-indigo-500 p-4 rounded-r-xl flex items-start gap-3.5">
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

        {/* Live Testing SandBox Web Link & Mini S Icon Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Elegant glowing miniature 'S' icon thumbnail representation */}
            <MiniSIcon size={30} className="shadow-lg shadow-indigo-150 transform hover:scale-105 transition-transform" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Testing Sandbox
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                Serenity 1 Calculator Public Web Link
              </h3>
              <p className="text-xs text-slate-500">
                Share this secure web link to perform live multi-scenario validations and client audits instantly.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Interactive copyable address box */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 select-all max-w-full overflow-x-auto gap-2">
              <Share2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-[280px]">
                {window.location.origin.includes("localhost") || !window.location.origin
                  ? "https://ais-pre-uint65jwfwksg3wf2zau5z-22470939327.us-west2.run.app"
                  : window.location.origin}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                  copied
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700 shadow-sm"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </>
                )}
              </button>

              <a
                href={
                  window.location.origin.includes("localhost") || !window.location.origin
                    ? "https://ais-pre-uint65jwfwksg3wf2zau5z-22470939327.us-west2.run.app"
                    : window.location.origin
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                Open Tab
              </a>
            </div>
          </div>
        </div>

        {/* Stats Grid Dashboard Bento Banner */}
        <StatsGrid results={results} />

        {/* Two Column Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Inputs (Span 5 of 12) */}
          <section className="lg:col-span-5 w-full">
            <InputForm inputs={inputs} onChange={setInputs} onReset={handleResetToDefaults} />
          </section>

          {/* Right Column: Ledger (Span 7 of 12) */}
          <section className="lg:col-span-7 w-full space-y-8">
            {/* Detail Cashflow Ledger (Expandable) */}
            <CashFlowTable results={results} />
          </section>

        </div>
      </main>

      {/* Corporate Footing and Professional Disclaimers */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-850 py-10">
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
    </div>
  );
}
