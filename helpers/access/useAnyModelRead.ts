import {useMemo} from "react";
import {
    type AccessContextValue,
    type AccessDebugOverrides,
    mergeAccessOverride,
    useAccessDebugOverrides,
    useAccessMap,
} from "@coreModule/helpers/context/accessContext.tsx";
import {hasModelRead} from "@propertyManagementModule/helpers/access/aggregationAccess.ts";

/** True when the caller may read at least one of `models` (own scope, debug overrides applied, as `useAccess`). */
export function anyModelRead(
    accessMap: AccessContextValue,
    models: readonly string[],
    overrides?: AccessDebugOverrides,
): boolean {
    return models.some((model) => {
        const key = model.toLowerCase();
        const own = accessMap[key]?.self;
        return !!own && hasModelRead(mergeAccessOverride(own, overrides?.[key]?.self).read);
    });
}

/**
 * {@link anyModelRead} as a hook, for model lists that come from contributions: their length may change with the
 * company's modules, so they cannot be one `useAccess` call per model. Callers wait for `useAccessHydrated()` first.
 */
export function useAnyModelRead(models: readonly string[]): boolean {
    const accessMap = useAccessMap();
    const overrides = useAccessDebugOverrides()?.overrides;
    return useMemo(() => anyModelRead(accessMap, models, overrides), [accessMap, models, overrides]);
}
