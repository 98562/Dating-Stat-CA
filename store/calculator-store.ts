"use client";

import { create } from "zustand";

import { DEFAULT_FILTERS } from "@/lib/constants";
import type { CalculatorFilters } from "@/lib/types";

interface CalculatorState {
  filters: CalculatorFilters;
  initialize: (filters: CalculatorFilters) => void;
  setFilters: (filters: CalculatorFilters) => void;
  setField: <K extends keyof CalculatorFilters>(
    key: K,
    value: CalculatorFilters[K]
  ) => void;
  updateAge: (key: "min" | "max", value: number) => void;
  toggleAssumption: (id: string, enabled: boolean) => void;
  setAssumptionShare: (id: string, share: number) => void;
}

function clampAge(value: number, adultOnly: boolean) {
  const min = adultOnly ? 18 : 15;
  const max = 85;

  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  filters: DEFAULT_FILTERS,
  initialize: (filters) => set({ filters }),
  setFilters: (filters) => set({ filters }),
  setField: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value
      }
    })),
  updateAge: (key, value) =>
    set((state) => {
      const next = {
        ...state.filters.ageRange,
        [key]: clampAge(value, state.filters.adultOnly)
      };

      return {
        filters: {
          ...state.filters,
          ageRange: {
            min: Math.min(next.min, next.max),
            max: Math.max(next.min, next.max)
          }
        }
      };
    }),
  toggleAssumption: (id, enabled) =>
    set((state) => ({
      filters: {
        ...state.filters,
        manualAssumptions: state.filters.manualAssumptions.map((assumption) =>
          assumption.id === id ? { ...assumption, enabled } : assumption
        )
      }
    })),
  setAssumptionShare: (id, share) =>
    set((state) => ({
      filters: {
        ...state.filters,
        manualAssumptions: state.filters.manualAssumptions.map((assumption) =>
          assumption.id === id ? { ...assumption, share } : assumption
        )
      }
    }))
}));
