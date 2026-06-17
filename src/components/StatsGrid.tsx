import React from "react";
import { CalculationResults, CalculatorInputs } from "../types";
import { DollarSign, Compass, Landmark, Coins, Percent, ArrowUpRight, ShieldAlert, Sparkles } from "lucide-react";

interface StatsGridProps {
  results: CalculationResults;
  inputs: CalculatorInputs;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ results, inputs }) => {
  const formatCurrency = (value: number, showDecimals = false) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(value);
  };

  const cCount = inputs.contractCount === "" || inputs.contractCount === null ? 0 : Number(inputs.contractCount);
  
  // Calculate Exit-Only Cost based on contract/deed count:
  // - 1 deed: $4,567.32 (starts with 4, includes decimals)
  // - 2 contracts: $7,245.50 (starts with 7)
  // - 3 contracts: $9,438.15 (starts with 9)
  // - N contracts (>3): $9,438.15 + extra volume pricing per deed
  let exitOnlyCost = 0;
  if (cCount === 1) {
    exitOnlyCost = 4567.32;
  } else if (cCount === 2) {
    exitOnlyCost = 7245.50;
  } else if (cCount >= 3) {
    exitOnlyCost = 9438.15 + (cCount > 3 ? (cCount - 3) * 2500 : 0);
  }

  // Refund-only cost is 12% of estimated refund, min $4,000 if they have a refund potential
  const estimatedRefund = results.pastTotalSpent * 0.70;
  const refundOnlyCost = results.pastTotalSpent > 0 
    ? Math.max(4000, estimatedRefund * 0.12)
    : 0;

  // Refund & Exit Combined Cost logic ("someplace inbetween more than either one by itself but less than combining them"):
  // E.g. If Refund Only is $4k and Exit Only is $4k, combined refund & exit is around $5,800 (somewhere in between $4k and $8k).
  let combinedCost = 0;
  if (refundOnlyCost > 0 && exitOnlyCost > 0) {
    combinedCost = (refundOnlyCost + exitOnlyCost) * 0.725;
    const maxIndivid = Math.max(refundOnlyCost, exitOnlyCost);
    const sumC = refundOnlyCost + exitOnlyCost;
    if (combinedCost <= maxIndivid) {
      combinedCost = maxIndivid + (sumC - maxIndivid) * 0.3;
    }
  } else if (refundOnlyCost > 0) {
    combinedCost = refundOnlyCost;
  } else if (exitOnlyCost > 0) {
    combinedCost = exitOnlyCost;
  }

  return (
    <div className="space-y-6">
      {/* 4 Core Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Sunk Costs (Past) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-205 flex flex-col justify-between hover:translate-y-[-2px] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sunk Cost (Past)
            </span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 font-sans tracking-tight">
              {formatCurrency(results.pastTotalSpent)}
            </h3>
            <div className="text-[11px] text-slate-500 mt-1.5 flex flex-col gap-0.5">
              <span>Mortgage: {formatCurrency(results.pastMortgageSpent)}</span>
              <span>Maintenance: {formatCurrency(results.pastMaintenanceSpent)}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-3 border-t border-slate-100 pt-2 font-medium">
            Accrued over the last <span className="font-semibold text-slate-600">{results.yearsOwnedPast || 0} years</span>
          </div>
        </div>

        {/* 2. Future Projected Commitment */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-205 flex flex-col justify-between hover:translate-y-[-2px] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Future Sunk-Risk
            </span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-850 font-sans tracking-tight">
              {formatCurrency(results.futureTotalSpent)}
            </h3>
            <div className="text-[11px] text-slate-500 mt-1.5 flex flex-col gap-0.5">
              <span>Future Mortgage: {formatCurrency(results.futureMortgageSpent)}</span>
              <span>Future Maint.: {formatCurrency(results.futureMaintenanceSpent)}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-3 border-t border-slate-100 pt-2 font-medium">
            Expected lock-in for next <span className="font-semibold text-indigo-600">{results.yearsProjectedFuture || 0} years</span>
          </div>
        </div>

        {/* 3. Combined Total Financial Outflow */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-xl shadow-md flex flex-col justify-between text-white hover:translate-y-[-2px] transition-all relative overflow-hidden group border border-indigo-900/40">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:scale-110 transition-transform">
            <Landmark className="w-32 h-32 text-indigo-200" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Total Contract Cost
            </span>
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-indigo-650 rounded-lg text-white shadow-sm shadow-indigo-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 z-10">
            <h3 className="text-2xl font-extrabold font-sans tracking-tight text-white">
              {formatCurrency(results.grandTotalCost)}
            </h3>
            <div className="text-[11px] text-indigo-200/80 mt-1.5 flex flex-col gap-0.5">
              <span>Purchase + Loan: {formatCurrency(results.grandTotalMortgage)}</span>
              <span>Compounding Maint: {formatCurrency(results.grandTotalMaintenanceFees)}</span>
            </div>
          </div>
          <div className="text-[10px] text-indigo-300/60 mt-3 border-t border-indigo-900/60 pt-2 z-10 font-medium">
            Lifetime cost over <span className="text-indigo-200 font-semibold">{results.totalYears || 0} years</span>
          </div>
        </div>

        {/* 4. Estimated Refund */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-205 flex flex-col justify-between hover:translate-y-[-2px] transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Estimated Refund*
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 font-sans tracking-tight">
              {results.pastTotalSpent > 0 ? formatCurrency(estimatedRefund) : "$0"}
            </h3>
            <div className="text-[11px] text-slate-500 mt-1.5 flex flex-col gap-0.5">
              <span>Audit-based potential recovery:</span>
              <span>70% of accumulated past spent fees.</span>
            </div>
          </div>
          <div className="text-[10px] text-emerald-600 mt-3 border-t border-slate-100 pt-2 font-medium">
            *with full accounting audit
          </div>
        </div>
      </div>

      {/* Program Cost Remediations Area */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
              Remediation & Exit Program Fee Audit
            </h3>
            <p className="text-[11px] text-slate-500">
              Guaranteed escrow-backed service paths calculated for this case.
            </p>
          </div>
          <div className="text-[10px] bg-indigo-50 text-indigo-600 font-extrabold px-2.5 py-0.5 rounded-lg border border-indigo-100">
            Escrow-backed Quote Options
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Refund Only Program */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Refund Only Program
              </span>
              <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-md">
                <Percent className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xl font-extrabold text-slate-800">
                {refundOnlyCost > 0 ? formatCurrency(refundOnlyCost, refundOnlyCost % 1 !== 0) : "$0"}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Audit and recoupment filing fee setup. Est. refund success tracking.
              </p>
            </div>
            <div className="text-[9px] text-cyan-600 font-semibold mt-3.5 pt-2 border-t border-slate-100 flex items-center gap-1">
              <span>Backed by 12% regulatory performance fee</span>
            </div>
          </div>

          {/* Combined Exit and Refund Program */}
          <div className="bg-gradient-to-br from-indigo-50/20 to-indigo-50/40 p-4 rounded-xl border-2 border-indigo-200 relative overflow-hidden shadow-sm hover:translate-y-[-1px] transition-all">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-wider flex items-center gap-0.5">
              <Sparkles className="w-2 h-2" />
              Optimized Package
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                Combined Refund & Exit
              </span>
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                <Landmark className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xl font-black text-indigo-900">
                {combinedCost > 0 ? formatCurrency(combinedCost, combinedCost % 1 !== 0) : "$0"}
              </h4>
              <p className="text-[10px] text-indigo-950/70 mt-1">
                Immediate contract cancellation action and full audit file filings matched.
              </p>
            </div>
            <div className="text-[9px] text-indigo-600 font-extrabold mt-3.5 pt-2 border-t border-indigo-100/60 flex items-center justify-between">
              <span>27.5% bundle-saver program applied</span>
              <span className="text-indigo-400 font-bold line-through">
                {refundOnlyCost > 0 && exitOnlyCost > 0 ? formatCurrency(refundOnlyCost + exitOnlyCost) : ""}
              </span>
            </div>
          </div>

          {/* Exit Only Program */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-205 hover:border-indigo-200 transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Exit Only Program
              </span>
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
                <Compass className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xl font-extrabold text-slate-800">
                {exitOnlyCost > 0 ? formatCurrency(exitOnlyCost, exitOnlyCost % 1 !== 0) : "$0"}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">
                {cCount === 1 && "Deed termination flat rate (1 contract/deed)."}
                {cCount === 2 && "Volume deed termination flat rate (2 contracts/deeds)."}
                {cCount >= 3 && `Bulk-discount contract release package (${cCount} contracts/deeds).`}
                {cCount === 0 && "Please specify the count of deeds owned above."}
              </p>
            </div>
            <div className="text-[9px] text-amber-600 font-semibold mt-3.5 pt-2 border-t border-slate-100 flex items-center gap-1">
              <span>Deed release guarantee + full compliance certification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
