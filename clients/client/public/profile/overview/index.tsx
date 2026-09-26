import {useEffect, useMemo, useRef} from "react";
import {Link} from "react-router-dom";
import {compose} from "redux";
import {Building2, CalendarDays, Heart, Bell} from "lucide-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import {
    PUBLIC_BODY,
    PUBLIC_CONTENT_FRAME,
    PUBLIC_GRID_KPI,
    PUBLIC_HEADING,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {usePublicAuth} from "@propertyManagementModule/clients/client/public/shared/publicAuthContext.tsx";
import {usePublicFavorites} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesContext.tsx";
import type {ClientPortalOverviewFormResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/clientPortal/clientPortalOverview.form.response.type";
import {cn} from "@coreModule/components/lib/utils.ts";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/profile/overview/index.tsx";

const CARD_CLASS = "rounded-[5px] border border-pronix-border bg-white p-5 md:p-6";

type OverviewPageProps = WithLanguageType & WithAxiosType<ClientPortalOverviewFormResponseType>;

function formatMoney(amount: number, symbol: string): string {
    const formatted = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
    return `${symbol}${formatted}`;
}

function relativeTime(iso: string, languageCode: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.round(diffMs / 60000);
    const rtf = new Intl.RelativeTimeFormat(languageCode, {numeric: "auto"});
    if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 48) return rtf.format(-hours, "hour");
    const days = Math.round(hours / 24);
    return rtf.format(-days, "day");
}

