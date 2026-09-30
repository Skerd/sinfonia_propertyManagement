import {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {useDynamicLanguage} from "@coreModule/helpers/hooks/useDynamicLanguage.ts";
import {Switch} from "@coreModule/components/ui/switch.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/panel/private/accountSettings/marketingPreferences.tsx";
const API = "/api/realEstate/marketingPreference";

type Preferences = {
    email: string;
    allowPriceChange: boolean;
    allowOffers: boolean;
    allowNewProjects: boolean;
    unsubscribedAllAt?: string;
};

const TOGGLES = [
    {field: "allowPriceChange", labelKey: "toggles.priceChange", descKey: "toggles.priceChangeDescription"},
    {field: "allowOffers", labelKey: "toggles.offers", descKey: "toggles.offersDescription"},
    {field: "allowNewProjects", labelKey: "toggles.newProjects", descKey: "toggles.newProjectsDescription"},
] as const;

/**
 * The real-estate marketing preferences section of the account-settings
 * Notifications tab.
 *
 * Contributed into a core page through `accountSettingsContribution`, so core
 * stays unaware of propertyManagement. Backed by `/marketingPreference/me`.
 * `specificUserId` is sent as the `specificUser` header, the same way name and
 * timezone updates impersonate. A missing row comes back as all-true defaults.
 */
export default function MarketingPreferencesSection({specificUserId}: {specificUserId?: string}) {
    const {resolveLanguageKey} = useDynamicLanguage(LANGUAGE_PATH);

    const [prefs, setPrefs] = useState<Preferences | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const requestConfig = specificUserId ? {headers: {specificUser: specificUserId}} : undefined;
        (async () => {
            try {
                const {data} = await apiClient.post<Preferences>(`${API}/me`, {}, requestConfig);
                setPrefs(data);
            }
            catch {
                setError(resolveLanguageKey("loadFailed"));
            }
        })();
    }, [resolveLanguageKey, specificUserId]);

    const save = useCallback(async (patch: Record<string, boolean>) => {
        const requestConfig = specificUserId ? {headers: {specificUser: specificUserId}} : undefined;
        setBusy(true);
        // Optimistic: a switch that visibly lags feels broken. Rolled back below
        // if the write fails.
        setPrefs(prev => (prev ? {...prev, ...patch} : prev));
        try {
            const {data} = await apiClient.post<Preferences>(`${API}/updateMe`, patch, requestConfig);
            setPrefs(data);
            toast.success(resolveLanguageKey("saved"));
        }
        catch {
            const {data} = await apiClient.post<Preferences>(`${API}/me`, {}, requestConfig).catch(() => ({data: null}));
            if (data) setPrefs(data);
            toast.error(resolveLanguageKey("saveFailed"));
        }
        finally {
            setBusy(false);
        }
    }, [resolveLanguageKey, specificUserId]);

    if (error) {
        return <p className="text-sm text-muted-foreground">{error}</p>;
    }
    if (!prefs) {
        return <p className="text-sm text-muted-foreground">{resolveLanguageKey("loading")}</p>;
    }

    const allOff = !prefs.allowPriceChange && !prefs.allowOffers && !prefs.allowNewProjects;

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h3 className="text-base font-medium">{resolveLanguageKey("title")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{resolveLanguageKey("description")}</p>
            </div>

            <div className="flex flex-col gap-3">
                {TOGGLES.map(({field, labelKey, descKey}) => (
                    <div key={field} className="flex flex-row items-center justify-between gap-4 rounded-lg border p-4">
                        <div className="flex flex-col gap-y-0.5">
                            <span className="text-base font-medium">{resolveLanguageKey(labelKey)}</span>
                            <span className="text-sm text-muted-foreground">{resolveLanguageKey(descKey)}</span>
                        </div>
                        <Switch
                            checked={prefs[field]}
                            disabled={busy}
                            onCheckedChange={(checked) => save({[field]: checked})}
                            aria-label={resolveLanguageKey(labelKey)}
                        />
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={busy || allOff}
                    onClick={() => save({unsubscribeAll: true})}
                >
                    {resolveLanguageKey("unsubscribeAll")}
                </Button>
            </div>

            <p className="text-xs text-muted-foreground">{resolveLanguageKey("transactionalNote")}</p>
        </div>
    );
}
