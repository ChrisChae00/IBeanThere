/**
 * @deprecated Import from '@/shared/ui' instead.
 *
 * This is a re-export shim, not a component directory — 27 files still import from
 * here. It is NOT dead code, despite what earlier notes claimed: deleting it would
 * rewrite every one of those imports.
 *
 * It is retired the same way the legacy `--color-*` tokens are: call sites move to
 * '@/shared/ui' as their page is migrated in Phases 3-6, and this file is deleted in
 * Phase 6 once the last one is gone.
 */
export * from '@/shared/ui';