function OverviewPageInner({
    resolveLanguageKey,
    languageCode,
    data,
    onFilterChange,
    loading,
}: OverviewPageProps) {
    const {user} = usePublicAuth();
    const {favorites} = usePublicFavorites();
    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        onFilterChange({});
    }, []);

    const savedProperties = favorites.projects.length;
    const savedUnits = favorites.units.length;
    const savedEdifices = useMemo(() => {
        const names = new Set(
            favorites.units
                .map((unit) => unit.edificeName?.trim())
                .filter((name): name is string => Boolean(name)),
        );
        return names.size;
    }, [favorites.units]);

    const displayName = user.name || user.username || resolveLanguageKey("fallbackName");
    const overview = data;

    const kpiItems = [
        {
            key: "owned",
            icon: Building2,
            value: overview?.propertiesOwned ?? 0,
            label: resolveLanguageKey("kpiPropertiesOwned"),
        },
        {
            key: "reservations",
            icon: CalendarDays,
            value: overview?.activeReservations ?? 0,
            label: resolveLanguageKey("kpiActiveReservations"),
        },
        {
            key: "savedProperties",
            icon: Heart,
            value: savedProperties,
            label: resolveLanguageKey("kpiSavedProperties"),
        },
        {
            key: "savedEdifices",
            icon: Heart,
            value: savedEdifices,
            label: resolveLanguageKey("kpiSavedEdifices"),
        },
        {
            key: "savedUnits",
            icon: Heart,
            value: savedUnits,
            label: resolveLanguageKey("kpiSavedUnits"),
        },
        {
            key: "notifications",
            icon: Bell,
            value: overview?.unreadNotifications ?? 0,
            label: resolveLanguageKey("kpiNewNotifications"),
        },
    ];

    const portfolioLabel =
        overview && overview.portfolioValue.length > 0
            ? overview.portfolioValue
                  .map((row) => formatMoney(row.amount, row.currencySymbol))
                  .join(" · ")
            : formatMoney(0, "€");

    return (
        <PublicSection className="pt-2 pb-16 md:pt-4 md:pb-20">
            <div className={PUBLIC_CONTENT_FRAME}>
                <div className="flex flex-col gap-2 md:gap-3">
                    <h1 className={PUBLIC_TITLE}>
                        {resolveLanguageKey("welcomeBack").replace("{name}", displayName)}
                    </h1>
                    <p className={PUBLIC_SUBTITLE}>{resolveLanguageKey("welcomeSubtitle")}</p>
                </div>

                <div className={cn(PUBLIC_GRID_KPI, "mt-10 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6")}>
                    {kpiItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.key} className={CARD_CLASS}>
                                <div className="mb-4 flex size-10 items-center justify-center rounded-[5px] border border-pronix-border text-pronix-blue">
                                    <Icon className="size-5" strokeWidth={1.6} />
                                </div>
                                <p className="font-aeonik-medium text-3xl leading-none text-pronix-ink md:text-4xl">
                                    {loading && !overview ? "—" : item.value}
                                </p>
                                <p className={cn(PUBLIC_BODY, "mt-2")}>{item.label}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-6">
                    <div className={CARD_CLASS}>
                        <div className="flex items-center justify-between gap-4">
                            <h2 className={PUBLIC_HEADING}>{resolveLanguageKey("portfolioTitle")}</h2>
                            <Link
                                to="/profile/portfolio"
                                className="shrink-0 font-aeonik-medium text-base text-pronix-blue transition hover:opacity-80 md:text-lg"
                            >
                                {resolveLanguageKey("viewPortfolio")}
                            </Link>
                        </div>
                        <p className="mt-6 font-aeonik-medium text-4xl leading-none text-pronix-blue md:text-5xl lg:text-[56px]">
                            {loading && !overview ? "—" : portfolioLabel}
                        </p>
                        {(!overview || overview.propertiesOwned === 0) && !loading ? (
                            <p className={cn(PUBLIC_BODY, "mt-4")}>
                                {resolveLanguageKey("portfolioEmpty")}
                            </p>
                        ) : null}
                    </div>

                    <div className={CARD_CLASS}>
                        <h2 className={cn(PUBLIC_HEADING, "flex items-center gap-2")}>
                            {resolveLanguageKey("nextPaymentTitle")}
                        </h2>
                        <div className="mt-6">
                            {loading && !overview ? (
                                <p className={PUBLIC_BODY}>—</p>
                            ) : overview && overview.nextPayments.length > 0 ? (
                                <ul className="flex flex-col gap-4">
                                    {overview.nextPayments.map((payment, index) => (
                                        <li key={`${payment.kind}-${payment.dueDate}-${index}`} className="flex flex-col gap-1">
                                            <p className="font-aeonik-medium text-xl text-pronix-blue md:text-2xl">
                                                {formatMoney(payment.remaining, payment.currencySymbol)}
                                            </p>
                                            <p className={PUBLIC_BODY}>
                                                {payment.kind === "down_payment"
                                                    ? resolveLanguageKey("downPayment")
                                                    : resolveLanguageKey("installment").replace(
                                                          "{number}",
                                                          String(payment.installmentNumber ?? ""),
                                                      )}
                                                {payment.saleName ? ` · ${payment.saleName}` : ""}
                                            </p>
                                            <p className="font-aeonik-light text-sm text-pronix-ink-muted">
                                                {new Date(payment.dueDate).toLocaleDateString(languageCode)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={PUBLIC_BODY}>{resolveLanguageKey("nextPaymentEmpty")}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className={cn(CARD_CLASS, "mt-6")}>
                    <h2 className={PUBLIC_HEADING}>{resolveLanguageKey("notificationsTitle")}</h2>
                    <div className="mt-6">
                        {loading && !overview ? (
                            <p className={PUBLIC_BODY}>—</p>
                        ) : overview && overview.latestNotifications.length > 0 ? (
                            <ul className="flex flex-col gap-5">
                                {overview.latestNotifications.map((notification) => (
                                    <li key={notification._id} className="flex gap-3">
                                        <span
                                            className={cn(
                                                "mt-2 size-2 shrink-0 rounded-full",
                                                notification.readOn ? "bg-pronix-border" : "bg-pronix-blue",
                                            )}
                                            aria-hidden
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                <p className="font-aeonik-medium text-lg text-pronix-ink md:text-xl">
                                                    {notification.code}
                                                </p>
                                                <p className="font-aeonik-light text-sm text-pronix-ink-muted">
                                                    {relativeTime(notification.date, languageCode)}
                                                </p>
                                            </div>
                                            {notification.description ? (
                                                <p className={cn(PUBLIC_BODY, "mt-1")}>{notification.description}</p>
                                            ) : null}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={PUBLIC_BODY}>{resolveLanguageKey("notificationsEmpty")}</p>
                        )}
                    </div>
                </div>
            </div>
        </PublicSection>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<ClientPortalOverviewFormResponseType>(
        {method: "post", url: "/api/realEstate/clientPortal/overview", data: {}},
        true,
    ),
    withDebug(true, true),
)(OverviewPageInner);
