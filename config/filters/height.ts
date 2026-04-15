export interface HeightRange {
  minCm: number;
  maxCm: number | null;
}

export interface HeightPreset {
  id: string;
  label: string;
  range: HeightRange;
}

export interface HeightPercentileModel {
  ageBand: string;
  min: number;
  max: number | null;
  percentiles: Array<{ percentile: number; valueCm: number }>;
}

export const HEIGHT_FILTER_LABEL = "Height";

export const HEIGHT_PRESETS: HeightPreset[] = [
  { id: "160_to_167", label: "160-167 cm", range: { minCm: 160, maxCm: 167 } },
  { id: "168_to_175", label: "168-175 cm", range: { minCm: 168, maxCm: 175 } },
  { id: "176_to_182", label: "176-182 cm", range: { minCm: 176, maxCm: 182 } },
  { id: "178_plus", label: "178 cm+", range: { minCm: 178, maxCm: null } },
  { id: "183_plus", label: "183 cm+", range: { minCm: 183, maxCm: null } },
  { id: "190_plus", label: "190 cm+", range: { minCm: 190, maxCm: null } },
  { id: "170_plus", label: "170 cm+", range: { minCm: 170, maxCm: null } }
];

export const HEIGHT_PRESET_MAP = Object.fromEntries(
  HEIGHT_PRESETS.map((preset) => [preset.id, preset])
) as Record<string, HeightPreset>;

const bothSexes = [
  {
    ageBand: "15 to 19 years",
    min: 15,
    max: 19,
    percentiles: [
      { percentile: 5, valueCm: 147.82 },
      { percentile: 10, valueCm: 152.46 },
      { percentile: 25, valueCm: 159.15 },
      { percentile: 50, valueCm: 165.68 },
      { percentile: 75, valueCm: 174.52 },
      { percentile: 90, valueCm: 180.19 },
      { percentile: 95, valueCm: 183.09 }
    ]
  },
  {
    ageBand: "20 to 39 years",
    min: 20,
    max: 39,
    percentiles: [
      { percentile: 5, valueCm: 155.09 },
      { percentile: 10, valueCm: 157.91 },
      { percentile: 25, valueCm: 162.43 },
      { percentile: 50, valueCm: 170.33 },
      { percentile: 75, valueCm: 178.79 },
      { percentile: 90, valueCm: 182.82 },
      { percentile: 95, valueCm: 185.5 }
    ]
  },
  {
    ageBand: "40 to 59 years",
    min: 40,
    max: 59,
    percentiles: [
      { percentile: 5, valueCm: 154.1 },
      { percentile: 10, valueCm: 156.44 },
      { percentile: 25, valueCm: 161.55 },
      { percentile: 50, valueCm: 168.24 },
      { percentile: 75, valueCm: 174.87 },
      { percentile: 90, valueCm: 180.71 },
      { percentile: 95, valueCm: 183.51 }
    ]
  },
  {
    ageBand: "60 to 79 years",
    min: 60,
    max: 79,
    percentiles: [
      { percentile: 5, valueCm: 150.57 },
      { percentile: 10, valueCm: 152.9 },
      { percentile: 25, valueCm: 158.87 },
      { percentile: 50, valueCm: 164.79 },
      { percentile: 75, valueCm: 172.84 },
      { percentile: 90, valueCm: 178.18 },
      { percentile: 95, valueCm: 180.87 }
    ]
  },
  {
    ageBand: "80 years and over",
    min: 80,
    max: null,
    percentiles: [
      { percentile: 5, valueCm: 150.57 },
      { percentile: 10, valueCm: 152.9 },
      { percentile: 25, valueCm: 158.87 },
      { percentile: 50, valueCm: 164.79 },
      { percentile: 75, valueCm: 172.84 },
      { percentile: 90, valueCm: 178.18 },
      { percentile: 95, valueCm: 180.87 }
    ]
  }
] satisfies HeightPercentileModel[];

