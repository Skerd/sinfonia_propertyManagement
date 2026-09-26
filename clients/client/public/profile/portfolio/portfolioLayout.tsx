import {Link, Outlet, useLocation} from "react-router-dom";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import {
    PUBLIC_BODY,
    PUBLIC_CONTENT_FRAME,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {cn} from "@coreModule/components/lib/utils.ts";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/profile/portfolio/portfolioLayout.tsx";

const PORTFOLIO_TABS = [
    {path: "/profile/portfolio", labelKey: "tabOverview", end: true},
    {path: "/profile/portfolio/properties", labelKey: "tabProperties", end: false},
    {path: "/profile/portfolio/reservations", labelKey: "tabReservations", end: false},
    {path: "/profile/portfolio/saved", labelKey: "tabSaved", end: false},
] as const;

type PortfolioLayoutProps = WithLanguageType;

function PortfolioLayoutInner({resolveLanguageKey}: PortfolioLayoutProps) {
    const location = useLocation();

    return (
        <PublicSection className="pt-2 pb-16 md:pt-4 md:pb-20">
            <div className={PUBLIC_CONTENT_FRAME}>
                <div className="flex flex-col gap-2 md:gap-3">
                    <h1 className={PUBLIC_TITLE}>{resolveLanguageKey("pageTitle")}</h1>
                    <p className={PUBLIC_SUBTITLE}>{resolveLanguageKey("pageSubtitle")}</p>
                </div>

                <nav
                    className="mt-8 flex flex-wrap gap-2 border-b border-pronix-border pb-0 md:gap-4"
                    aria-label={resolveLanguageKey("tabsLabel")}
                >
                    {PORTFOLIO_TABS.map((tab) => {
                        const active = tab.end
                            ? location.pathname === tab.path
                            : location.pathname.startsWith(tab.path);
                        return (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={cn(
                                    "border-b-2 px-1 pb-3 font-aeonik-medium text-base transition-colors md:text-lg",
                                    active
                                        ? "border-pronix-blue text-pronix-blue"
                                        : "border-transparent text-pronix-ink-muted hover:text-pronix-ink",
                                )}
                                aria-current={active ? "page" : undefined}
                            >
                                {resolveLanguageKey(tab.labelKey)}
                            </Link>
                        );
                    })}
                </nav>

                <div className={cn(PUBLIC_BODY, "mt-8")}>
                    <Outlet />
                </div>
            </div>
        </PublicSection>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(PortfolioLayoutInner);
