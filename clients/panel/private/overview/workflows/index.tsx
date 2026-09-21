import { compose } from "redux";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {
  GRID_KPI,
  DASHBOARD_TAB_STACK,
  DASHBOARD_TAB_INTRO,
} from "@coreModule/components/entityPage/list/entityCard.constants.ts";
import type { DashboardFormResponseType } from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import { ActionException } from "armonia/src/modules/core/types";
import { Badge } from "@coreModule/components/ui/badge.tsx";
import { IconAlertCircle, IconFileCheck, IconFileText } from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errors/errorView.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import { DashboardKpiSection } from "@propertyManagementModule/components/custom/dashboard/DashboardKpiSection.tsx";
import type {KpiDrillDownContext} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import * as kpi from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";

type WorkflowsTabProps = WithLanguageType & {
  dashboardData: DashboardFormResponseType | null | undefined;
  loading: boolean;
  error: ActionException | null;
  onRefresh: () => void;
  drillDownContext: KpiDrillDownContext;
  viewEntriesLabel: string;
};

function WorkflowsTab({
  resolveLanguageKey,
  dashboardData,
  loading,
  error,
  onRefresh,
  drillDownContext,
  viewEntriesLabel,
}: WorkflowsTabProps) {
  if (loading) return <Loader />;
  if (error) {
    return (
      <ErrorView
        title={resolveLanguageKey("failTitle")}
        description={resolveLanguageKey("failDescription")}
        onClick={onRefresh}
      />
    );
  }

  const summary = dashboardData?.summary;
  const totalInspections = summary?.totalInspections ?? 0;
  const inspectionsByStatus = summary?.inspections?.byStatus ?? {};
  const followUpRequiredCount = summary?.inspections?.followUpRequiredCount ?? 0;
  const openModificationRequests = summary?.openModificationRequests ?? 0;
  const modificationRequestsByStatus = summary?.modificationRequests?.byStatus ?? {};
  const totalModificationRequests = Object.values(modificationRequestsByStatus).reduce((a, b) => a + b, 0);

  const ctx = drillDownContext;
  const link = viewEntriesLabel;

  const inspectionStatusLabel = (status: string) =>
    resolveLanguageKey(`inspectionStatus.${status}`, true) ?? status;
  const modificationRequestStatusLabel = (status: string) =>
    resolveLanguageKey(`modificationRequestStatus.${status}`, true) ?? status;

  return (
    <div className={DASHBOARD_TAB_STACK}>
      <div className={DASHBOARD_TAB_INTRO}>
        <h2 className="text-sm font-semibold">{resolveLanguageKey("title")}</h2>
        <p className="text-xs text-muted-foreground">{resolveLanguageKey("description")}</p>
      </div>

      <DashboardKpiSection
        title={resolveLanguageKey("inspectionsSection")}
        description={resolveLanguageKey("inspectionsSectionDesc")}
      >
        <div className={GRID_KPI}>
          <KpiCard compact title={resolveLanguageKey("totalInspections")} value={formatNumber(totalInspections)} subtitle={resolveLanguageKey("totalInspectionsDesc")} icon={IconFileCheck} href={kpi.kpiTotalInspections(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("followUpRequired")} value={formatNumber(followUpRequiredCount)} subtitle={resolveLanguageKey("followUpRequiredDesc")} icon={IconAlertCircle} variant="warning" href={kpi.kpiFollowUpInspections(ctx)} linkLabel={link} />
        </div>
        {Object.keys(inspectionsByStatus).length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-2xs font-medium text-muted-foreground">
              {resolveLanguageKey("inspectionsByStatus")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(inspectionsByStatus).map(([status, count]) => (
                <Badge key={status} variant="outline" className="text-2xs font-medium">
                  {inspectionStatusLabel(status)}: {count}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </DashboardKpiSection>

      <DashboardKpiSection
        title={resolveLanguageKey("modificationRequestsSection")}
        description={resolveLanguageKey("modificationRequestsSectionDesc")}
      >
        <div className={GRID_KPI}>
          <KpiCard compact title={resolveLanguageKey("totalModificationRequests")} value={formatNumber(totalModificationRequests)} subtitle={resolveLanguageKey("totalModificationRequestsDesc")} icon={IconFileText} href={kpi.kpiTotalModificationRequests(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("openModificationRequests")} value={formatNumber(openModificationRequests)} subtitle={resolveLanguageKey("openModificationRequestsDesc")} icon={IconFileText} variant="warning" href={kpi.kpiOpenModificationRequests(ctx)} linkLabel={link} />
        </div>
        {Object.keys(modificationRequestsByStatus).length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-2xs font-medium text-muted-foreground">
              {resolveLanguageKey("modificationRequestsByStatus")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(modificationRequestsByStatus).map(([status, count]) => (
                <Badge key={status} variant="outline" className="text-2xs font-medium">
                  {modificationRequestStatusLabel(status)}: {count}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </DashboardKpiSection>
    </div>
  );
}

export default compose(
  withLanguage("src/modules/propertyManagement/clients/panel/private/overview/workflows/index.tsx")
)(WorkflowsTab);
