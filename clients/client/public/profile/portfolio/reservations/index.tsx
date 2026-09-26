import {useEffect, useRef} from "react";
import {Link} from "react-router-dom";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {
    PUBLIC_BODY,
    PUBLIC_HEADING,
    PUBLIC_SUBTITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {ClientPortalReservationsFormResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/clientPortal/clientPortalReservations.form.response.type";
import {cn} from "@coreModule/components/lib/utils.ts";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/profile/portfolio/reservations/index.tsx";

const CARD_CLASS = "rounded-[5px] border border-pronix-border bg-white p-5 md:p-6";

type ReservationsPageProps = WithLanguageType & WithAxiosType<ClientPortalReservationsFormResponseType>;

function formatMoney(amount: number, symbol: string): string {
    const formatted = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
    return `${symbol}${formatted}`;
}

function statusLabel(status: string, resolveLanguageKey: (key: string) => string): string {
    const key = `status_${status}`;
    const label = resolveLanguageKey(key);
    return label === key ? status : label;
}

function ReservationsPageInner({
    resolveLanguageKey,
    languageCode,
    data,
    onFilterChange,
    loading,
}: ReservationsPageProps) {
    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        onFilterChange({});
    }, []);

    const reservations = data?.reservations ?? [];

    if (loading && !data) {
        return <p className={PUBLIC_BODY}>—</p>;
    }

    if (reservations.length === 0) {
        return (
            <div className="flex flex-col items-start gap-4 py-6">
                <p className={PUBLIC_HEADING}>{resolveLanguageKey("emptyTitle")}</p>
                <p className={PUBLIC_SUBTITLE}>{resolveLanguageKey("emptyHint")}</p>
                <Link
                    to="/projects"
                    className="rounded-[5px] bg-pronix-blue px-8 py-3 font-aeonik-medium text-white transition hover:opacity-90 md:text-lg"
                >
                    {resolveLanguageKey("browseCta")}
                </Link>
            </div>
        );
    }

    return (
        <ul className="flex flex-col gap-3 md:gap-4">
            {reservations.map((reservation) => {
                const title = [reservation.projectName, reservation.edificeName, reservation.unitName]
                    .filter(Boolean)
                    .join(" · ") || reservation.name || resolveLanguageKey("untitled");

                return (
                    <li key={reservation._id} className={CARD_CLASS}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="font-aeonik-medium text-lg text-pronix-ink md:text-xl">{title}</p>
                                {reservation.name ? (
                                    <p className={cn(PUBLIC_BODY, "mt-1")}>{reservation.name}</p>
                                ) : null}
                            </div>
                            <span className="rounded-[2px] border border-pronix-border px-2.5 py-1 font-aeonik-medium text-sm text-pronix-blue capitalize">
                                {statusLabel(reservation.status, resolveLanguageKey)}
                            </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                            <p className={PUBLIC_BODY}>
                                {resolveLanguageKey("reservedOn")}{" "}
                                {new Date(reservation.reservationDate).toLocaleDateString(languageCode)}
                            </p>
                            <p className={PUBLIC_BODY}>
                                {resolveLanguageKey("expiresOn")}{" "}
                                {new Date(reservation.expirationDate).toLocaleDateString(languageCode)}
                            </p>
                            {reservation.depositAmount != null ? (
                                <p className="font-aeonik-medium text-pronix-blue">
                                    {resolveLanguageKey("deposit")}{" "}
                                    {formatMoney(
                                        reservation.depositAmount,
                                        reservation.currencySymbol ?? "€",
                                    )}
                                </p>
                            ) : null}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<ClientPortalReservationsFormResponseType>(
        {method: "post", url: "/api/realEstate/clientPortal/reservations", data: {}},
        true,
    ),
    withDebug(true, true),
)(ReservationsPageInner);
