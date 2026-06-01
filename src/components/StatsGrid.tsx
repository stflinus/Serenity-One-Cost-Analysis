import React from "react";
import { CalculationResults } from "../types";
import { DollarSign, ArrowUpRight, ShieldAlert, TrendingUp, Compass, Landmark, Coins, Percent } from "lucide-react";

interface StatsGridProps {
  results: CalculationResults;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ results }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isMoreExpensiveThanHotel = results.grandTotalCost > results.alternativeGrandTotalVacationCost;
  const premiumRatio = results.alternativeGrandTotalVacationCost > 0
    ? ((results.grandTotalCost / results.alternativeGrandTotalVacationCost) - 1) * 100
    : 0;

  const estimatedRefund = results.pastTotalSpent * 0.70;
  // Refund-only cost is 12% of estimated refund, min $4,000 if they have a refund potential
  const refundOnlyCost = results.pastTotalSpent > 0 
    ? Math.max(4000, estimatedRefund * 0.12)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* 1. Sunk Costs (Past Spent) */}
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
          Accrued over the last <span className="font-semibold text-slate-600">{results.yearsOwnedPast} years</span>
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
          Expected lock-in for next <span className="font-semibold text-indigo-600">{results.yearsProjectedFuture} years</span>
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
          Lifetime cost over <span className="text-indigo-200 font-semibold">{results.totalYears} years</span>
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
          *with full accounting
        </div>
      </div>

      {/* 5. Refund Only Cost */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-205 flex flex-col justify-between hover:translate-y-[-2px] transition-all relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Refund Only Cost
          </span>
          <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-black text-slate-800 font-sans tracking-tight">
            {formatCurrency(refundOnlyCost)}
          </h3>
          <div className="text-[11px] text-slate-500 mt-1.5 flex flex-col gap-0.5 opacity-0 select-none pointer-events-none" aria-hidden="true">
            <span>Placeholder Space 1</span>
            <span>Placeholder Space 2</span>
          </div>
        </div>
        <div className="text-[10px] text-cyan-600 mt-3 border-t border-slate-100 pt-2 font-medium">
          based on CUSIP and filing fees
        </div>
      </div>

    </div>
  );
};

