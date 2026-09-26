import {useEffect, useRef} from "react";
import {compose} from "redux";
import {Building2, CalendarDays, Ruler} from "lucide-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {
    PUBLIC_BODY,
    PUBLIC_GRID_KPI,
    PUBLIC_HEADING,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {ClientPortalPortfolioFormResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/clientPortal/clientPortalPortfolio.form.response.type";
import {cn} from "@coreModule/components/lib/utils.ts";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/profile/portfolio/overview/index.tsx";

const CARD_CLASS = "rounded-[5px] border border-pronix-border bg-white p-5 md:p-6";

type PortfolioOverviewProps = WithLanguageType & WithAxiosType<ClientPortalPortfolioFormResponseType>;

function formatMoney(amount: number, symbol: string): string {
    const formatted = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
    return `${symbol}${formatted}`;
}

function formatArea(sqm: number, languageCode: string): string {
    return `${new Intl.NumberFormat(languageCode, {maximumFractionDigits: 1}).format(sqm)} m²`;
}

function phaseLabel(phase: string, resolveLanguageKey: (key: string) => string): string {
    const key = `phase_${phase}`;
    const label = resolveLanguageKey(key);
    return label === key ? phase.replaceAll("_", " ") : label;
}

function PortfolioOverviewInner({
    resolveLanguageKey,
    languageCode,
    data,
    onFilterChange,
    loading,
}: PortfolioOverviewProps) {
    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        onFilterChange({});
    }, []);

    const portfolio = data;

    const portfolioLabel =
        portfolio && portfolio.portfolioValue.length > 0
            ? portfolio.portfolioValue
                  .map((row) => formatMoney(row.amount, row.currencySymbol))
                  .join(" · ")
            : formatMoney(0, "€");

    const kpiItems = [
        {
            key: "value",
            icon: Building2,
            value: loading && !portfolio ? "—" : portfolioLabel,
            label: resolveLanguageKey("kpiPortfolioValue"),
            large: true,
        },
        {
            key: "area",
            icon: Ruler,
            value: loading && !portfolio ? "—" : formatArea(portfolio?.totalAreaSqm ?? 0, languageCode),
            label: resolveLanguageKey("kpiTotalArea"),
            large: false,
        },
        {
            key: "reservations",
            icon: CalendarDays,
            value: loading && !portfolio ? "—" : String(portfolio?.activeReservations ?? 0),
            label: resolveLanguageKey("kpiActiveReservations"),
            large: false,
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className={cn(PUBLIC_GRID_KPI, "gap-4 sm:grid-cols-2 lg:grid-cols-3")}>
                {kpiItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.key} className={CARD_CLASS}>
                            <div className="mb-4 flex size-10 items-center justify-center rounded-[5px] border border-pronix-border text-pronix-blue">
                                <Icon className="size-5" strokeWidth={1.6} />
                            </div>
                            <p
                                className={cn(
                                    "font-aeonik-medium leading-none text-pronix-ink",
                                    item.large ? "text-2xl md:text-3xl lg:text-4xl" : "text-3xl md:text-4xl",
                                )}
                            >
                                {item.value}
                            </p>
                            <p className={cn(PUBLIC_BODY, "mt-2")}>{item.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className={CARD_CLASS}>
                <h2 className={PUBLIC_HEADING}>{resolveLanguageKey("constructionTitle")}</h2>
                <div className="mt-6">
                    {loading && !portfolio ? (
                        <p className={PUBLIC_BODY}>—</p>
                    ) : portfolio && portfolio.constructionProgress.length > 0 ? (
                        <ul className="flex flex-col gap-5">
                            {portfolio.constructionProgress.map((row) => (
                                <li key={row._id} className="flex flex-col gap-2 border-b border-pronix-border pb-5 last:border-0 last:pb-0">
                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <p className="font-aeonik-medium text-lg text-pronix-ink md:text-xl">
                                            {row.projectName}
                                            {row.edificeName ? ` · ${row.edificeName}` : ""}
                                        </p>
                                        <p className="font-aeonik-medium text-pronix-blue">
                                            {row.progressPercent}%
                                        </p>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-[2px] bg-pronix-border">
                                        <div
                                            className="h-full rounded-[2px] bg-pronix-blue"
                                            style={{width: `${Math.min(100, Math.max(0, row.progressPercent))}%`}}
                                        />
                                    </div>
                                    <p className={PUBLIC_BODY}>
                                        {row.title}
                                        {" · "}
                                        {phaseLabel(row.phase, resolveLanguageKey)}
                                    </p>
                                    <p className="font-aeonik-light text-sm text-pronix-ink-muted">
                                        {new Date(row.updateDate).toLocaleDateString(languageCode)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={PUBLIC_BODY}>{resolveLanguageKey("constructionEmpty")}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<ClientPortalPortfolioFormResponseType>(
        {method: "post", url: "/api/realEstate/clientPortal/portfolio", data: {}},
        true,
    ),
    withDebug(true, true),
)(PortfolioOverviewInner);
