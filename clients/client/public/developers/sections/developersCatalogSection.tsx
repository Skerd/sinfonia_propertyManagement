import {Link} from "react-router-dom";
import {cn} from "@coreModule/components/lib/utils.ts";
import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {developersAssets} from "@propertyManagementModule/clients/client/public/developers/developersAssets.ts";
import {FIGMA_DEVELOPERS_CATALOG} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_CONTAINER,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const {bg1WidthRatio, bg2WidthRatio, minHeightRatio} = FIGMA_DEVELOPERS_CATALOG;

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
                className={`absolute inset-0 z-10 flex items-center justify-center ${PUBLIC_CONTAINER}`}
                data-node-id="389:616"
            >
                <div
                    className="flex w-full max-w-4xl flex-col items-center gap-6 text-center text-white md:gap-11"
                    data-node-id="389:620"
                >
                    <h2 className={`${PUBLIC_TITLE} text-white`} data-node-id="389:614">
                        {resolveLanguageKey("catalogTitle")}
                    </h2>
                    <p className={`${PUBLIC_SUBTITLE} text-white/90`} data-node-id="389:615">
                        {resolveLanguageKey("catalogBody")}
                    </p>
                    <Link
                        to="/contact"
                        className={cn(
                            "inline-flex w-fit cursor-pointer items-center justify-center border border-white px-6 py-3 md:px-12 md:py-4",
                            "bg-transparent text-white transition-colors duration-200",
                            "hover:bg-white hover:text-pronix-blue",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-pronix-blue",
                        )}
                        data-node-id="389:617"
                    >
                        <span className="font-aeonik-medium whitespace-nowrap not-italic text-base leading-[17.15px] md:text-lg lg:text-[24px]">
                            {resolveLanguageKey("catalogCta")}
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default DevelopersCatalogSection;
