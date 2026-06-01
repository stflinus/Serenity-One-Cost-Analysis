import { CalculatorInputs, CalculationResults, YearBreakdown } from "../types";

export function calculateTimeshareCosts(inputs: CalculatorInputs): CalculationResults {
  const {
    resortId,
    customAnnualIncrease,
    purchasePrice,
    isFinanced,
    isMortgagePaidOff,
    downPayment,
    monthlyPayment,
    loanTermYears,
    initialMaintenanceFee,
    specialAssessmentsCount,
    specialAssessmentAmount,
    annualMembershipDues,
    hasExchangeDues,
    exchangeProvider,
    exchangeAnnualAmount,
    customExchangeDues,
    hasSpecialAssessments,
    customSpecialAssessments,
    hasPaidExitFees,
    customExitFees,
    yearsOwnedPast,
    yearsProjectedFuture,
    alternativeVacationCost,
    investmentReturnRate
  } = inputs;

  const totalYears = yearsOwnedPast + yearsProjectedFuture;
  const breakdown: YearBreakdown[] = [];
  const returnRateDec = investmentReturnRate / 100;
  
  // Decide annual maintenance fee increase rate based on input
  // (if custom is selected or if standard rates exist)
  let maintenanceIncreaseRate = customAnnualIncrease / 100;

  // Let's get the current calendar year to offset labels and timelines
  const currentCalendarYear = new Date().getFullYear();
  const startCalendarYear = currentCalendarYear - yearsOwnedPast + 1;

  // Cumulative trackers
  let cumulativeTotal = 0;
  let cumulativeMaintenanceFees = 0;
  let cumulativeMortgage = 0;
  let cumulativeOther = 0;
  let alternativeCumulativeVacation = 0;
  let opportunityCostInvestmentValue = 0;

  // Allocate special assessments evenly over the years, or trigger them every 5 years
  // Let's place a special assessment at Year 3, Year 8, Year 13, Year 18, etc.
  // depending on specialAssessmentsCount.
  const specialAssessmentYears: { [key: number]: boolean } = {};
  if (!hasSpecialAssessments && specialAssessmentsCount > 0) {
    // If they have e.g. 3 assessments over 20 years, space them out
    const spacing = Math.max(2, Math.floor(totalYears / (specialAssessmentsCount + 1)));
    for (let i = 1; i <= specialAssessmentsCount; i++) {
      const targetYear = Math.min(totalYears, i * spacing + 1);
      specialAssessmentYears[targetYear] = true;
    }
  }

  // Yearly loop
  for (let y = 1; y <= totalYears; y++) {
    const isFuture = y > yearsOwnedPast;
    const calendarYear = startCalendarYear + y - 1;
    const label = isFuture 
      ? `Future Yr ${y - yearsOwnedPast}` 
      : `Past Yr ${y}`;

    // 1. Mortgage calculations
    let mortgagePaidThisYear = 0;
    if (isFinanced) {
      if (isMortgagePaidOff) {
        // Mortgage was paid off in the past
        // If they owned it for X years and loan term is T years, they paid it during the first T years.
        if (y <= loanTermYears) {
          mortgagePaidThisYear = monthlyPayment * 12;
          // Add downpayment in Year 1
          if (y === 1) {
            mortgagePaidThisYear += downPayment;
          }
        }
      } else {
        // Mortgage is still active and ongoing
        // They pay mortgage up to Year loanTermYears
        if (y <= loanTermYears) {
          mortgagePaidThisYear = monthlyPayment * 12;
          if (y === 1) {
            mortgagePaidThisYear += downPayment;
          }
        }
      }
    } else {
      // Cash purchase
      // Paid in full in Year 1
      if (y === 1) {
        mortgagePaidThisYear = purchasePrice;
      }
    }

    // 2. Maintenance Fee calculations (compounding)
    // Year 1 is initialMaintenanceFee
    // Year y is initialMaintenanceFee * (1 + maintenanceIncreaseRate)^(y-1)
    const maintenanceFeePaidThisYear = initialMaintenanceFee * Math.pow(1 + maintenanceIncreaseRate, y - 1);

    // 3. Other Fees (annual dues, e.g., RCI, II, Exit/Termination Fees)
    let otherFeesPaidThisYear = 0;
    if (hasExchangeDues) {
      otherFeesPaidThisYear = exchangeAnnualAmount || 0;
    }
    if (hasPaidExitFees && customExitFees && customExitFees.length > 0) {
      const matchingExitFees = customExitFees.filter(ef => ef.year === y);
      otherFeesPaidThisYear += matchingExitFees.reduce((sum, ef) => sum + ef.amount, 0);
    }

    // 4. Special Assessments
    let specialAssessmentsThisYear = 0;
    if (hasSpecialAssessments && customSpecialAssessments && customSpecialAssessments.length > 0) {
      const matchingAssessments = customSpecialAssessments.filter(sa => sa.year === y);
      specialAssessmentsThisYear = matchingAssessments.reduce((sum, sa) => sum + sa.amount, 0);
    }

    // Totals for this year
    const yearlyTotal = mortgagePaidThisYear + maintenanceFeePaidThisYear + otherFeesPaidThisYear + specialAssessmentsThisYear;
    
    cumulativeTotal += yearlyTotal;
    cumulativeMaintenanceFees += maintenanceFeePaidThisYear;
    cumulativeMortgage += mortgagePaidThisYear;
    cumulativeOther += otherFeesPaidThisYear + specialAssessmentsThisYear;

    // 5. Alternative Vacation Cost (if they had just stayed in standard hotels)
    // Grows by 3% inflation
    const alternativeVacationPaidThisYear = alternativeVacationCost * Math.pow(1 + 0.03, y - 1);
    alternativeCumulativeVacation += alternativeVacationPaidThisYear;

    // 6. Opportunity Cost of Investment (Compounding what they spent on timeshare)
    // We assume they invest the starting outlay at Year 1 start, and yearly payments at end of year
    if (y === 1) {
      // Year 1 starts with the downpayment or full cash purchase price
      const initialOutlay = isFinanced ? downPayment : purchasePrice;
      const yearlyOperationalCost = yearlyTotal - initialOutlay;
      
      // Compound the initial outlay for 1 year, and add the operational cost at Year 1 end
      opportunityCostInvestmentValue = initialOutlay * (1 + returnRateDec) + yearlyOperationalCost;
    } else {
      // Compounding previous year balance + adding this year's total timeshare spent
      opportunityCostInvestmentValue = (opportunityCostInvestmentValue + yearlyTotal) * (1 + returnRateDec);
    }

    breakdown.push({
      year: y,
      calendarYear,
      label,
      isFuture,
      mortgagePaidThisYear,
      maintenanceFeePaidThisYear,
      otherFeesPaidThisYear,
      specialAssessmentsThisYear,
      yearlyTotal,
      cumulativeTotal,
      cumulativeMaintenanceFees,
      cumulativeMortgage,
      cumulativeOther,
      alternativeCumulativeVacation,
      opportunityCostInvestmentValue
    });
  }

  // Aggregate past vs future expenditures
  let pastMortgageSpent = 0;
  let pastMaintenanceSpent = 0;
  let pastOtherSpent = 0;
  let pastTotalSpent = 0;
  
  let futureMortgageSpent = 0;
  let futureMaintenanceSpent = 0;
  let futureOtherSpent = 0;
  let futureTotalSpent = 0;

  let alternativeTotalVacationCostPast = 0;
  let alternativeTotalVacationCostFuture = 0;

  breakdown.forEach(item => {
    if (!item.isFuture) {
      pastMortgageSpent += item.mortgagePaidThisYear;
      pastMaintenanceSpent += item.maintenanceFeePaidThisYear;
      pastOtherSpent += item.otherFeesPaidThisYear + item.specialAssessmentsThisYear;
      pastTotalSpent += item.yearlyTotal;
      alternativeTotalVacationCostPast += alternativeVacationCost * Math.pow(1 + 0.03, item.year - 1);
    } else {
      futureMortgageSpent += item.mortgagePaidThisYear;
      futureMaintenanceSpent += item.maintenanceFeePaidThisYear;
      futureOtherSpent += item.otherFeesPaidThisYear + item.specialAssessmentsThisYear;
      futureTotalSpent += item.yearlyTotal;
      alternativeTotalVacationCostFuture += alternativeVacationCost * Math.pow(1 + 0.03, item.year - 1);
    }
  });

  const grandTotalCost = pastTotalSpent + futureTotalSpent;
  const grandTotalMaintenanceFees = pastMaintenanceSpent + futureMaintenanceSpent;
  const grandTotalMortgage = pastMortgageSpent + futureMortgageSpent;
  const grandTotalOther = pastOtherSpent + futureOtherSpent;
  const alternativeGrandTotalVacationCost = alternativeTotalVacationCostPast + alternativeTotalVacationCostFuture;

  const opportunityCostTotalValue = breakdown[breakdown.length - 1]?.opportunityCostInvestmentValue || 0;
  const netLossVsVacation = grandTotalCost - alternativeGrandTotalVacationCost;
  const netLossVsInvesting = opportunityCostTotalValue - alternativeGrandTotalVacationCost;

  return {
    yearsOwnedPast,
    yearsProjectedFuture,
    totalYears,
    pastMortgageSpent,
    pastMaintenanceSpent,
    pastOtherSpent,
    pastTotalSpent,
    futureMortgageSpent,
    futureMaintenanceSpent,
    futureOtherSpent,
    futureTotalSpent,
    grandTotalCost,
    grandTotalMaintenanceFees,
    grandTotalMortgage,
    grandTotalOther,
    alternativeTotalVacationCostPast,
    alternativeTotalVacationCostFuture,
    alternativeGrandTotalVacationCost,
    opportunityCostTotalValue,
    netLossVsVacation,
    netLossVsInvesting,
    breakdown
  };
}
