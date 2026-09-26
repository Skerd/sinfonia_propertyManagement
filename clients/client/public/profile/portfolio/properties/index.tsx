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
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import type {ClientPortalPropertiesFormResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/clientPortal/clientPortalProperties.form.response.type";
import {cn} from "@coreModule/components/lib/utils.ts";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/profile/portfolio/properties/index.tsx";

const rowClassName =
    "group relative flex min-w-0 items-stretch overflow-hidden rounded-[5px] border border-pronix-border bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(24,24,24,0.35)] hover:shadow-lg";

type PropertiesPageProps = WithLanguageType & WithAxiosType<ClientPortalPropertiesFormResponseType>;

function formatMoney(amount: number, symbol: string): string {
    const formatted = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
    return `${symbol}${formatted}`;
}

function PropertiesPageInner({
    resolveLanguageKey,
    languageCode,
    data,
    onFilterChange,
    loading,
}: PropertiesPageProps) {
    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        onFilterChange({});
    }, []);

    const properties = data?.properties ?? [];

    if (loading && !data) {
        return <p className={PUBLIC_BODY}>—</p>;
    }

    if (properties.length === 0) {
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
            {properties.map((property) => {
                const title = [property.projectName, property.edificeName, property.unitName]
                    .filter(Boolean)
                    .join(" · ");
                const to = property.projectId && property.unitId
                    ? `/property?projectId=${property.projectId}&unitId=${property.unitId}`
                    : "/projects";
                const imageSrc = resolveMarketingMediaUrl(property.imageUrl) ?? projectsAssets.cardPlaceholder;

                return (
                    <li key={property._id} className={rowClassName}>
                        <Link to={to} className="flex min-w-0 flex-1 items-center gap-4 p-3 md:gap-5 md:p-4">
                            <img
                                alt=""
                                className="size-20 shrink-0 rounded-[2px] object-cover md:size-24"
                                src={imageSrc}
                            />
                            <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5 md:gap-2">
                                <p className="font-aeonik-medium text-lg leading-[1.2] text-pronix-ink transition group-hover:text-pronix-blue md:text-xl lg:text-[22px]">
                                    {title}
                                </p>
                                {property.areaSqm != null ? (
                                    <p className="font-aeonik-light text-sm text-pronix-ink-muted md:text-base">
                                        {new Intl.NumberFormat(languageCode, {maximumFractionDigits: 1}).format(property.areaSqm)} m²
                                    </p>
                                ) : null}
                                <p className={cn(
                                    "mt-auto inline-flex w-fit rounded-[2px] border border-pronix-blue px-2.5 py-1.5 font-aeonik-medium text-sm text-pronix-blue md:text-base",
                                )}>
                                    {formatMoney(property.price, property.currencySymbol)}
                                </p>
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<ClientPortalPropertiesFormResponseType>(
        {method: "post", url: "/api/realEstate/clientPortal/properties", data: {}},
        true,
    ),
    withDebug(true, true),
)(PropertiesPageInner);
