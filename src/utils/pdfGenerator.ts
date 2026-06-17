import { jsPDF } from "jspdf";
import { CalculatorInputs, CalculationResults } from "../types";
import { RESORT_LIST } from "../data/resorts";

export function generatePdfSummary(inputs: CalculatorInputs, results: CalculationResults): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const formatCurrency = (val: number, showDecimals = false) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(val);
  };

  const getResortName = (id: string) => {
    const resort = RESORT_LIST.find((r) => r.id === id);
    return resort ? resort.name : id;
  };

  const todayStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ==========================================
  // PAGE 1: EXECUTIVE AUDIT & PORTFOLIO METRICS
  // ==========================================

  // --- Corporate Header Banner ---
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(10, 10, 190, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SERENITY 1 CONSULTING GROUP", 15, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(191, 219, 254); // light indigo
  doc.text("Timeshare Portfolio Audit & Forensic Outflow Analysis", 15, 26);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("EXECUTIVE REPORT", 195, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(156, 163, 175); // gray-400
  doc.setFontSize(7.5);
  doc.text(`Generated: ${todayStr}`, 195, 24, { align: "right" });
  doc.text("Classification: Confidentially Assessed", 195, 29, { align: "right" });

  // --- Decorative Border Accent Line ---
  doc.setFillColor(99, 102, 241); // indigo-500
  doc.rect(10, 36, 190, 1.5, "F");

  // --- Main Title Segment ---
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. EXECUTIVE AUDIT PORTFOLIO DIAGNOSTIC", 10, 45);

  // --- Column 1 Card: Timeshare Parameters ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(10, 49, 92, 88, "FD");

  // Title inside card 1
  doc.setFillColor(71, 85, 105); // slate-600
  doc.rect(10, 49, 92, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("PORTFOLIO CONTRACT PARAMETERS", 14, 54);

  // Contents
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Property Developer Brand:", 14, 63);
  doc.setFont("helvetica", "normal");
  const resortName = getResortName(inputs.resortId);
  const splitResortName = doc.splitTextToSize(resortName, 84);
  doc.text(splitResortName, 14, 67);

  const startYParams = 74;
  doc.setFont("helvetica", "bold");
  doc.text("Starting Purchase Price:", 14, startYParams);
  doc.setFont("helvetica", "normal");
  doc.text(formatCurrency(Number(inputs.purchasePrice) || 0), 62, startYParams);

  doc.setFont("helvetica", "bold");
  doc.text("Financed Contract Terms:", 14, startYParams + 6);
  doc.setFont("helvetica", "normal");
  const financingText = inputs.isFinanced
    ? `${inputs.isMortgagePaidOff ? "Fully Paid Off" : `Active (Term: ${inputs.loanTermYears} yrs)`}`
    : "No (Paid in Cash)";
  doc.text(financingText, 62, startYParams + 6);

  doc.setFont("helvetica", "bold");
  doc.text("Avg. Annual Increase:", 14, startYParams + 12);
  doc.setFont("helvetica", "normal");
  doc.text(`${(inputs.customAnnualIncrease || 0).toFixed(1)}% compounding`, 62, startYParams + 12);

  doc.setFont("helvetica", "bold");
  doc.text("Base Maintenance Fee:", 14, startYParams + 18);
  doc.setFont("helvetica", "normal");
  doc.text(`${formatCurrency(Number(inputs.initialMaintenanceFee) || 0)} / year`, 62, startYParams + 18);

  doc.setFont("helvetica", "bold");
  doc.text("Exchange & Club Dues:", 14, startYParams + 24);
  doc.setFont("helvetica", "normal");
  const exchangeText = inputs.hasExchangeDues
    ? `${formatCurrency(Number(inputs.exchangeAnnualAmount) || 0)} / year (${String(inputs.exchangeProvider || "RCI").toUpperCase()})`
    : "None";
  doc.text(exchangeText, 62, startYParams + 24);

  doc.setFont("helvetica", "bold");
  doc.text("Recorded Assessments:", 14, startYParams + 30);
  doc.setFont("helvetica", "normal");
  const assessmentsText = inputs.hasSpecialAssessments
    ? `Configured custom schedule`
    : `Avg ${formatCurrency(Number(inputs.specialAssessmentAmount) || 0)} (${Number(inputs.specialAssessmentsCount) || 0} times)`;
  doc.text(assessmentsText, 62, startYParams + 30);

  doc.setFont("helvetica", "bold");
  doc.text("Timeline Horizon:", 14, startYParams + 36);
  doc.setFont("helvetica", "normal");
  doc.text(`${results.yearsOwnedPast} yrs past / ${results.yearsProjectedFuture} yrs future`, 62, startYParams + 36);

  doc.setFont("helvetica", "bold");
  doc.text("Total Evaluation Period:", 14, startYParams + 42);
  doc.setFont("helvetica", "normal");
  doc.text(`${results.totalYears} Years total`, 62, startYParams + 42);


  // --- Column 2 Card: Financial Liability Diagnostics ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(108, 49, 92, 88, "FD");

  // Title inside card 2
  doc.setFillColor(15, 23, 42); // slate-900 (High trust accent)
  doc.rect(108, 49, 92, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("CUMULATIVE LIABILITY ANALYSIS", 112, 54);

  // Contents
  const startYCosts = 63;
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.text("Sunk Outflow (Past Fees):", 112, startYCosts);
  doc.setFont("helvetica", "normal");
  doc.text(formatCurrency(results.pastTotalSpent), 162, startYCosts);

  doc.setFont("helvetica", "bold");
  doc.text("Future Binding Outflow:", 112, startYCosts + 6);
  doc.setFont("helvetica", "normal");
  doc.text(formatCurrency(results.futureTotalSpent), 162, startYCosts + 6);

  // Divider line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.line(112, startYCosts + 9, 196, startYCosts + 9);

  // Highlight Outflow Total
  doc.setFont("helvetica", "bold");
  doc.setTextColor(190, 24, 74); // rose-700
  doc.text("LIFETIME CONTRACT TOTAL:", 112, startYCosts + 14);
  doc.text(formatCurrency(results.grandTotalCost), 162, startYCosts + 14);

  // Reset text color for standard metrics
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Total Mortgage & Interest:", 112, startYCosts + 20);
  doc.text(formatCurrency(results.grandTotalMortgage), 162, startYCosts + 20);

  doc.text("Total Maintenance & Dues:", 112, startYCosts + 25);
  doc.text(formatCurrency(results.grandTotalMaintenanceFees + results.grandTotalOther), 162, startYCosts + 25);

  doc.line(112, startYCosts + 28, 196, startYCosts + 28);

  // Asset Recovery Options
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.setFontSize(7);
  doc.text("Estimated Refund (with full accounting):", 112, startYCosts + 32);
  doc.setFontSize(7.5);
  doc.text(formatCurrency(results.pastTotalSpent * 0.70), 162, startYCosts + 32);

  const cCount = inputs.contractCount === "" || inputs.contractCount === null ? 0 : Number(inputs.contractCount);
  let exitOnlyCost = 0;
  if (cCount === 1) {
    exitOnlyCost = 4567.32;
  } else if (cCount === 2) {
    exitOnlyCost = 7245.50;
  } else if (cCount >= 3) {
    exitOnlyCost = 9438.15 + (cCount > 3 ? (cCount - 3) * 2500 : 0);
  }

  const refundCost = results.pastTotalSpent > 0 ? Math.max(4000, results.pastTotalSpent * 0.70 * 0.12) : 0;

  let combinedCost = 0;
  if (refundCost > 0 && exitOnlyCost > 0) {
    combinedCost = (refundCost + exitOnlyCost) * 0.725;
    const maxIndivid = Math.max(refundCost, exitOnlyCost);
    const sumC = refundCost + exitOnlyCost;
    if (combinedCost <= maxIndivid) {
      combinedCost = maxIndivid + (sumC - maxIndivid) * 0.3;
    }
  } else if (refundCost > 0) {
    combinedCost = refundCost;
  } else if (exitOnlyCost > 0) {
    combinedCost = exitOnlyCost;
  }

  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("Refund-Only Program Fee:", 112, startYCosts + 37);
  doc.text(formatCurrency(refundCost, refundCost % 1 !== 0), 162, startYCosts + 37);

  doc.text("Exit-Only Program Fee:", 112, startYCosts + 42);
  doc.text(formatCurrency(exitOnlyCost, exitOnlyCost % 1 !== 0), 162, startYCosts + 42);

  doc.text("Combined Refund & Exit Fee:", 112, startYCosts + 47);
  doc.text(formatCurrency(combinedCost, combinedCost % 1 !== 0), 162, startYCosts + 47);

  doc.setDrawColor(203, 213, 225);
  doc.line(112, startYCosts + 50, 196, startYCosts + 50);

  // Hotel Comparison Row
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text("Alternative Hotel Vacation Cost:", 112, startYCosts + 55);
  doc.text(formatCurrency(results.alternativeGrandTotalVacationCost), 162, startYCosts + 55);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Net Variance (Excess Lost):", 112, startYCosts + 61);
  doc.setTextColor(results.netLossVsVacation > 0 ? 190 : 16, results.netLossVsVacation > 0 ? 24 : 185, results.netLossVsVacation > 0 ? 74 : 129);
  doc.text(`${results.netLossVsVacation > 0 ? "+" : ""}${formatCurrency(results.netLossVsVacation)}`, 162, startYCosts + 61);

  // --- Draw program remediation solutions with 3 paths and bullet points ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("2. GUARANTEED PROGRAM REMEDIATION SOLUTIONS", 10, 146);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Escrow-backed legal structures and forensic auditing profiles mapped to this contract cases.", 10, 151);

  const cardYStart = 155;
  const cardHeight = 56;

  // CARD 1: Refund Only Path
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(10, cardYStart, 59, cardHeight, "FD");

  doc.setFillColor(71, 85, 105); // slate-600
  doc.rect(10, cardYStart, 59, 6.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("REFUND-ONLY PATH", 14, cardYStart + 4.5);

  doc.setTextColor(15, 23, 42); 
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(refundCost > 0 ? formatCurrency(refundCost, refundCost % 1 !== 0) : "$0", 14, cardYStart + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Recovers up to 70% of sunk cash.", 14, cardYStart + 18.5);

  doc.setDrawColor(241, 245, 249);
  doc.line(14, cardYStart + 22, 65, cardYStart + 22);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Program Scope Covers:", 14, cardYStart + 27);

  // Bullet points for Refund Only
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.setFillColor(71, 85, 105);
  doc.circle(16, cardYStart + 31.5, 0.6, "F");
  doc.text("CUSIP", 20, cardYStart + 32.5);

  doc.circle(16, cardYStart + 37, 0.6, "F");
  doc.text("Filing fee", 20, cardYStart + 38);

  doc.circle(16, cardYStart + 42.5, 0.6, "F");
  doc.text("CPA and Tax Attorney", 20, cardYStart + 43.5);


  // CARD 2: Combined Refund & Exit Path
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(199, 210, 254); // indigo-200
  doc.rect(75.5, cardYStart, 59, cardHeight, "FD");

  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(75.5, cardYStart, 59, 6.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("COMBINED REFUND & EXIT", 79.5, cardYStart + 4.5);

  doc.setTextColor(49, 46, 129); // indigo-900
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(combinedCost > 0 ? formatCurrency(combinedCost, combinedCost % 1 !== 0) : "$0", 79.5, cardYStart + 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text("Bundle-Saver Program Applied", 79.5, cardYStart + 18.5);

  doc.setDrawColor(199, 210, 254);
  doc.line(79.5, cardYStart + 22, 130.5, cardYStart + 22);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Program Scope Covers:", 79.5, cardYStart + 27);

  // Bullet points for Combined
  doc.setFont("helvetica", "normal");
  doc.setTextColor(49, 46, 129);
  doc.setFillColor(79, 70, 229);
  doc.circle(81.5, cardYStart + 31.5, 0.6, "F");
  doc.text("Refund Search & CPA Audits", 85.5, cardYStart + 32.5);

  doc.circle(81.5, cardYStart + 37, 0.6, "F");
  doc.text("Legal & Filing Preparations", 85.5, cardYStart + 38);

  doc.circle(81.5, cardYStart + 42.5, 0.6, "F");
  doc.text("Escrow Title & Deed Release", 85.5, cardYStart + 43.5);


  // CARD 3: Exit Only Path
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(141, cardYStart, 59, cardHeight, "FD");

  doc.setFillColor(71, 85, 105); // slate-600
  doc.rect(141, cardYStart, 59, 6.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("EXIT-ONLY PATH", 145, cardYStart + 4.5);

  doc.setTextColor(15, 23, 42); 
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(exitOnlyCost > 0 ? formatCurrency(exitOnlyCost, exitOnlyCost % 1 !== 0) : "$0", 145, cardYStart + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Complete deed/contract release.", 145, cardYStart + 18.5);

  doc.setDrawColor(241, 245, 249);
  doc.line(145, cardYStart + 22, 196, cardYStart + 22);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Program Scope Covers:", 145, cardYStart + 27);

  // Bullet points for Exit Only
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.setFillColor(71, 85, 105);
  doc.circle(147, cardYStart + 31.5, 0.6, "F");
  doc.text("Legal fees", 151, cardYStart + 32.5);

  doc.circle(147, cardYStart + 37, 0.6, "F");
  doc.text("Filing fees", 151, cardYStart + 38);

  doc.circle(147, cardYStart + 42.5, 0.6, "F");
  doc.text("Title and deed transfer", 151, cardYStart + 43.5);


  // --- Page Disclaimer Footer ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("TIMESHARE LIABILITY REPORT", 10, 284);
  doc.text("Page 1 of 2", 195, 284, { align: "right" });


  // ==========================================
  // PAGE 2: DETAILED CONTRACT LEDGER TABLE
  // ==========================================

  doc.addPage();

  // Header Page 2
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(10, 10, 190, 15, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("COMPREHENSIVE LEDGER SHEET - YEAR-BY-YEAR OUTFLOWS", 15, 19.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(191, 219, 254);
  doc.text("Audit Reference ID: SER-TS-2026", 195, 19.5, { align: "right" });

  doc.setFillColor(99, 102, 241); // indigo-500
  doc.rect(10, 25, 190, 1, "F");

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("3. DETAILED LEDGER COMPILING", 10, 31);

  // Summary Callout Box (Spent already & Projected Future)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(10, 35, 190, 18, "FD");

  // Vertical Divider in the box
  doc.setDrawColor(226, 232, 240);
  doc.line(105, 35, 105, 53);

  // Left Column: Sunk Cost (Spent Already)
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("ACCRUED PAST OUTFLOWS (SPENT ALREADY)", 14, 40);

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(formatCurrency(results.pastTotalSpent), 14, 46);

  doc.setTextColor(115, 115, 115);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(`Accumulated across last ${results.yearsOwnedPast} years of ownership.`, 14, 50.5);

  // Right Column: Projected Risk
  doc.setTextColor(79, 70, 229); // Indigo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("PROJECTED FUTURE OUTFLOWS (BASED ON YEARS SELECTED)", 109, 40);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(formatCurrency(results.futureTotalSpent), 109, 46);

  doc.setTextColor(115, 115, 115);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(`Projected exposure across selected ${results.yearsProjectedFuture} future years.`, 109, 50.5);

  // Table Headers
  const headerY = 58;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(10, headerY, 190, 7, "F");

  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Yr", 12, headerY + 5);
  doc.text("Cal. Yr", 22, headerY + 5);
  doc.text("Ownership Label", 38, headerY + 5);
  doc.text("Mortgage ($)", 75, headerY + 5, { align: "right" });
  doc.text("Maintenance ($)", 108, headerY + 5, { align: "right" });
  doc.text("Assess/Dues ($)", 139, headerY + 5, { align: "right" });
  doc.text("Annual Total ($)", 167, headerY + 5, { align: "right" });
  doc.text("Cumulative ($)", 195, headerY + 5, { align: "right" });

  doc.setLineWidth(0.15);
  doc.setDrawColor(203, 213, 225);
  doc.line(10, headerY + 7, 200, headerY + 7);

  // Table Rows (Iterating through Breakdown starting from current year moving forward)
  let rowY = headerY + 11;
  const rowHeight = 5.2;

  const currentYear = new Date().getFullYear();
  const ledgerItems = results.breakdown.filter(item => item.calendarYear >= currentYear);

  ledgerItems.forEach((item, index) => {
    // Alternating background pattern
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(10, rowY - 3.8, 190, rowHeight, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);

    // Render columns
    doc.text(String(item.year), 12, rowY);
    doc.text(String(item.calendarYear), 22, rowY);
    
    doc.setFont("helvetica", item.isFuture ? "normal" : "bold");
    doc.setTextColor(item.isFuture ? 71 : 15, item.isFuture ? 85 : 23, item.isFuture ? 105 : 42);
    doc.text(item.label, 38, rowY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(item.mortgagePaidThisYear > 0 ? formatCurrency(item.mortgagePaidThisYear) : "-", 75, rowY, { align: "right" });
    doc.text(formatCurrency(item.maintenanceFeePaidThisYear), 108, rowY, { align: "right" });
    doc.text(item.otherFeesPaidThisYear + item.specialAssessmentsThisYear > 0 ? formatCurrency(item.otherFeesPaidThisYear + item.specialAssessmentsThisYear) : "-", 139, rowY, { align: "right" });
    
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(item.yearlyTotal), 167, rowY, { align: "right" });
    doc.text(formatCurrency(item.cumulativeTotal), 195, rowY, { align: "right" });

    // Draw thin row delimiter
    doc.setDrawColor(241, 245, 249);
    doc.line(10, rowY + 1.4, 200, rowY + 1.4);

    rowY += rowHeight;

    // Handle overflow safety (A4 height is 297, so let's keep bottom space safe)
    if (rowY > 265 && index < ledgerItems.length - 1) {
      // Draw Page number footer
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.text("TIMESHARE LIABILITY REPORT (CONTINUED)", 10, 284);
      doc.text("Page 2 (Continued)", 195, 284, { align: "right" });

      doc.addPage();
      rowY = 30; // reset column starting position on new overflow page
      doc.setFillColor(30, 41, 59);
      doc.rect(10, 10, 190, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text("COMPREHENSIVE LEDGER (CONTINUED)", 15, 14.5);

      // Re-render sub headers on overflow page
      doc.setFillColor(241, 245, 249);
      doc.rect(10, 20, 190, 6, "F");
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(6.5);
      doc.text("Yr", 12, 24);
      doc.text("Cal. Yr", 22, 24);
      doc.text("Ownership Label", 38, 24);
      doc.text("Mortgage ($)", 75, 24, { align: "right" });
      doc.text("Maintenance ($)", 108, 24, { align: "right" });
      doc.text("Assess/Dues ($)", 139, 24, { align: "right" });
      doc.text("Annual Total ($)", 167, 24, { align: "right" });
      doc.text("Cumulative ($)", 195, 24, { align: "right" });
      doc.line(10, 26, 200, 26);
      rowY = 30;
    }
  });

  // Render Table Totals row below end of table
  doc.setLineWidth(0.4);
  doc.setDrawColor(148, 163, 184);
  doc.line(10, rowY - 3, 200, rowY - 3);

  doc.setFillColor(241, 245, 249);
  doc.rect(10, rowY - 2.5, 190, 6.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("LIFETIME CUMULATIVE SUMS", 12, rowY + 2);
  doc.text(formatCurrency(results.grandTotalMortgage), 75, rowY + 2, { align: "right" });
  doc.text(formatCurrency(results.grandTotalMaintenanceFees), 108, rowY + 2, { align: "right" });
  doc.text(formatCurrency(results.grandTotalOther), 139, rowY + 2, { align: "right" });
  doc.text(formatCurrency(results.grandTotalCost), 167, rowY + 2, { align: "right" });
  doc.text(formatCurrency(results.grandTotalCost), 195, rowY + 2, { align: "right" });

  doc.line(10, rowY + 4, 190 + 10, rowY + 4);


  // Footer Page 2
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("TIMESHARE LIABILITY REPORT SUMMARY", 10, 284);
  doc.text("Page 2 of 2", 195, 284, { align: "right" });

  // Save the PDF
  doc.save("Serenity_Timeshare_Audit_Summary.pdf");
}
