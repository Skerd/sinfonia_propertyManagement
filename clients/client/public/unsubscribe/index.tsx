import {useCallback, useEffect, useRef, useState} from "react";
import {useSearchParams} from "react-router-dom";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {useDynamicLanguage} from "@coreModule/helpers/hooks/useDynamicLanguage.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Switch} from "@coreModule/components/ui/switch.tsx";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/unsubscribe/index.tsx";
const API = "/api/realEstate/adCampaignUnsubscribe";

type Preferences = {
    email: string;
    allowPriceChange: boolean;
    allowOffers: boolean;
    allowNewProjects: boolean;
    unsubscribedAllAt?: string;
};

type UnsubscribeResponse = {
    companyName: string;
    campaignType?: "price_change" | "offer" | "new_project";
    preferences: Preferences;
};

const TOGGLES = [
    {field: "allowPriceChange", labelKey: "toggles.priceChange", descKey: "toggles.priceChangeDescription"},
    {field: "allowOffers", labelKey: "toggles.offers", descKey: "toggles.offersDescription"},
    {field: "allowNewProjects", labelKey: "toggles.newProjects", descKey: "toggles.newProjectsDescription"},
] as const;

/**
 * Marketing unsubscribe / preference page.
 *
 * Reached from a link in a campaign email, with no account and no session — the
 * token in the query string is the only credential, and the tenant comes from
 * it rather than from the page's origin.
 *
 * The opt-out is performed by a **POST fired on mount**, never by the page
 * load itself. Outlook SafeLinks, Proofpoint and similar scanners follow every
 * link in a message, so a mutating GET would unsubscribe people who never
 * clicked. Landing here and finding it already done is the one-click behaviour;
 * the toggles below let anyone who arrived by accident put it straight back.
 *
 * `?manage=1` skips the automatic opt-out and only reads the current state.
 */
function UnsubscribePage() {
    const [searchParams] = useSearchParams();
    const {resolveLanguageKey} = useDynamicLanguage(LANGUAGE_PATH);

    const token = searchParams.get("token") ?? "";
    const manageOnly = searchParams.get("manage") === "1";

    const [state, setState] = useState<UnsubscribeResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);

    // React 18 StrictMode mounts effects twice in development; without this the
    // opt-out would fire twice. It is idempotent, but the duplicate request is
    // noise in the logs and in the rate limiter.
    const ranRef = useRef(false);

    useEffect(() => {
        if (!token || ranRef.current) return;
        ranRef.current = true;

        (async () => {
            setBusy(true);
            try {
                const {data} = await apiClient.post<UnsubscribeResponse>(
                    manageOnly ? `${API}/preferences` : API,
                    {token},
                );
                setState(data);
            }
            catch {
                setError(resolveLanguageKey("errors.invalidToken"));
            }
            finally {
                setBusy(false);
            }
        })();
    }, [token, manageOnly, resolveLanguageKey]);

    const save = useCallback(
        async (patch: Record<string, boolean>) => {
            setBusy(true);
            setSaved(false);
            try {
                const {data} = await apiClient.patch<UnsubscribeResponse>(`${API}/preferences`, {token, ...patch});
                setState(data);
                setSaved(true);
            }
            catch {
                setError(resolveLanguageKey("errors.saveFailed"));
            }
            finally {
                setBusy(false);
            }
        },
        [token, resolveLanguageKey],
    );

    if (!token) {
        return <Shell title={resolveLanguageKey("errors.missingTokenTitle")} body={resolveLanguageKey("errors.missingToken")} />;
    }
    if (error) {
        return <Shell title={resolveLanguageKey("errors.title")} body={error} />;
    }
    if (!state) {
        return <Loader />;
    }

    const prefs = state.preferences;
    const allOff = !prefs.allowPriceChange && !prefs.allowOffers && !prefs.allowNewProjects;

    const headline = manageOnly
        ? resolveLanguageKey("manageTitle")
        : resolveLanguageKey("doneTitle");

    const intro = manageOnly
        ? resolveLanguageKey("manageIntro")
        : (state.campaignType
            ? resolveLanguageKey(`doneIntro.${state.campaignType}`)
            : resolveLanguageKey("doneIntro.all"));

    return (
        <div className="mx-auto w-full max-w-xl px-6 py-16">
            <h1 className="text-2xl font-semibold text-foreground">{headline}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {intro.replace("{companyName}", state.companyName)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{prefs.email}</p>

            <Separator className="my-8" />

            <h2 className="text-base font-medium text-foreground">{resolveLanguageKey("togglesTitle")}</h2>
            <div className="mt-4 flex flex-col gap-3">
                {TOGGLES.map(({field, labelKey, descKey}) => (
                    <div key={field} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-foreground">{resolveLanguageKey(labelKey)}</span>
                            <span className="text-xs text-muted-foreground">{resolveLanguageKey(descKey)}</span>
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

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                    variant="outline"
                    disabled={busy || allOff}
                    onClick={() => save({unsubscribeAll: true})}
                >
                    {resolveLanguageKey("unsubscribeAll")}
                </Button>
                {saved && <span className="text-xs text-muted-foreground">{resolveLanguageKey("saved")}</span>}
            </div>

            {allOff && (
                <p className="mt-6 text-xs text-muted-foreground">{resolveLanguageKey("allOffNote")}</p>
            )}

            <p className="mt-10 text-xs text-muted-foreground">{resolveLanguageKey("transactionalNote")}</p>
        </div>
    );
}

function Shell({title, body}: {title: string; body: string}) {
    return (
        <div className="mx-auto w-full max-w-xl px-6 py-16">
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
    );
}

export default UnsubscribePage;
