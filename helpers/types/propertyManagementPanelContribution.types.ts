import type {ContributionBase} from "@coreModule/helpers/moduleContributions/contributionRegistry.ts";
import type {ErpExportDataset} from "armonia/src/modules/propertyManagement/api/realEstate/private/erpExport/erpExport.response.type.ts";

/**
 * Per-branch open snag counts for the propertyManagement group dashboard. The endpoint is called with `POST {}` and
 * answers `{openSnagsByCompany?: Record<companyId, number>}`.
 */
export type GroupDashboardOpenSnagsSource = {
    /** The contributor's endpoint, e.g. `/api/<module>/groupDashboard`. */
    url: string;
    /** Models (lower-cased collection names) whose read grant lets the caller see the counts; any one is enough. */
    accessModels: readonly string[];
};

/**
 * ERP export datasets a module serves from its own endpoint. The ERP export page sends the datasets it owns to this
 * endpoint with the same body (`ErpExportFormType`) and response shape (JSON or CSV) as propertyManagement's, and
 * combines both answers into one export.
 */
export type ErpExportSource = {
    /** The contributor's endpoint, e.g. `/api/<module>/erpExport`. */
    url: string;
    /** Datasets this endpoint answers; they are offered only while the contributing module is on. */
    datasets: readonly ErpExportDataset[];
    /** Models whose read grant opens the page and its menu entry for these datasets; any one is enough. */
    accessModels: readonly string[];
};

/**
 * A card on the propertyManagement dashboard for the selected edifice, rendered as `<Widget edificeId={...} />`.
 */
export type DashboardEdificeCardSource = {
    /** Widget registry key of the card, e.g. `#DeliveryReadinessCard`. */
    widget: string;
    /** Models whose read grant shows the card; any one is enough. */
    accessModels: readonly string[];
};

/**
 * Optional attach file: `src/modules/<pkg>/clients/panel/propertyManagementPanelContribution.ts(x)`.
 *
 * A propertyManagement-owned contribution kind (D119): a module that depends on propertyManagement feeds data into
 * propertyManagement's own report screens (dashboard, group dashboard, ERP export) without propertyManagement naming that module,
 * its endpoints or its models (CORE-02). Discovered by `loadPropertyManagementPanelContributions.ts`, filtered by the
 * enabled and the company's modules, so a missing module contributes nothing.
 */
export type PropertyManagementPanelContribution = ContributionBase & {
    groupDashboardOpenSnags?: GroupDashboardOpenSnagsSource;
    erpExport?: ErpExportSource;
    dashboardEdificeCard?: DashboardEdificeCardSource;
};