const men = [
  {
    ageBand: "15 to 19 years",
    min: 15,
    max: 19,
    percentiles: [
      { percentile: 5, valueCm: 145.81 },
      { percentile: 10, valueCm: 152.91 },
      { percentile: 25, valueCm: 164.79 },
      { percentile: 50, valueCm: 173.46 },
      { percentile: 75, valueCm: 178.14 },
      { percentile: 90, valueCm: 182.96 },
      { percentile: 95, valueCm: 186.03 }
    ]
  },
  {
    ageBand: "20 to 39 years",
    min: 20,
    max: 39,
    percentiles: [
      { percentile: 5, valueCm: 165.76 },
      { percentile: 10, valueCm: 168.0 },
      { percentile: 25, valueCm: 173.67 },
      { percentile: 50, valueCm: 178.74 },
      { percentile: 75, valueCm: 181.89 },
      { percentile: 90, valueCm: 185.49 },
      { percentile: 95, valueCm: 187.69 }
    ]
  },
  {
    ageBand: "40 to 59 years",
    min: 40,
    max: 59,
    percentiles: [
      { percentile: 5, valueCm: 163.83 },
      { percentile: 10, valueCm: 166.15 },
      { percentile: 25, valueCm: 169.59 },
      { percentile: 50, valueCm: 174.29 },
      { percentile: 75, valueCm: 179.53 },
      { percentile: 90, valueCm: 183.5 },
      { percentile: 95, valueCm: 185.11 }
    ]
  },
  {
    ageBand: "60 to 79 years",
    min: 60,
    max: 79,
    percentiles: [
      { percentile: 5, valueCm: 162.02 },
      { percentile: 10, valueCm: 163.38 },
      { percentile: 25, valueCm: 167.72 },
      { percentile: 50, valueCm: 172.88 },
      { percentile: 75, valueCm: 177.12 },
      { percentile: 90, valueCm: 180.96 },
      { percentile: 95, valueCm: 183.11 }
    ]
  },
  {
    ageBand: "80 years and over",
    min: 80,
    max: null,
    percentiles: [
      { percentile: 5, valueCm: 162.02 },
      { percentile: 10, valueCm: 163.38 },
      { percentile: 25, valueCm: 167.72 },
      { percentile: 50, valueCm: 172.88 },
      { percentile: 75, valueCm: 177.12 },
      { percentile: 90, valueCm: 180.96 },
      { percentile: 95, valueCm: 183.11 }
    ]
  }
] satisfies HeightPercentileModel[];

const women = [
  {
    ageBand: "15 to 19 years",
    min: 15,
    max: 19,
    percentiles: [
      { percentile: 5, valueCm: 150.12 },
      { percentile: 10, valueCm: 152.38 },
      { percentile: 25, valueCm: 157.06 },
      { percentile: 50, valueCm: 162.09 },
      { percentile: 75, valueCm: 165.79 },
      { percentile: 90, valueCm: 171.03 },
      { percentile: 95, valueCm: 173.6 }
    ]
  },
  {
    ageBand: "20 to 39 years",
    min: 20,
    max: 39,
    percentiles: [
      { percentile: 5, valueCm: 153.26 },
      { percentile: 10, valueCm: 155.13 },
      { percentile: 25, valueCm: 158.7 },
      { percentile: 50, valueCm: 162.86 },
      { percentile: 75, valueCm: 167.94 },
      { percentile: 90, valueCm: 171.2 },
      { percentile: 95, valueCm: 173.23 }
    ]
  },
  {
    ageBand: "40 to 59 years",
    min: 40,
    max: 59,
    percentiles: [
      { percentile: 5, valueCm: 150.95 },
      { percentile: 10, valueCm: 154.04 },
      { percentile: 25, valueCm: 157.37 },
      { percentile: 50, valueCm: 161.79 },
      { percentile: 75, valueCm: 166.36 },
      { percentile: 90, valueCm: 170.25 },
      { percentile: 95, valueCm: 173.53 }
    ]
  },
  {
    ageBand: "60 to 79 years",
    min: 60,
    max: 79,
    percentiles: [
      { percentile: 5, valueCm: 147.82 },
      { percentile: 10, valueCm: 150.59 },
      { percentile: 25, valueCm: 154.02 },
      { percentile: 50, valueCm: 159.06 },
      { percentile: 75, valueCm: 162.57 },
      { percentile: 90, valueCm: 166.91 },
      { percentile: 95, valueCm: 168.98 }
    ]
  },
  {
    ageBand: "80 years and over",
    min: 80,
    max: null,
    percentiles: [
      { percentile: 5, valueCm: 147.82 },
      { percentile: 10, valueCm: 150.59 },
      { percentile: 25, valueCm: 154.02 },
      { percentile: 50, valueCm: 159.06 },
      { percentile: 75, valueCm: 162.57 },
      { percentile: 90, valueCm: 166.91 },
      { percentile: 95, valueCm: 168.98 }
    ]
  }
] satisfies HeightPercentileModel[];

export const HEIGHT_PERCENTILE_MODELS = {
  all: bothSexes,
  men,
  women
} as const;
