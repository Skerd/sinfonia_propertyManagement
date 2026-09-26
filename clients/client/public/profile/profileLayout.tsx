import {Link, Outlet, useLocation} from "react-router-dom";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/shared/sections/footerSection.tsx";
import {
    PUBLIC_CONTENT_FRAME,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {cn} from "@coreModule/components/lib/utils.ts";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/profile/profileLayout.tsx";

const PROFILE_NAV = [
    {path: "/profile", labelKey: "navOverview", end: true},
    {path: "/profile/portfolio", labelKey: "navPortfolio", end: false},
] as const;

type ProfileLayoutProps = WithLanguageType;

function ProfileLayoutInner({resolveLanguageKey}: ProfileLayoutProps) {
    const location = useLocation();

    return (
        <PublicPageShell nodeId="profile:shell" nodeName="Profile">
            <PublicSection flush>
                <PageHeaderSection variant="light" />
            </PublicSection>
            <PublicSection className="pt-2 pb-4 md:pt-4">
                <div className={PUBLIC_CONTENT_FRAME}>
                    <nav className="flex flex-wrap gap-6 border-b border-pronix-border pb-4" aria-label={resolveLanguageKey("navLabel")}>
                        {PROFILE_NAV.map((item) => {
                            const active = item.end
                                ? location.pathname === item.path
                                : location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "font-aeonik-medium text-lg transition-colors md:text-xl",
                                        active ? "text-pronix-blue" : "text-pronix-ink-muted hover:text-pronix-ink",
                                    )}
                                    aria-current={active ? "page" : undefined}
                                >
                                    {resolveLanguageKey(item.labelKey)}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </PublicSection>
            <Outlet />
            <PublicSection flush>
                <FooterSection />
            </PublicSection>
        </PublicPageShell>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ProfileLayoutInner);
