export interface LooksPresetDefinition {
  id: string;
  label: string;
  share: number;
}

export const LOOKS_FILTER_LABEL = "Attractiveness threshold";

export const LOOKS_PRESETS: LooksPresetDefinition[] = [
  { id: "broad", label: "Broad: top 50%", share: 0.5 },
  { id: "selective", label: "Selective: top 25%", share: 0.25 },
  { id: "very_selective", label: "Very selective: top 10%", share: 0.1 },
  { id: "extremely_selective", label: "Extremely selective: top 5%", share: 0.05 }
];

export const LOOKS_PRESET_MAP = Object.fromEntries(
  LOOKS_PRESETS.map((preset) => [preset.id, preset])
) as Record<string, LooksPresetDefinition>;
