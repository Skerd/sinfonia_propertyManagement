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
    HardHat,
    BookOpen,
    ClipboardX,
    Download,
    Network,
    Gauge,
    Landmark,
    Truck,
    Calculator,
    FileSearch,
    BadgeCheck,
    ShieldAlert,
    Warehouse,
    Boxes,
    MapPin,
    Scale,
    FileStack,
    PenTool,
    UserPlus,
    Flag,
    ListTodo,
    Package,
    FileSignature,
    MessageSquare,
    Send,
    GitBranch,
    PackageCheck,
    Plug,
    CalendarClock,
    ClipboardCheck,
    AlertTriangle,
    ShieldCheck,
    Gavel,
    Mail,
    Handshake,
    List,
    GitCompare,
    Workflow,
    Inbox,
    Wallet,
    Rows3,
    MapPinned,
    Ruler,
    FileCheck,
    type LucideIcon,
} from "lucide-react";
import {
    IconFolder,
    IconLayoutDashboard,
} from "@tabler/icons-react";
import type {SidebarContribution} from "@coreModule/clients/panel/moduleContributions/sidebarContribution.types.ts";
import type {NavCollapsible, NavGroup, NavItem, NavLink} from "@coreModule/helpers/panel/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

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
): NavLink {
    return {
        title: resolveLanguageKey(titleKey),
        url,
        icon,
        ...clearance,
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
        navLink(resolveLanguageKey, "menus.realEstate.overview.title", "/realEstate/overview", IconLayoutDashboard),
        navLink(resolveLanguageKey, "menus.realEstate.dashboard.title", "/realEstate/dashboard", TowerControl),
        navLink(resolveLanguageKey, "menus.realEstate.projects.title", "/realEstate/projects", IconFolder),
        navLink(resolveLanguageKey, "menus.realEstate.edifices.title", "/realEstate/edifices", Building),
        navLink(resolveLanguageKey, "menus.realEstate.floors.title", "/realEstate/floors", Layers),
        navLink(resolveLanguageKey, "menus.realEstate.units.title", "/realEstate/units", DoorOpen),
        navLink(resolveLanguageKey, "menus.realEstate.leads.title", "/realEstate/leads", UserSearch),
        navLink(resolveLanguageKey, "menus.realEstate.inspections.title", "/realEstate/inspections", ClipboardList),
        navLink(resolveLanguageKey, "menus.realEstate.modificationRequests.title", "/realEstate/modificationRequests", Wrench),
        navLink(resolveLanguageKey, "menus.realEstate.reservations.title", "/realEstate/reservations", ClipboardList),
        navLink(resolveLanguageKey, "menus.realEstate.sales.title", "/realEstate/sales", DollarSign),
        navLink(resolveLanguageKey, "menus.realEstate.contractsHub.title", "/realEstate/contractsHub", FileText),
        navLink(resolveLanguageKey, "menus.realEstate.commissions.title", "/realEstate/commissions", Percent),
        navLink(resolveLanguageKey, "menus.realEstate.constructionUpdates.title", "/realEstate/constructionUpdates", HardHat),
        navLink(resolveLanguageKey, "menus.realEstate.stories.title", "/realEstate/stories", BookOpen),
        navLink(resolveLanguageKey, "menus.realEstate.snags.title", "/realEstate/snags", ClipboardX),
        navCollapsible(resolveLanguageKey, "menus.realEstate.ownersAndRentals.title", KeyRound, [
            navLink(resolveLanguageKey, "menus.realEstate.rentalsHub.title", "/realEstate/rentalsHub", Home),
            navLink(resolveLanguageKey, "menus.realEstate.leases.title", "/realEstate/leases", FileText),
            navLink(resolveLanguageKey, "menus.realEstate.rentalPayments.title", "/realEstate/rentalPayments", Banknote),
        ]),
        navCollapsible(resolveLanguageKey, "menus.reports.title", BarChart2, [
            navLink(resolveLanguageKey, "menus.reports.groupDashboard.title", "/realEstate/groupDashboard", Network),
            navLink(resolveLanguageKey, "menus.reports.agentReport.title", "/realEstate/agentReport", BarChart2),
            navLink(resolveLanguageKey, "menus.reports.roi.title", "/realEstate/roi", TrendingUp),
            navLink(resolveLanguageKey, "menus.reports.erpExport.title", "/realEstate/erpExport", Download),
        ]),
        navCollapsible(resolveLanguageKey, "menus.finance.title", Receipt, [
            navLink(resolveLanguageKey, "menus.finance.unitCosts.title", "/realEstate/unitCosts", Receipt),
        ]),
    ];

    return {
        title: resolveLanguageKey("menus.realEstate.title"),
        ...clearance,
        items,
    };
}

