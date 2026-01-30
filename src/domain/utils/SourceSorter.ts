/**
 * Sorts D&D 5e sources in a specific priority order:
 * 1. PHB (Player's Handbook)
 * 2. XGE (Xanathar's Guide to Everything)
 * 3. TCE (Tasha's Cauldron of Everything)
 * 4. Other official sources (alphabetically)
 * 5. Homebrew sources (marked with *, alphabetically)
 */
export function sortSources(sources: string[]): string[] {
    const priority: Record<string, number> = {
        'PHB': 1,
        'XGE': 2,
        'TCE': 3,
    };

    return [...sources].sort((a, b) => {
        const aIsHomebrew = a.endsWith('*');
        const bIsHomebrew = b.endsWith('*');

        // Homebrew sources always go to the end
        if (aIsHomebrew && !bIsHomebrew) return 1;
        if (!aIsHomebrew && bIsHomebrew) return -1;

        // Remove * marker for comparison
        const aClean = a.replace('*', '');
        const bClean = b.replace('*', '');

        const aPriority = priority[aClean] ?? 100;
        const bPriority = priority[bClean] ?? 100;

        // Sort by priority first
        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }

        // If same priority (both non-priority or both homebrew), sort alphabetically
        return aClean.localeCompare(bClean);
    });
}
