import type { HeightRange } from "@/config/filters/height";

export type HeightDisplayUnit = "cm" | "imperial";

export function cmToFeetInches(cm: number) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);

  if (inches === 12) {
    return { feet: feet + 1, inches: 0 };
  }

  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number) {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function formatHeightValue(cm: number, unit: HeightDisplayUnit) {
  if (unit === "cm") {
    return `${cm} cm`;
  }

  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}'${inches}"`;
}

export function formatHeightRange(range: HeightRange, unit: HeightDisplayUnit) {
  const min = formatHeightValue(range.minCm, unit);

  if (range.maxCm === null) {
    return `${min}+`;
  }

  const max = formatHeightValue(range.maxCm, unit);
  return unit === "cm" ? `${range.minCm}-${range.maxCm} cm` : `${min}-${max}`;
}
