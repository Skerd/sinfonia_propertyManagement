export function hasModelRead(read: unknown): boolean {
    return read === true
        || (typeof read === "object" && read !== null && Object.keys(read).length > 0);
}

export function hasAnyAccessRead(accesses: {read: unknown}[]): boolean {
    return accesses.some((access) => hasModelRead(access.read));
}

export const OVERVIEW_DASHBOARD_ACCESS_MODELS = [
    "sales",
    "units",
    "projects",
    "edifices",
    "floors",
    "reservations",
    "paymentplans",
    "inspections",
    "modificationrequests",
    "unitcosts",
    "rentalpayments",
    "leases",
] as const;

export const DELIVERY_READINESS_ACCESS_MODELS = [
    "permits",
    "projectdocuments",
    "designstages",
    "milestones",
    "snags",
    "handoverpackages",
] as const;

export const CONTRACTS_HUB_ACCESS_MODELS = ["sales", "reservations"] as const;
export const PAYMENTS_HUB_ACCESS_MODELS = ["paymentplans", "sales"] as const;
export const RENTALS_HUB_ACCESS_MODELS = ["leases", "rentalpayments"] as const;
export const GROUP_DASHBOARD_ACCESS_MODELS = ["units", "sales", "commissions", "leases"] as const;
export const AGENT_REPORT_ACCESS_MODELS = ["sales", "reservations", "commissions"] as const;
export const ROI_ACCESS_MODELS = ["units", "unitcosts", "sales", "leases"] as const;
export const ERP_EXPORT_ACCESS_MODELS = [
    "sales",
    "commissions",
    "paymentplans",
    "rentalpayments",
    "unitcosts",
] as const;

export const PROPERTY_DEVELOPMENT_ERP_EXPORT_ACCESS_MODELS = [
    "boqitems",
    "costcommitments",
    "progressclaims",
    "permits",
] as const;
