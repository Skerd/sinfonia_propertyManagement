import {filterGlobByEnabledModules} from "@coreModule/helpers/modules/enabledModules.ts";
import {
    type ContributionGlob,
    createContributionList,
    isFunction,
    isPlainObject,
    isString,
} from "@coreModule/helpers/moduleContributions/contributionRegistry.ts";
import type {
    DashboardEdificeCardSource,
    ErpExportSource,
    GroupDashboardOpenSnagsSource,
    ProjectSheetSectionSource,
    PropertyManagementPanelContribution,
} from "@propertyManagementModule/helpers/types/propertyManagementPanelContribution.types.ts";

const KIND = "propertyManagementPanelContribution";

const isStringList = (value: unknown): boolean => Array.isArray(value) && value.every(isString);

function isOpenSnagsSource(value: unknown): boolean {
    return value === undefined || (isPlainObject(value) && isString(value.url) && isStringList(value.accessModels));
}

function isErpExportDataset(value: unknown): boolean {
    return isPlainObject(value) && isString(value.value) && isString(value.responseKey);
}

function isErpExportSource(value: unknown): boolean {
    return value === undefined
        || (isPlainObject(value)
            && isString(value.url)
            && Array.isArray(value.datasets) && value.datasets.every(isErpExportDataset)
            && isStringList(value.accessModels)
            && isFunction(value.datasetLabel)
            && isFunction(value.columnLabel));
}

function isWidgetSource(value: unknown): boolean {
    return isPlainObject(value) && isString(value.widget) && isStringList(value.accessModels);
}

function isEdificeCardSource(value: unknown): boolean {
    return value === undefined || isWidgetSource(value);
}

function isProjectSheetSections(value: unknown): boolean {
    return value === undefined || (Array.isArray(value) && value.every(isWidgetSource));
}

/**
 * Reader over `propertyManagementPanelContribution` files. The group dashboard and the ERP export take one source,
 * the first in contribution order; the dashboard shows every contributed edifice card and the project sheet every
 * contributed section. Today only propertyDevelopment
 * contributes.
 */
export function createPropertyManagementPanelContributions(glob: ContributionGlob) {
    const list = createContributionList<PropertyManagementPanelContribution>({
        kind: KIND,
        glob,
        isValid: (entry) => isOpenSnagsSource(entry.groupDashboardOpenSnags)
            && isErpExportSource(entry.erpExport)
            && isEdificeCardSource(entry.dashboardEdificeCard)
            && isProjectSheetSections(entry.projectSheetSections),
    });

    const getGroupDashboardOpenSnagsSource = (): GroupDashboardOpenSnagsSource | undefined =>
        list().find((entry) => entry.groupDashboardOpenSnags)?.groupDashboardOpenSnags;

    const getErpExportSource = (): ErpExportSource | undefined =>
        list().find((entry) => entry.erpExport)?.erpExport;

    const getDashboardEdificeCardSources = (): DashboardEdificeCardSource[] =>
        list().flatMap((entry) => (entry.dashboardEdificeCard ? [entry.dashboardEdificeCard] : []));

    const getProjectSheetSectionSources = (): ProjectSheetSectionSource[] =>
        list().flatMap((entry) => entry.projectSheetSections ?? []);

    return {list, getGroupDashboardOpenSnagsSource, getErpExportSource, getDashboardEdificeCardSources, getProjectSheetSectionSources};
}

const contributions = createPropertyManagementPanelContributions(
    filterGlobByEnabledModules(
        import.meta.glob<Record<string, unknown>>(
            "@/modules/*/clients/panel/propertyManagementPanelContribution.{tsx,ts}",
            {eager: true},
        ),
    ),
);

/** The contributed source of the group dashboard's open snag counts, if a module on for the company provides one. */
export function getGroupDashboardOpenSnagsSource(): GroupDashboardOpenSnagsSource | undefined {
    return contributions.getGroupDashboardOpenSnagsSource();
}

/** The contributed ERP export datasets and their endpoint, if a module on for the company provides them. */
export function getErpExportSource(): ErpExportSource | undefined {
    return contributions.getErpExportSource();
}

/** The dashboard's contributed edifice cards, in contribution order, from the modules on for the company. */
export function getDashboardEdificeCardSources(): DashboardEdificeCardSource[] {
    return contributions.getDashboardEdificeCardSources();
}

/** The project sheet's contributed sections, in contribution order, from the modules on for the company. */
export function getProjectSheetSectionSources(): ProjectSheetSectionSource[] {
    return contributions.getProjectSheetSectionSources();
}
