import React, {useEffect, useRef} from "react";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {contactAssets} from "@propertyManagementModule/clients/client/public/contact/contactAssets.ts";
import MarketingContactForm from "@propertyManagementModule/clients/client/public/shared/sections/marketingContactForm.tsx";
import {
    MarketingCompanyAddress,
    MarketingCompanyResponse,
    PublicLanguageProps,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const CONTACT_INFO_LABEL =
    "font-aeonik-light text-[20px] leading-none tracking-normal text-pronix-ink-muted not-italic md:text-base md:leading-[1.4]";

const CONTACT_INFO_VALUE =
    "cursor-default font-aeonik-medium text-[24px] leading-none tracking-normal text-pronix-ink not-italic md:text-2xl md:leading-[1.4] lg:text-[24px]";

function googleMapsUrl(address: MarketingCompanyAddress): string {
    if (address.latitude != null && address.longitude != null) {
        return `https://www.google.com/maps?q=${address.latitude},${address.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.label)}`;
}

type ContactLeadColumnProps = PublicLanguageProps &
    WithAxiosType<MarketingCompanyResponse> & {
        defaultInterest?: string;
        /** When false, hides the map/scene column (catalog embeds form-only). Default true. */
        showScene?: boolean;
        /** Heading level for the form title. Use h2 when nested under a section h2. */
        titleAs?: "h1" | "h2";
    };

function ContactLeadColumnInner({
    resolveLanguageKey,
    currentLanguage,
    languageCode,
    data,
    onFilterChange,
    defaultInterest,
    showScene = true,
    titleAs = "h1",
}: ContactLeadColumnProps) {
    const initialFetchDone = useRef(false);
    const addresses = data?.addresses ?? [];
    const TitleTag = titleAs;

    useEffect(() => {
        if (initialFetchDone.current) {
            return;
        }
        initialFetchDone.current = true;
        onFilterChange({});
        // Intentionally mount-only: onFilterChange identity changes every withAxios render.
    }, []);

    return (
        <div
            className={
                showScene
                    ? "relative grid w-full grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10"
                    : "relative w-full"
            }
            data-node-id="305:228"
        >
            <div className="min-w-0" data-node-id="320:583">
                <TitleTag className="max-w-lg cursor-default text-left font-aeonik-medium text-[40px] leading-[1.1] tracking-normal text-pronix-ink not-italic md:text-5xl md:leading-[1.2] lg:text-[56px]">
                    {resolveLanguageKey("title")}
                </TitleTag>
                <MarketingContactForm
                    resolveLanguageKey={resolveLanguageKey}
                    currentLanguage={currentLanguage}
                    languageCode={languageCode}
                    defaultInterest={defaultInterest}
                />
                <div className="mt-8 flex flex-col gap-6 text-left" data-node-id="320:586">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2" data-node-id="320:587">
                        <div data-node-id="320:588">
                            <p className={CONTACT_INFO_LABEL}>{resolveLanguageKey("phoneLabel")}</p>
                            <p className={`mt-2 ${CONTACT_INFO_VALUE}`}>{data?.phoneNumber ?? ""}</p>
                        </div>
                        <div data-node-id="320:591">
                            <p className={CONTACT_INFO_LABEL}>{resolveLanguageKey("emailLabel")}</p>
                            <p className={`mt-2 ${CONTACT_INFO_VALUE}`}>{data?.email ?? ""}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2" data-node-id="320:594">
                        <div data-node-id="320:595">
                            <p className={CONTACT_INFO_LABEL}>{resolveLanguageKey("addressLabel")}</p>
                            {addresses.length > 0 ? (
                                <ul className="mt-2 flex list-none flex-col gap-1.5 p-0">
                                    {addresses.map((address) => (
                                        <li key={`${address.label}-${address.latitude ?? ""}-${address.longitude ?? ""}`}>
                                            <a
                                                href={googleMapsUrl(address)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${CONTACT_INFO_VALUE} transition hover:opacity-70`}
                                            >
                                                {address.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={`mt-2 ${CONTACT_INFO_VALUE}`} />
                            )}
                        </div>
                        <div data-node-id="320:598">
                            <p className={CONTACT_INFO_LABEL}>{resolveLanguageKey("hoursLabel")}</p>
                            <p className={`mt-2 ${CONTACT_INFO_VALUE}`}>{resolveLanguageKey("hoursValue")}</p>
                        </div>
                    </div>
                </div>
            </div>
            {showScene ? (
                <div
                    className="relative min-h-[320px] overflow-hidden rounded-[5px] lg:min-h-[500px]"
                    data-node-id="320:602"
                >
                    <img alt="" aria-hidden className="size-full object-cover" src={contactAssets.scene} />
                    <div
                        className="absolute left-4 top-4 rounded-[5px] px-4 py-2 font-aeonik-light text-sm text-white backdrop-blur-md md:left-6 md:top-6 md:text-sm"
                        style={{background: "rgba(0,0,0,0.35)"}}
                    >
                        {resolveLanguageKey("openToday")}
                    </div>
                    <div
                        className="absolute bottom-4 left-4 flex w-40 min-h-40 flex-col rounded-[5px] backdrop-blur-[47px] md:bottom-6 md:left-6 md:w-[239px] md:min-h-[239px]"
                        style={{background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)"}}
                    >
                        <img
                            alt=""
                            aria-hidden
                            className="absolute left-4 top-4 size-10 md:left-5 md:top-5 md:size-[50px]"
                            src={figmaAssets.ctaEllipse}
                        />
                        <div className="mt-auto flex flex-col gap-1.5 px-4 pb-4 pt-16 md:px-5 md:pb-5 md:pt-20">
                            {addresses.length > 0 ? (
                                addresses.map((address) => (
                                    <a
                                        key={`map-${address.label}-${address.latitude ?? ""}-${address.longitude ?? ""}`}
                                        href={googleMapsUrl(address)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-aeonik-medium text-base text-white not-italic leading-[1.2] transition hover:opacity-70 md:text-lg"
                                    >
                                        {address.label}
                                    </a>
                                ))
                            ) : (
                                <p className="font-aeonik-medium text-base text-white not-italic md:text-lg leading-[1.2]">
                                    {resolveLanguageKey("findUs")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

/** Full contact lead column (title + form + company info). Loads contact translations itself. */
const ContactLeadColumn = compose(
    withAxios<MarketingCompanyResponse>(
        {method: "post", url: "/api/realEstate/marketingCompany", data: {}},
        true,
    ),
    withDebug(true, true),
    withLanguage("src/modules/propertyManagement/clients/client/public/contact/index.tsx"),
)(ContactLeadColumnInner) as unknown as React.ComponentType<{
    defaultInterest?: string;
    showScene?: boolean;
    titleAs?: "h1" | "h2";
}>;

export default ContactLeadColumn;
