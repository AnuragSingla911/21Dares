import type { Dare, DareCategoryFilter, DareDifficulty } from "../types/dare";

export type DareFilterOptions = {
  category: DareCategoryFilter;
  difficulty: DareDifficulty;
  familyFriendly: boolean;
  usedDareIds: string[];
};

/**
 * Filter dares by category, difficulty, family-friendly flag, and used IDs.
 */
export function filterDares(
  dares: Dare[],
  options: DareFilterOptions,
): Dare[] {
  return dares.filter((dare) => {
    if (options.usedDareIds.includes(dare.id)) return false;
    if (options.familyFriendly && !dare.familyFriendly) return false;
    if (options.category !== "mixed" && dare.category !== options.category) {
      return false;
    }
    if (dare.difficulty !== options.difficulty) return false;
    return true;
  });
}

/**
 * Pick a random unused dare matching the filter.
 * Falls back by relaxing difficulty, then category, then family-friendly.
 */
export function pickRandomDare(
  dares: Dare[],
  options: DareFilterOptions,
): Dare | null {
  const primary = filterDares(dares, options);
  if (primary.length > 0) {
    return primary[Math.floor(Math.random() * primary.length)]!;
  }

  // Relax difficulty: any difficulty, same category
  const relaxDifficulty = filterDares(dares, {
    ...options,
    difficulty: options.difficulty,
  }).length === 0
    ? dares.filter((dare) => {
        if (options.usedDareIds.includes(dare.id)) return false;
        if (options.familyFriendly && !dare.familyFriendly) return false;
        if (options.category !== "mixed" && dare.category !== options.category) {
          return false;
        }
        return true;
      })
    : [];

  if (relaxDifficulty.length > 0) {
    return relaxDifficulty[
      Math.floor(Math.random() * relaxDifficulty.length)
    ]!;
  }

  // Relax category entirely
  const anyUnused = dares.filter((dare) => {
    if (options.usedDareIds.includes(dare.id)) return false;
    if (options.familyFriendly && !dare.familyFriendly) return false;
    return true;
  });

  if (anyUnused.length > 0) {
    return anyUnused[Math.floor(Math.random() * anyUnused.length)]!;
  }

  // Last resort: any unused dare ignoring family-friendly
  const leftover = dares.filter((d) => !options.usedDareIds.includes(d.id));
  if (leftover.length > 0) {
    return leftover[Math.floor(Math.random() * leftover.length)]!;
  }

  return null;
}

/**
 * Mark a dare as used for the match (immutable).
 */
export function markDareUsed(
  usedDareIds: string[],
  dareId: string,
): string[] {
  if (usedDareIds.includes(dareId)) return usedDareIds;
  return [...usedDareIds, dareId];
}