/** Messerli Bauadministration surfaces that were route-only — restored as a dedicated sidebar group. */
function buildPropertyManagementNavGroup(resolveLanguageKey: ResolveLanguageKey): NavGroup {
    const re = (key: string) => `menus.realEstate.${key}.title`;
    const items: NavItem[] = [
        navLink(resolveLanguageKey, re("cockpit"), "/realEstate/cockpit", Gauge),
        navLink(resolveLanguageKey, re("systemMap"), "/realEstate/systemmap", Network),
        navCollapsible(resolveLanguageKey, re("development"), Landmark, [
            navLink(resolveLanguageKey, re("landParcels"), "/realEstate/landParcels", MapPin),
            navLink(resolveLanguageKey, re("feasibilityStudies"), "/realEstate/feasibilityStudies", Scale),
            navLink(resolveLanguageKey, re("permits"), "/realEstate/permits", FileCheck),
            navLink(resolveLanguageKey, re("projectDocuments"), "/realEstate/projectDocuments", FileStack),
            navLink(resolveLanguageKey, re("designStages"), "/realEstate/designStages", PenTool),
            navLink(resolveLanguageKey, re("consultantAppointments"), "/realEstate/consultantAppointments", UserPlus),
        ]),
        navCollapsible(resolveLanguageKey, re("delivery"), Truck, [
            navLink(resolveLanguageKey, re("milestones"), "/realEstate/milestones", Flag),
            navLink(resolveLanguageKey, re("scheduleTasks"), "/realEstate/scheduleTasks", ListTodo),
            navLink(resolveLanguageKey, re("workPackages"), "/realEstate/workPackages", Package),
            navLink(resolveLanguageKey, re("constructionContracts"), "/realEstate/constructionContracts", FileSignature),
            navLink(resolveLanguageKey, re("progressClaims"), "/realEstate/progressClaims", DollarSign),
            navLink(resolveLanguageKey, re("rfis"), "/realEstate/rfis", MessageSquare),
            navLink(resolveLanguageKey, re("submittals"), "/realEstate/submittals", Send),
            navLink(resolveLanguageKey, re("variationOrders"), "/realEstate/variationOrders", GitBranch),
            navLink(resolveLanguageKey, re("handoverPackages"), "/realEstate/handoverPackages", PackageCheck),
            navLink(resolveLanguageKey, re("commissioningRecords"), "/realEstate/commissioningRecords", Plug),
        ]),
        navCollapsible(resolveLanguageKey, re("cost"), Calculator, [
            navLink(resolveLanguageKey, re("costClassifications"), "/realEstate/costClassifications", Layers),
            navLink(resolveLanguageKey, re("budgets"), "/realEstate/budgets", Banknote),
            navLink(resolveLanguageKey, re("boqItems"), "/realEstate/boqItems", List),
            navLink(resolveLanguageKey, re("estimateComparison"), "/realEstate/estimateComparison", GitCompare),
            navLink(resolveLanguageKey, re("costCommitments"), "/realEstate/costCommitments", Handshake),
            navLink(resolveLanguageKey, re("costControl"), "/realEstate/costControl", Calculator),
        ]),
        navCollapsible(resolveLanguageKey, re("tendering"), Gavel, [
            navLink(resolveLanguageKey, re("specifications"), "/realEstate/specifications", FileText),
            navLink(resolveLanguageKey, re("specificationItems"), "/realEstate/specificationItems", Rows3),
            navLink(resolveLanguageKey, re("tenders"), "/realEstate/tenders", FileSearch),
            navLink(resolveLanguageKey, re("tenderInvitations"), "/realEstate/tenderInvitations", Mail),
            navLink(resolveLanguageKey, re("bids"), "/realEstate/bids", Handshake),
            navLink(resolveLanguageKey, re("bidLines"), "/realEstate/bidLines", List),
            navLink(resolveLanguageKey, re("bidComparison"), "/realEstate/bidComparison", GitCompare),
        ]),
        navCollapsible(resolveLanguageKey, re("financeApproval"), BadgeCheck, [
            navLink(resolveLanguageKey, re("approvalWorkflows"), "/realEstate/approvalWorkflows", Workflow),
            navLink(resolveLanguageKey, re("approvalRequests"), "/realEstate/approvalRequests", Inbox),
            navLink(resolveLanguageKey, re("contractorInvoices"), "/realEstate/contractorInvoices", Receipt),
            navLink(resolveLanguageKey, re("incomingInvoices"), "/realEstate/incomingInvoices", Inbox),
            navLink(resolveLanguageKey, re("liquidityPlans"), "/realEstate/liquidityPlans", Wallet),
            navLink(resolveLanguageKey, re("liquidityLines"), "/realEstate/liquidityLines", Rows3),
            navLink(resolveLanguageKey, re("feeCalculations"), "/realEstate/feeCalculations", Percent),
        ]),
        navCollapsible(resolveLanguageKey, re("qualityHse"), ShieldAlert, [
            navLink(resolveLanguageKey, re("inspectionChecklistTemplates"), "/realEstate/inspectionChecklistTemplates", ClipboardCheck),
            navLink(resolveLanguageKey, re("siteDiaries"), "/realEstate/siteDiaries", CalendarClock),
            navLink(resolveLanguageKey, re("safetyIncidents"), "/realEstate/safetyIncidents", AlertTriangle),
            navLink(resolveLanguageKey, re("warranties"), "/realEstate/warranties", ShieldCheck),
        ]),
        navCollapsible(resolveLanguageKey, re("facilityMgmt"), Warehouse, [
            navLink(resolveLanguageKey, re("assets"), "/realEstate/assets", Boxes),
            navLink(resolveLanguageKey, re("maintenancePlans"), "/realEstate/maintenancePlans", Wrench),
            navLink(resolveLanguageKey, re("maintenanceWorkOrders"), "/realEstate/maintenanceWorkOrders", ClipboardList),
            navLink(resolveLanguageKey, re("planMarkups"), "/realEstate/planMarkups", MapPinned),
        ]),
        navCollapsible(resolveLanguageKey, re("bimIntegrations"), Ruler, [
            navLink(resolveLanguageKey, re("bimModels"), "/realEstate/bimModels", Boxes),
            navLink(resolveLanguageKey, re("bimQuantities"), "/realEstate/bimQuantities", Ruler),
        ]),
    ];

    return {
        title: resolveLanguageKey("menus.propertyManagement.title") || "Property Management",
        ...clearance,
        items,
    };
}

const propertyManagementSidebarContribution: SidebarContribution = {
    id: "propertyManagement",
    order: 20,
    getNavGroups(resolveLanguageKey: ResolveLanguageKey): NavGroup[] {
        return [
            buildRealEstateNavGroup(resolveLanguageKey),
            buildPropertyManagementNavGroup(resolveLanguageKey),
        ];
    },
};

export default propertyManagementSidebarContribution;
