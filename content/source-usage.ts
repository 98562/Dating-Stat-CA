export const sourceUsageById: Record<
  string,
  {
    usage: string;
    filtersPowered: string[];
    limitations: string;
  }
> = {
  "population-estimates-2026-q1": {
    usage: "Sets the live denominator for Canada and provincial starting populations.",
    filtersPowered: ["Geography", "Base population"],
    limitations: "A current population total, not a full cross-tab by every demographic trait."
  },
  "9810012901": {
    usage: "Powers age, sex category, and legal relationship-status proxy steps.",
    filtersPowered: ["Age", "Sex / gender category", "Relationship availability proxy"],
    limitations: "Legal and household status are not the same thing as actively dating."
  },
  "9810038401": {
    usage: "Provides education shares by geography, age group, and sex category.",
    filtersPowered: ["Education"],
    limitations: "25% sample data and not jointly published with every downstream filter."
  },
  "9810006401": {
    usage: "Provides income band shares by geography, age group, and sex category.",
    filtersPowered: ["Income"],
    limitations: "Income is tied to the 2020 reference year and may require estimation against newer population totals."
  },
  "9810022201": {
    usage: "Provides official-language knowledge distributions by geography and age.",
    filtersPowered: ["Language"],
    limitations: "Not jointly published with sex, marital status, education, or income in this calculator."
  },
  "9810035101": {
    usage: "Provides official population-group counts by geography, age, and gender.",
    filtersPowered: ["Population group"],
    limitations: "Categories follow the official source variable and not every downstream filter is jointly published with them."
  },
  "cchs-alcohol-risk-2023": {
    usage: "Provides self-reported weekly alcohol-risk distributions by Canada, province, age group, and gender.",
    filtersPowered: ["Drinking habits"],
    limitations: "Survey-based rather than census-based, self-reported, adults 18+ only, and not published as a full province-by-age-by-gender cross-tab."
  },
  "chms-height-table-22": {
    usage: "Provides measured-height percentile anchors used to estimate surviving shares for acceptable height ranges.",
    filtersPowered: ["Height"],
    limitations: "Height is estimated from published percentiles rather than observed inside the main census cross-tab pipeline."
  },
  "manual-assumptions": {
    usage: "Tracks user-entered probability modifiers applied after the official data steps.",
    filtersPowered: ["Looks / attractiveness", "Manual assumptions"],
    limitations: "Not census-backed and intentionally treated as user assumptions rather than discovered facts."
  }
};
