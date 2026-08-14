import {Link} from "react-router-dom";
import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import InvestorsCatalogGlobeVisual from "@propertyManagementModule/clients/client/public/investors/sections/investorsCatalogGlobeVisual.tsx";
import {PUBLIC_CONTAINER} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const CATALOG_EMPHASIS = "font-aeonik-medium text-[18px] leading-none md:text-[inherit] md:leading-[inherit]";

function InvestorsCatalogSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div
            id="tokenization"
            className="relative w-full overflow-hidden bg-pronix-blue py-12 md:min-h-[min(60vh,640px)] md:py-16 lg:py-20"
            data-node-id="353:553"
        >
            <div
                className={`relative z-10 ${PUBLIC_CONTAINER} grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,520fr)_minmax(0,860fr)] lg:gap-12`}
            >
                <div className="max-w-xl text-white">
                    <h2 className="cursor-default font-aeonik-medium text-[40px] leading-none tracking-normal text-white not-italic md:text-5xl md:leading-[1.2] lg:text-[56px]">
                        {resolveLanguageKey("catalogTitle")}
                    </h2>
                    <div className="mt-6 space-y-6 md:mt-8 cursor-default font-aeonik-light text-[18px] leading-none tracking-normal text-white/90 not-italic md:text-2xl md:leading-[1.4] lg:text-[24px]">
                        <p>
                            {resolveLanguageKey("catalogBodyP1BeforeQ3")}
                            <span className={CATALOG_EMPHASIS}>{resolveLanguageKey("catalogBodyP1Q3")}</span>
                            {resolveLanguageKey("catalogBodyP1AfterQ3")}
                            <span className={CATALOG_EMPHASIS}>{resolveLanguageKey("catalogBodyP1BoldDigital")}</span>
                            {resolveLanguageKey("catalogBodyP1Rest1")}
                            <span className={CATALOG_EMPHASIS}>{resolveLanguageKey("catalogBodyP1BoldSpv")}</span>
                            {resolveLanguageKey("catalogBodyP1Rest2")}
                        </p>
                        <p>
                            {resolveLanguageKey("catalogBodyP2BeforeMin")}
                            <span className={CATALOG_EMPHASIS}>{resolveLanguageKey("catalogBodyP2BoldMin")}</span>
                            {resolveLanguageKey("catalogBodyP2Mid")}
                            <span className={CATALOG_EMPHASIS}>{resolveLanguageKey("catalogBodyP2BoldEntry")}</span>
                            {resolveLanguageKey("catalogBodyP2Rest")}
                        </p>
                    </div>
                    <Link
                        to="/contact"
                        className="mt-8 inline-flex w-fit items-center justify-center rounded-[5px] border border-white px-6 py-3 font-aeonik-light text-lg text-white not-italic md:text-2xl leading-[1.1]"
                    >
                        {resolveLanguageKey("catalogCta")}
                    </Link>
                </div>
                <InvestorsCatalogGlobeVisual />
            </div>
        </div>
    );
}

export default InvestorsCatalogSection;
