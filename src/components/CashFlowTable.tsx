import React, { useState } from "react";
import { CalculationResults, YearBreakdown } from "../types";
import { ChevronDown, ChevronUp, Eye, FileSpreadsheet, Calendar, Download } from "lucide-react";

interface CashFlowTableProps {
  results: CalculationResults;
}

export const CashFlowTable: React.FC<CashFlowTableProps> = ({ results }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDownloadCSV = () => {
    // CSV Header row
    const headers = [
      "Calendar Year",
      "Epoch Label",
      "Mortgage & Down Payment ($)",
      "Maintenance Fee ($)",
      "Assessments & Dues ($)",
      "Yearly Total ($)",
      "Cumulative Sunk ($)"
    ];

    // CSV Rows
    const rows = results.breakdown.map((row) => [
      row.calendarYear,
      row.label,
      row.mortgagePaidThisYear,
      row.maintenanceFeePaidThisYear,
      row.otherFeesPaidThisYear + row.specialAssessmentsThisYear,
      row.yearlyTotal,
      row.cumulativeTotal
    ]);

    // Construct CSV content with metadata
    const csvContent = [
      ["Timeshare Financial Audit Ledger Export"],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [`Sunk Cost Past Spent: $${Math.round(results.pastTotalSpent).toLocaleString()}`],
      [`Estimated Refund Potential (70%): $${Math.round(results.pastTotalSpent * 0.70).toLocaleString()}`],
      [], // blank line
      headers,
      ...rows
    ]
      .map((e) => e.map(val => {
        const valStr = val !== undefined && val !== null ? String(val) : "";
        if (valStr.includes(",") || valStr.includes('"') || valStr.includes('\n')) {
          return `"${valStr.replace(/"/g, '""')}"`;
        }
        return valStr;
      }).join(","))
      .join("\n");

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Timeshare_Cash_Flow_Ledger_${results.breakdown[0]?.calendarYear || 2020}_to_${results.breakdown[results.breakdown.length - 1]?.calendarYear || 2045}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const visibleBreakdown = isExpanded 
    ? results.breakdown 
    : results.breakdown.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-205 p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Detailed Cash Flow Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Annual itemized ledger from purchase year {results.breakdown[0]?.calendarYear || 2020} through {results.breakdown[results.breakdown.length - 1]?.calendarYear || 2045}.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Download detailed Excel spreadsheet (.csv)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Excel Ledger (.csv)
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show Full {results.totalYears}-Yr Ledger <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="px-4 py-3">Year / Epoch</th>
              <th className="px-4 py-3 text-right">Mortgage & Down</th>
              <th className="px-4 py-3 text-right">Maint. Fee</th>
              <th className="px-4 py-3 text-right">Assess & Dues</th>
              <th className="px-4 py-3 font-semibold text-slate-700 text-right bg-slate-50/80">Yearly Bill</th>
              <th className="px-4 py-3 font-semibold text-slate-700 text-right">Cumulative Sunk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
            {visibleBreakdown.map((row) => (
              <tr 
                key={row.year} 
                className={`hover:bg-slate-50/50 transition-colors ${
                  row.isFuture 
                    ? "bg-slate-50/10" 
                    : "bg-emerald-50/5"
                }`}
              >
                {/* Year/Ephoch */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${row.isFuture ? 'bg-indigo-500' : 'bg-emerald-450'}`} />
                    <div>
                      <span className="font-bold text-slate-800">{row.calendarYear}</span>
                      <span className="text-[10px] text-slate-400 block font-normal">{row.label}</span>
                    </div>
                  </div>
                </td>
 
                {/* Mortgage */}
                <td className="px-4 py-3.5 text-right font-mono text-slate-755">
                  {row.mortgagePaidThisYear > 0 ? formatCurrency(row.mortgagePaidThisYear) : "—"}
                </td>
 
                {/* Maintenance Fee */}
                <td className="px-4 py-3.5 text-right font-mono text-slate-755">
                  {formatCurrency(row.maintenanceFeePaidThisYear)}
                </td>
 
                {/* Assessments & Dues */}
                <td className="px-4 py-3.5 text-right font-mono text-slate-500">
                  {(row.otherFeesPaidThisYear + row.specialAssessmentsThisYear) > 0 
                    ? formatCurrency(row.otherFeesPaidThisYear + row.specialAssessmentsThisYear) 
                    : "—"}
                </td>
 
                {/* Yearly Total */}
                <td className="px-4 py-3.5 text-right text-slate-800 font-extrabold font-mono bg-slate-50/30">
                  {formatCurrency(row.yearlyTotal)}
                </td>
 
                {/* Cumulative Total */}
                <td className="px-4 py-3.5 text-right text-indigo-600 font-black font-mono">
                  {formatCurrency(row.cumulativeTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {!isExpanded && results.totalYears > 5 && (
        <div className="text-center pt-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-all shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-slate-450" />
            Expand Remaining {results.totalYears - 5} Years of Transactions
          </button>
        </div>
      )}
    </div>
  );
};
