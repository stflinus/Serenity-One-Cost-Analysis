export interface ResortData {
  id: string;
  name: string;
  minIncrease: number;
  maxIncrease: number;
  avgIncrease: number;
  description: string;
}

export interface CustomFeeEntry {
  id: string;
  year: number; // 1-indexed year of ownership
  amount: number;
}

export interface CalculatorInputs {
  resortId: string;
  customAnnualIncrease: number;
  purchasePrice: number;
  
  // Mortgage Info
  isFinanced: boolean;
  isMortgagePaidOff: boolean; // if financed, is it fully paid off now?
  downPayment: number;
  monthlyPayment: number;
  loanTermYears: number; // e.g. 5, 7, 10
  
  // Maintenance Fees
  initialMaintenanceFee: number;
  specialAssessmentsCount: number; // number of special assessments experienced/expected
  specialAssessmentAmount: number; // average cost per special assessment
  
  // Membership / Other fees
  annualMembershipDues: number; // exchange company fees, e.g. RCI, Interval International ($150)
  
  // Advanced Interactive Dynamic Costs
  hasExchangeDues: boolean;
  exchangeProvider: 'rci' | 'ii' | 'custom' | null;
  exchangeAnnualAmount: number;
  customExchangeDues: CustomFeeEntry[];
  hasSpecialAssessments: boolean;
  customSpecialAssessments: CustomFeeEntry[];
  hasPaidExitFees: boolean;
  customExitFees: CustomFeeEntry[];
  
  // Timeframe
  yearsOwnedPast: number;  // How many years owned up to now
  yearsProjectedFuture: number; // How many years to project into the future
  
  // Comparison
  alternativeVacationCost: number; // how much would they spend annually on standard hotel vacations
  investmentReturnRate: number; // what if they invested the initial down payment + maintenance fees (e.g. 8% S&P return)
}

export interface YearBreakdown {
  year: number; // 1, 2, ...
  calendarYear: number; // currentYear - yearsOwnedPast + year
  label: string; // "Past Yr X" or "Future Yr Y"
  isFuture: boolean;
  
  // Costs
  mortgagePaidThisYear: number;
  maintenanceFeePaidThisYear: number;
  otherFeesPaidThisYear: number;
  specialAssessmentsThisYear: number;
  
  // Running Totals
  yearlyTotal: number;
  cumulativeTotal: number;
  cumulativeMaintenanceFees: number;
  cumulativeMortgage: number;
  cumulativeOther: number;
  
  // Comparative Values
  alternativeCumulativeVacation: number;
  opportunityCostInvestmentValue: number; // compound value if invested instead
}

export interface CalculationResults {
  yearsOwnedPast: number;
  yearsProjectedFuture: number;
  totalYears: number;
  
  // Spent Past
  pastMortgageSpent: number;
  pastMaintenanceSpent: number;
  pastOtherSpent: number;
  pastTotalSpent: number;
  
  // Expected Future
  futureMortgageSpent: number;
  futureMaintenanceSpent: number;
  futureOtherSpent: number;
  futureTotalSpent: number;
  
  // GRAND TOTALS
  grandTotalCost: number;
  grandTotalMaintenanceFees: number;
  grandTotalMortgage: number;
  grandTotalOther: number;
  
  // Comparisons
  alternativeTotalVacationCostPast: number;
  alternativeTotalVacationCostFuture: number;
  alternativeGrandTotalVacationCost: number;
  
  opportunityCostTotalValue: number; // what they could have had if invested
  netLossVsVacation: number; // grandTotalCost - alternativeGrandTotalVacationCost
  netLossVsInvesting: number; // opportunityCostTotalValue - alternativeGrandTotalVacationCost (or cumulative index fund asset)
  
  breakdown: YearBreakdown[];
}
