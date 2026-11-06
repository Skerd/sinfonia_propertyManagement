import {
    IconFolder,
    IconLayoutDashboard, IconBook, IconBuilding, IconBuildingBroadcastTower, IconCalendarTime, IconCash, IconChartBar, IconClipboardList, IconCurrencyDollar, IconDoorEnter, IconDownload, IconFileText, IconHelmet, IconHome, IconKey, IconNetwork, IconPercentage, IconReceipt, IconStack2, IconTool, IconTrendingUp, IconUserSearch, type TablerIcon,
} from "@tabler/icons-react";
import type {SidebarContribution} from "@coreModule/helpers/types/sidebarContribution.types.ts";
import type {NavCollapsible, NavGroup, NavItem, NavLink} from "@coreModule/helpers/types/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {
    AGENT_REPORT_ACCESS_MODELS,
    CONTRACTS_HUB_ACCESS_MODELS,
    ERP_EXPORT_ACCESS_MODELS,
    PROPERTY_DEVELOPMENT_ERP_EXPORT_ACCESS_MODELS,
    GROUP_DASHBOARD_ACCESS_MODELS,
    OVERVIEW_DASHBOARD_ACCESS_MODELS,
    PAYMENTS_HUB_ACCESS_MODELS,
    RENTALS_HUB_ACCESS_MODELS,
    ROI_ACCESS_MODELS,
} from "@propertyManagementModule/helpers/access/aggregationAccess.ts";
import {isModuleEnabled} from "@coreModule/helpers/modules/enabledModules.ts";
import {registerPropertyManagementRefSelects} from "armonia/src/modules/propertyManagement/database/filter/refSelect.ts";

registerPropertyManagementRefSelects();

type NavIcon = TablerIcon | typeof IconFolder | typeof IconLayoutDashboard;

const clearance = {
    permissions: [] as string[],
    usersPermissions: [] as string[],
    atLeastOnePermission: true,
};

function navLink(
    resolveLanguageKey: ResolveLanguageKey,
    titleKey: string,
    url: string,
    icon: NavIcon,
    permissions: readonly string[] = [],
): NavLink {
    return {
        title: resolveLanguageKey(titleKey),
        url,
        icon,
        ...clearance,
        permissions: [...permissions],
        atLeastOnePermission: true,
    };
}

function navCollapsible(
    resolveLanguageKey: ResolveLanguageKey,
    titleKey: string,
    icon: NavIcon,
    items: NavLink[],
): NavCollapsible {
    return {
        title: resolveLanguageKey(titleKey),
        icon,
        ...clearance,
        items,
    };
}

function buildRealEstateNavGroup(resolveLanguageKey: ResolveLanguageKey): NavGroup {
    const items: NavItem[] = [
        navLink(resolveLanguageKey, "menus.realEstate.overview.title", "/realEstate/overview", IconLayoutDashboard, OVERVIEW_DASHBOARD_ACCESS_MODELS),
        navLink(resolveLanguageKey, "menus.realEstate.dashboard.title", "/realEstate/dashboard", IconBuildingBroadcastTower, OVERVIEW_DASHBOARD_ACCESS_MODELS),
        navLink(resolveLanguageKey, "menus.realEstate.projects.title", "/realEstate/projects", IconFolder, ["projects"]),
        navLink(resolveLanguageKey, "menus.realEstate.edifices.title", "/realEstate/edifices", IconBuilding, ["edifices"]),
        navLink(resolveLanguageKey, "menus.realEstate.floors.title", "/realEstate/floors", IconStack2, ["floors"]),
        navLink(resolveLanguageKey, "menus.realEstate.units.title", "/realEstate/units", IconDoorEnter, ["units"]),
        navLink(resolveLanguageKey, "menus.realEstate.constructionProgress.title", "/realEstate/constructionProgress", IconHelmet, ["constructionprogresses"]),
        navLink(resolveLanguageKey, "menus.realEstate.leads.title", "/realEstate/leads", IconUserSearch, ["leads"]),
        navLink(resolveLanguageKey, "menus.realEstate.inspections.title", "/realEstate/inspections", IconClipboardList, ["inspections"]),
        navLink(resolveLanguageKey, "menus.realEstate.modificationRequests.title", "/realEstate/modificationRequests", IconTool, ["modificationRequests"]),
        navLink(resolveLanguageKey, "menus.realEstate.reservations.title", "/realEstate/reservations", IconClipboardList, ["reservations"]),
        navLink(resolveLanguageKey, "menus.realEstate.sales.title", "/realEstate/sales", IconCurrencyDollar, ["sales"]),
        navLink(resolveLanguageKey, "menus.realEstate.contractsHub.title", "/realEstate/contractsHub", IconFileText, CONTRACTS_HUB_ACCESS_MODELS),
        navLink(resolveLanguageKey, "menus.realEstate.commissions.title", "/realEstate/commissions", IconPercentage, ["commissions"]),
        navLink(resolveLanguageKey, "menus.realEstate.stories.title", "/realEstate/stories", IconBook, ["stories"]),
        navCollapsible(resolveLanguageKey, "menus.finance.title", IconReceipt, [
            navLink(resolveLanguageKey, "menus.finance.paymentsHub.title", "/realEstate/paymentsHub", IconCalendarTime, PAYMENTS_HUB_ACCESS_MODELS),
            navLink(resolveLanguageKey, "menus.finance.unitCosts.title", "/realEstate/unitCosts", IconReceipt, ["unitCosts"]),
        ]),
        navCollapsible(resolveLanguageKey, "menus.realEstate.ownersAndRentals.title", IconKey, [
            navLink(resolveLanguageKey, "menus.realEstate.rentalsHub.title", "/realEstate/rentalsHub", IconHome, RENTALS_HUB_ACCESS_MODELS),
            navLink(resolveLanguageKey, "menus.realEstate.leases.title", "/realEstate/leases", IconFileText, ["leases"]),
            navLink(resolveLanguageKey, "menus.realEstate.rentalPayments.title", "/realEstate/rentalPayments", IconCash, ["rentalpayments"]),
        ]),
        navCollapsible(resolveLanguageKey, "menus.reports.title", IconChartBar, [
            navLink(resolveLanguageKey, "menus.reports.groupDashboard.title", "/realEstate/groupDashboard", IconNetwork, GROUP_DASHBOARD_ACCESS_MODELS),
            navLink(resolveLanguageKey, "menus.reports.agentReport.title", "/realEstate/agentReport", IconChartBar, AGENT_REPORT_ACCESS_MODELS),
            navLink(resolveLanguageKey, "menus.reports.roi.title", "/realEstate/roi", IconTrendingUp, ROI_ACCESS_MODELS),
            navLink(
                resolveLanguageKey,
                "menus.reports.erpExport.title",
                "/realEstate/erpExport",
                IconDownload,
                isModuleEnabled("propertyDevelopment")
                    ? [...ERP_EXPORT_ACCESS_MODELS, ...PROPERTY_DEVELOPMENT_ERP_EXPORT_ACCESS_MODELS]
                    : ERP_EXPORT_ACCESS_MODELS,
            ),
        ]),
    ];

    return {
        title: resolveLanguageKey("menus.realEstate.title"),
        ...clearance,
        items,
    };
}

const propertyManagementSidebarContribution: SidebarContribution = {
    id: "propertyManagement",
    order: 20,
    getNavGroups(resolveLanguageKey: ResolveLanguageKey): NavGroup[] {
        return [buildRealEstateNavGroup(resolveLanguageKey)];
    },
};

export default propertyManagementSidebarContribution;
