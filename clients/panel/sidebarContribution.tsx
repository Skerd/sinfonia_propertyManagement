import {
    Building,
    ClipboardList,
    DollarSign,
    DoorOpen,
    Layers,
    Percent,
    Receipt,
    TowerControl,
    Wrench,
    BarChart2,
    UserSearch,
    FileText,
    Banknote,
    Home,
    KeyRound,
    TrendingUp,
    BookOpen,
    Download,
    Network,
    ClipboardCheck,
    type LucideIcon,
} from "lucide-react";
import {
    IconFolder,
    IconLayoutDashboard,
} from "@tabler/icons-react";
import type {SidebarContribution} from "@coreModule/clients/panel/moduleContributions/sidebarContribution.types.ts";
import type {NavCollapsible, NavGroup, NavItem, NavLink} from "@coreModule/helpers/panel/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {
    AGENT_REPORT_ACCESS_MODELS,
    CONTRACTS_HUB_ACCESS_MODELS,
    ERP_EXPORT_ACCESS_MODELS,
    PROPERTY_DEVELOPMENT_ERP_EXPORT_ACCESS_MODELS,
    GROUP_DASHBOARD_ACCESS_MODELS,
    OVERVIEW_DASHBOARD_ACCESS_MODELS,
    RENTALS_HUB_ACCESS_MODELS,
    ROI_ACCESS_MODELS,
} from "@propertyManagementModule/helpers/access/aggregationAccess.ts";
import {isModuleEnabled} from "@coreModule/helpers/modules/enabledModules.ts";

type NavIcon = LucideIcon | typeof IconFolder | typeof IconLayoutDashboard;

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
        navLink(resolveLanguageKey, "menus.realEstate.dashboard.title", "/realEstate/dashboard", TowerControl, OVERVIEW_DASHBOARD_ACCESS_MODELS),
        navLink(resolveLanguageKey, "menus.realEstate.projects.title", "/realEstate/projects", IconFolder),
        navLink(resolveLanguageKey, "menus.realEstate.edifices.title", "/realEstate/edifices", Building),
        navLink(resolveLanguageKey, "menus.realEstate.floors.title", "/realEstate/floors", Layers),
        navLink(resolveLanguageKey, "menus.realEstate.units.title", "/realEstate/units", DoorOpen),
        navLink(resolveLanguageKey, "menus.realEstate.leads.title", "/realEstate/leads", UserSearch),
        navLink(resolveLanguageKey, "menus.realEstate.inspections.title", "/realEstate/inspections", ClipboardList),
        navLink(resolveLanguageKey, "menus.realEstate.inspectionChecklistTemplates.title", "/realEstate/inspectionChecklistTemplates", ClipboardCheck),
        navLink(resolveLanguageKey, "menus.realEstate.modificationRequests.title", "/realEstate/modificationRequests", Wrench),
        navLink(resolveLanguageKey, "menus.realEstate.reservations.title", "/realEstate/reservations", ClipboardList),
        navLink(resolveLanguageKey, "menus.realEstate.sales.title", "/realEstate/sales", DollarSign),
        navLink(resolveLanguageKey, "menus.realEstate.contractsHub.title", "/realEstate/contractsHub", FileText, CONTRACTS_HUB_ACCESS_MODELS),
        navLink(resolveLanguageKey, "menus.realEstate.commissions.title", "/realEstate/commissions", Percent),
        navLink(resolveLanguageKey, "menus.realEstate.stories.title", "/realEstate/stories", BookOpen),
        navCollapsible(resolveLanguageKey, "menus.finance.title", Receipt, [
            navLink(resolveLanguageKey, "menus.finance.unitCosts.title", "/realEstate/unitCosts", Receipt),
        ]),
        navCollapsible(resolveLanguageKey, "menus.realEstate.ownersAndRentals.title", KeyRound, [
            navLink(resolveLanguageKey, "menus.realEstate.rentalsHub.title", "/realEstate/rentalsHub", Home, RENTALS_HUB_ACCESS_MODELS),
            navLink(resolveLanguageKey, "menus.realEstate.leases.title", "/realEstate/leases", FileText),
            navLink(resolveLanguageKey, "menus.realEstate.rentalPayments.title", "/realEstate/rentalPayments", Banknote),
        ]),
        navCollapsible(resolveLanguageKey, "menus.reports.title", BarChart2, [
            navLink(resolveLanguageKey, "menus.reports.groupDashboard.title", "/realEstate/groupDashboard", Network, GROUP_DASHBOARD_ACCESS_MODELS),
            navLink(resolveLanguageKey, "menus.reports.agentReport.title", "/realEstate/agentReport", BarChart2, AGENT_REPORT_ACCESS_MODELS),
            navLink(resolveLanguageKey, "menus.reports.roi.title", "/realEstate/roi", TrendingUp, ROI_ACCESS_MODELS),
            navLink(
                resolveLanguageKey,
                "menus.reports.erpExport.title",
                "/realEstate/erpExport",
                Download,
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
