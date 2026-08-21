import {compose} from "redux";
import type {ComponentType} from "react";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {developersAssets} from "@propertyManagementModule/clients/client/public/developers/developersAssets.ts";
import {FIGMA_DEVELOPERS_CATALOG} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_CONTAINER,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import MarketingContactForm from "@propertyManagementModule/clients/client/public/shared/sections/marketingContactForm.tsx";

const {bg1WidthRatio, bg2WidthRatio, minHeightRatio} = FIGMA_DEVELOPERS_CATALOG;

/** Contact-form copy/keys — separate from developers page language. */
const DevelopersCatalogContactForm = compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/contact/index.tsx"),
)(function DevelopersCatalogContactFormInner({
    resolveLanguageKey,
    currentLanguage,
    languageCode,
}: PublicLanguageProps) {
    return (
        <MarketingContactForm
            resolveLanguageKey={resolveLanguageKey}
            currentLanguage={currentLanguage}
            languageCode={languageCode}
            defaultInterest="partnerships"
            hideInterest
            variant="onDark"
        />
    );
}) as unknown as ComponentType;

function DevelopersCatalogSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div
            className="relative mt-16 w-full overflow-hidden bg-pronix-blue md:mt-20 lg:mt-24"
            style={{minHeight: `${minHeightRatio * 100}vw`}}
            data-node-id="388:1266"
        >
            <img
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-1/2 h-full max-w-none -translate-x-1/2 object-cover"
                style={{width: `${bg1WidthRatio * 100}%`}}
                src={developersAssets.catalogBg1}
                data-node-id="400:463"
            />
            <img
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-1/2 h-full max-w-none -translate-x-1/2 object-cover opacity-80"
                style={{width: `${bg2WidthRatio * 100}%`}}
                src={developersAssets.catalogBg2}
                data-node-id="401:468"
            />
            <div
                className={`relative z-10 flex items-center justify-center py-16 md:py-20 lg:py-24 ${PUBLIC_CONTAINER}`}
                data-node-id="389:616"
            >
                <div
                    className="flex w-full max-w-3xl flex-col items-center gap-8 text-center text-white md:gap-10"
                    data-node-id="389:620"
                >
                    <h2 className={`${PUBLIC_TITLE} text-white`} data-node-id="389:614">
                        {resolveLanguageKey("catalogTitle")}
                    </h2>
                    <p className={`${PUBLIC_SUBTITLE} text-white/90`} data-node-id="389:615">
                        {resolveLanguageKey("catalogBody")}
                    </p>
                    <div className="w-full max-w-xl text-left">
                        <DevelopersCatalogContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DevelopersCatalogSection;
