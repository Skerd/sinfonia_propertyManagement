import {useCallback} from "react";
import useSelectedLanguage from "@coreModule/helpers/hooks/useSelectedLanguage.ts";
import {fillLanguageTemplate} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

/**
 * Loads a Dyeus locale JSON by source path and returns a `t(key)` helper.
 * Supports nested keys (`a.b.c`) and `{{var}}` template substitution.
 */
export function useDyeusT(componentFilePath: string) {
    const {currentLanguage} = useSelectedLanguage(
        componentFilePath.replaceAll("/", "_"),
        componentFilePath,
    );

    const resolve = useCallback(
        (key: string): unknown => {
            if (!currentLanguage || typeof currentLanguage !== "object") {
                return null;
            }
            const parts = key.split(".");
            let value: unknown = currentLanguage;
            for (const part of parts) {
                if (value == null || typeof value !== "object") return null;
                value = (value as Record<string, unknown>)[part];
            }
            return value ?? null;
        },
        [currentLanguage],
    );

    const t = useCallback(
        (key: string, vars?: Record<string, string | number>) => {
            const value = resolve(key);
            if (typeof value !== "string") return `---${key}---`;
            return vars ? fillLanguageTemplate(value, vars) : value;
        },
        [resolve],
    );

    const tList = useCallback(
        (key: string): string[] => {
            const value = resolve(key);
            if (!Array.isArray(value)) return [];
            return value.filter((item): item is string => typeof item === "string");
        },
        [resolve],
    );

    return {t, tList, resolve, currentLanguage};
}

export type DyeusTranslate = ReturnType<typeof useDyeusT>["t"];
