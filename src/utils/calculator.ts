import { CalculatorInputs, CalculationResults, YearBreakdown, TimeshareContract } from "../types";

export function calculateTimeshareCosts(inputs: CalculatorInputs): CalculationResults {
  const safeNum = (v: any) => {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const resortId = inputs.resortId;
  const customAnnualIncrease = safeNum(inputs.customAnnualIncrease);
  const purchasePrice = safeNum(inputs.purchasePrice);
  const isFinanced = inputs.isFinanced;
  const isMortgagePaidOff = inputs.isMortgagePaidOff;
  const downPayment = safeNum(inputs.downPayment);
  const monthlyPayment = safeNum(inputs.monthlyPayment);
  const loanTermYears = safeNum(inputs.loanTermYears);
  const initialMaintenanceFee = safeNum(inputs.initialMaintenanceFee);
  const specialAssessmentsCount = safeNum(inputs.specialAssessmentsCount);
  const specialAssessmentAmount = safeNum(inputs.specialAssessmentAmount);
  const annualMembershipDues = safeNum(inputs.annualMembershipDues);
  const hasExchangeDues = inputs.hasExchangeDues;
  const exchangeProvider = inputs.exchangeProvider;
  const exchangeAnnualAmount = safeNum(inputs.exchangeAnnualAmount);
  const customExchangeDues = inputs.customExchangeDues;
  const hasSpecialAssessments = inputs.hasSpecialAssessments;
  const customSpecialAssessments = inputs.customSpecialAssessments;
  const hasPaidExitFees = inputs.hasPaidExitFees;
  const customExitFees = inputs.customExitFees;
  const yearsOwnedPast = safeNum(inputs.yearsOwnedPast);
  const yearsProjectedFuture = safeNum(inputs.yearsProjectedFuture);
  const alternativeVacationCost = safeNum(inputs.alternativeVacationCost);
  const investmentReturnRate = safeNum(inputs.investmentReturnRate);

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
    
    // Compound and add base annual membership dues if present
    if (annualMembershipDues > 0) {
      otherFeesPaidThisYear += annualMembershipDues * Math.pow(1 + maintenanceIncreaseRate, y - 1);
    }
    
    // Compound and add exchange dues if enabled
    if (hasExchangeDues && exchangeAnnualAmount > 0) {
      otherFeesPaidThisYear += exchangeAnnualAmount * Math.pow(1 + maintenanceIncreaseRate, y - 1);
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

export function combineCalculationResults(
  resultsArray: CalculationResults[],
  contracts: TimeshareContract[]
): CalculationResults {
  if (resultsArray.length === 0) {
    return {
      yearsOwnedPast: 0,
      yearsProjectedFuture: 0,
      totalYears: 0,
      pastMortgageSpent: 0,
      pastMaintenanceSpent: 0,
      pastOtherSpent: 0,
      pastTotalSpent: 0,
      futureMortgageSpent: 0,
      futureMaintenanceSpent: 0,
      futureOtherSpent: 0,
      futureTotalSpent: 0,
      grandTotalCost: 0,
      grandTotalMaintenanceFees: 0,
      grandTotalMortgage: 0,
      grandTotalOther: 0,
      alternativeTotalVacationCostPast: 0,
      alternativeTotalVacationCostFuture: 0,
      alternativeGrandTotalVacationCost: 0,
      opportunityCostTotalValue: 0,
      netLossVsVacation: 0,
      netLossVsInvesting: 0,
      breakdown: []
    };
  }

  // Find overall calendar year boundaries
  const allBreakdowns = resultsArray.flatMap(r => r.breakdown);
  if (allBreakdowns.length === 0) {
    return resultsArray[0];
  }

  const calendarYears = allBreakdowns.map(b => b.calendarYear);
  const minYear = Math.min(...calendarYears);
  const maxYear = Math.max(...calendarYears);
  
  const currentCalendarYear = new Date().getFullYear();
  const breakdown: YearBreakdown[] = [];
  
  let cumulativeTotal = 0;
  let cumulativeMaintenanceFees = 0;
  let cumulativeMortgage = 0;
  let cumulativeOther = 0;
  let alternativeCumulativeVacation = 0;
  let opportunityCostInvestmentValue = 0;
  
  // Use the return rate from the first active contract or default to 8.0
  const globalReturnRate = Number(contracts[0]?.inputs.investmentReturnRate) || 8.0;
  const returnRateDec = globalReturnRate / 100;

  for (let calYear = minYear; calYear <= maxYear; calYear++) {
    const isFuture = calYear > currentCalendarYear;
    const yearIndex = calYear - minYear + 1;
    const label = isFuture 
      ? `Future Yr ${calYear - currentCalendarYear}` 
      : `Past Yr ${yearIndex}`;
      
    let mortgagePaidThisYear = 0;
    let maintenanceFeePaidThisYear = 0;
    let otherFeesPaidThisYear = 0;
    let specialAssessmentsThisYear = 0;
    let alternativeVacationPaidThisYear = 0;
    let initialOutlayThisYear = 0;

    contracts.forEach((contract, idx) => {
      const contractResults = resultsArray[idx];
      const match = contractResults?.breakdown.find(b => b.calendarYear === calYear);
      if (match) {
        mortgagePaidThisYear += match.mortgagePaidThisYear;
        maintenanceFeePaidThisYear += match.maintenanceFeePaidThisYear;
        otherFeesPaidThisYear += match.otherFeesPaidThisYear;
        specialAssessmentsThisYear += match.specialAssessmentsThisYear;
        
        // Find alternative vacation paid in this calendar year
        const cPrev = contractResults.breakdown.find(b => b.calendarYear === calYear - 1);
        const altPaid = cPrev 
          ? match.alternativeCumulativeVacation - cPrev.alternativeCumulativeVacation 
          : match.alternativeCumulativeVacation;
        alternativeVacationPaidThisYear += altPaid;
        
        // Check if this is the start year of this contract (for initial outlay compounding)
        const contractStartYear = contractResults.breakdown[0]?.calendarYear;
        if (contractStartYear === calYear) {
          const isFinanced = contract.inputs.isFinanced;
          const purchasePrice = Number(contract.inputs.purchasePrice) || 0;
          const downPayment = Number(contract.inputs.downPayment) || 0;
          initialOutlayThisYear += isFinanced ? downPayment : purchasePrice;
        }
      }
    });
    
    const yearlyTotal = mortgagePaidThisYear + maintenanceFeePaidThisYear + otherFeesPaidThisYear + specialAssessmentsThisYear;
    
    cumulativeTotal += yearlyTotal;
    cumulativeMaintenanceFees += maintenanceFeePaidThisYear;
    cumulativeMortgage += mortgagePaidThisYear;
    cumulativeOther += otherFeesPaidThisYear + specialAssessmentsThisYear;
    alternativeCumulativeVacation += alternativeVacationPaidThisYear;
    
    if (calYear === minYear) {
      const yearlyOperationalCost = yearlyTotal - initialOutlayThisYear;
      opportunityCostInvestmentValue = initialOutlayThisYear * (1 + returnRateDec) + yearlyOperationalCost;
    } else {
      opportunityCostInvestmentValue = (opportunityCostInvestmentValue + yearlyTotal) * (1 + returnRateDec);
    }
    
    breakdown.push({
      year: yearIndex,
      calendarYear: calYear,
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
    const prevItem = breakdown.find(b => b.calendarYear === item.calendarYear - 1);
    const altPaidThisYear = prevItem 
      ? item.alternativeCumulativeVacation - prevItem.alternativeCumulativeVacation 
      : item.alternativeCumulativeVacation;

    if (!item.isFuture) {
      pastMortgageSpent += item.mortgagePaidThisYear;
      pastMaintenanceSpent += item.maintenanceFeePaidThisYear;
      pastOtherSpent += item.otherFeesPaidThisYear + item.specialAssessmentsThisYear;
      pastTotalSpent += item.yearlyTotal;
      alternativeTotalVacationCostPast += altPaidThisYear;
    } else {
      futureMortgageSpent += item.mortgagePaidThisYear;
      futureMaintenanceSpent += item.maintenanceFeePaidThisYear;
      futureOtherSpent += item.otherFeesPaidThisYear + item.specialAssessmentsThisYear;
      futureTotalSpent += item.yearlyTotal;
      alternativeTotalVacationCostFuture += altPaidThisYear;
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

  const totalYears = maxYear - minYear + 1;
  const yearsOwnedPast = currentCalendarYear - minYear + 1;
  const yearsProjectedFuture = maxYear - currentCalendarYear;

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

export function getCombinedInputs(contracts: TimeshareContract[]): CalculatorInputs {
  const defaultInputs = {
    resortId: "multiple",
    customAnnualIncrease: 0,
    purchasePrice: "" as any,
    contractCount: "" as any,
    isFinanced: false,
    isMortgagePaidOff: false,
    downPayment: "" as any,
    monthlyPayment: "" as any,
    loanTermYears: "" as any,
    initialMaintenanceFee: "" as any,
    specialAssessmentsCount: "" as any,
    specialAssessmentAmount: "" as any,
    annualMembershipDues: "" as any,
    hasExchangeDues: false,
    exchangeProvider: null,
    exchangeAnnualAmount: "" as any,
    customExchangeDues: [],
    hasSpecialAssessments: false,
    customSpecialAssessments: [],
    hasPaidExitFees: false,
    customExitFees: [],
    yearsOwnedPast: "" as any,
    yearsProjectedFuture: "" as any,
    alternativeVacationCost: "" as any,
    investmentReturnRate: "" as any,
  };

  if (contracts.length === 0) {
    return defaultInputs;
  }
  
  const sumVal = (arr: any[], key: string) => 
    arr.reduce((sum, item) => sum + (Number(item.inputs[key]) || 0), 0);
  
  const maxVal = (arr: any[], key: string) => 
    Math.max(...arr.map(item => Number(item.inputs[key]) || 0));

  const hasTrue = (arr: any[], key: string) =>
    arr.some(item => !!item.inputs[key]);

  const allTrue = (arr: any[], key: string) =>
    arr.every(item => !!item.inputs[key]);

  const avgVal = (arr: any[], key: string) => {
    if (arr.length === 0) return 0;
    return sumVal(arr, key) / arr.length;
  };

  return {
    resortId: "multiple",
    customAnnualIncrease: avgVal(contracts, "customAnnualIncrease"),
    purchasePrice: sumVal(contracts, "purchasePrice"),
    contractCount: sumVal(contracts, "contractCount") || contracts.length,
    isFinanced: hasTrue(contracts, "isFinanced"),
    isMortgagePaidOff: allTrue(contracts, "isMortgagePaidOff"),
    downPayment: sumVal(contracts, "downPayment"),
    monthlyPayment: sumVal(contracts, "monthlyPayment"),
    loanTermYears: maxVal(contracts, "loanTermYears"),
    initialMaintenanceFee: sumVal(contracts, "initialMaintenanceFee"),
    specialAssessmentsCount: sumVal(contracts, "specialAssessmentsCount"),
    specialAssessmentAmount: avgVal(contracts, "specialAssessmentAmount"),
    annualMembershipDues: sumVal(contracts, "annualMembershipDues"),
    hasExchangeDues: hasTrue(contracts, "hasExchangeDues"),
    exchangeProvider: "custom",
    exchangeAnnualAmount: sumVal(contracts, "exchangeAnnualAmount"),
    customExchangeDues: contracts.flatMap(c => c.inputs.customExchangeDues || []),
    hasSpecialAssessments: hasTrue(contracts, "hasSpecialAssessments"),
    customSpecialAssessments: contracts.flatMap(c => c.inputs.customSpecialAssessments || []),
    hasPaidExitFees: hasTrue(contracts, "hasPaidExitFees"),
    customExitFees: contracts.flatMap(c => c.inputs.customExitFees || []),
    yearsOwnedPast: maxVal(contracts, "yearsOwnedPast"),
    yearsProjectedFuture: maxVal(contracts, "yearsProjectedFuture"),
    alternativeVacationCost: sumVal(contracts, "alternativeVacationCost"),
    investmentReturnRate: avgVal(contracts, "investmentReturnRate") || 8.0,
  };
}
