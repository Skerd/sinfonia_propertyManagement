import {useState} from "react";
import {useSearchParams} from "react-router-dom";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {useDynamicLanguage} from "@coreModule/helpers/hooks/useDynamicLanguage.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Switch} from "@coreModule/components/ui/switch.tsx";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/unsubscribe/index.tsx";
const API = "/api/realEstate/adCampaignUnsubscribe";
const OPEN_REQUEST: HttpRequest = {method: "post", url: API};
const SAVE_REQUEST: HttpRequest = {method: "patch", url: `${API}/preferences`};

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

    // The opt-out (or, with ?manage=1, the read) is one POST once the page has its token.
    const opened = useHttpRequest<UnsubscribeResponse>(
        OPEN_REQUEST,
        {token},
        token ? 1 : 0,
        true,
        {},
        {url: manageOnly ? `${API}/preferences` : API},
    );
    const [savePatch, setSavePatch] = useState<Record<string, boolean>>({});
    const [saveCount, setSaveCount] = useState(0);
    const saving = useHttpRequest<UnsubscribeResponse>(SAVE_REQUEST, {token, ...savePatch}, saveCount);

    const state = saving.data ?? opened.data;
    const busy = opened.loading || saving.loading;
    const saved = saveCount > 0 && !saving.loading && !saving.error && saving.data != null;
    const error = opened.error
        ? resolveLanguageKey("errors.invalidToken")
        : saving.error ? resolveLanguageKey("errors.saveFailed") : null;

    const save = (patch: Record<string, boolean>) => {
        setSavePatch(patch);
        setSaveCount((count) => count + 1);
    };

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
