/**
 * Moved to @coreModule/components/custom/cards. These tokens now drive card
 * grids in every module, not just property management.
 *
 * Re-exported rather than renamed at ~60 call sites in one commit; prefer the
 * core path in new code.
 */
export * from "@coreModule/components/custom/cards/entityCard.constants.ts";
