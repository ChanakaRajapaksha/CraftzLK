/**
 * Shared vertical rhythm for home rails (Featured, Trending, New Arrivals, etc.).
 * Use FIRST for the first block inside `.homePatternBg` (poster strip): no top rule.
 */
export const HOME_RAIL_SECTION_FIRST =
  "relative w-full bg-transparent px-3 py-5 pt-7 sm:px-4 sm:py-6 sm:pt-8 md:px-6 md:py-6 md:pt-8 lg:px-8 lg:py-7 lg:pt-9";

/** Section shell: horizontal + bottom padding only (top spacing lives on divided inner). */
export const HOME_RAIL_SECTION =
  "relative w-full bg-transparent px-3 pb-5 pt-0 sm:px-4 sm:pb-6 sm:pt-0 md:px-6 md:pb-6 md:pt-0 lg:px-8 lg:pb-7 lg:pt-0";

/** Content column — same width as Trending Now, New Arrivals, etc. */
export const HOME_SECTION_INNER = "home-section-inner mx-auto w-full max-w-[1500px]";

/** Content column with top rule aligned to section content width (not full viewport). */
export const HOME_SECTION_INNER_DIVIDED =
  "home-section-inner home-section-inner--divided mx-auto w-full max-w-[1500px] pt-5 sm:pt-6 md:pt-6 lg:pt-7";
