import { ResortData } from "../types";

export const RESORT_LIST: ResortData[] = [
  {
    id: "hgv",
    name: "Hilton Grand Vacations (HGV)",
    minIncrease: 4,
    maxIncrease: 6,
    avgIncrease: 5.0,
    description: "Estimated Average Increase: 4%–6% annually. Solid growth rate, but susceptible to spikes in coastal markets."
  },
  {
    id: "mvc",
    name: "Marriott Vacations Worldwide (MVC)",
    minIncrease: 5,
    maxIncrease: 7,
    avgIncrease: 6.0,
    description: "Estimated Average Increase: 5%–7% annually. High-end property maintenance reflects premium increases over time."
  },
  {
    id: "wyndham",
    name: "Travel + Leisure Co. / Wyndham",
    minIncrease: 4,
    maxIncrease: 6,
    avgIncrease: 5.0,
    description: "Estimated Average Increase: 4%–6% annually. A massive regional footprint keeps increases steady near the median."
  },
  {
    id: "dvc",
    name: "Disney Vacation Club (DVC)",
    minIncrease: 3,
    maxIncrease: 5,
    avgIncrease: 4.0,
    description: "Estimated Average Increase: 3%–5% annually. Historically the most conservative yearly increases among major brands."
  },
  {
    id: "bluegreen",
    name: "Bluegreen Vacations",
    minIncrease: 5,
    maxIncrease: 8,
    avgIncrease: 6.5,
    description: "Estimated Average Increase: 5%–8% annually. Highest average trend amongst standard developers, with major coastal swings."
  },
  {
    id: "hyatt",
    name: "Hyatt Vacation Ownership",
    minIncrease: 4,
    maxIncrease: 6,
    avgIncrease: 5.0,
    description: "Estimated Average Increase: 4%–6% annually. Premium boutique properties with steady and predictable compounding fees."
  },
  {
    id: "industry",
    name: "Industry-Wide Average (All Brands)",
    minIncrease: 5,
    maxIncrease: 7,
    avgIncrease: 6.0,
    description: "Approximate Average Increase: 5%–7% annually. Shows ARDA's benchmark of about ~36% total increase over any 5-year span."
  },
  {
    id: "custom",
    name: "Custom Developer (Enter Own Rate)",
    minIncrease: 0,
    maxIncrease: 30,
    avgIncrease: 6.0,
    description: "Define a tailored annual increase rate. Use for individual properties with high insurance surcharges (coastal spots see 10%-17% spikes)."
  }
];
