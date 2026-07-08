import { compose } from "redux";
import type { DashboardFormResponseType } from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import { ActionException } from "armonia/src/modules/core/types";
import { Badge } from "@coreModule/components/ui/badge.tsx";
import { IconAlertCircle, IconFileCheck, IconFileText } from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
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

function WorkflowsTab({ resolveLanguageKey, dashboardData, loading, error, onRefresh, drillDownContext, viewEntriesLabel }: WorkflowsTabProps) {
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

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold mb-1">{resolveLanguageKey("title")}</h2>
        <p className="text-muted-foreground text-xs">{resolveLanguageKey("description")}</p>
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2">{resolveLanguageKey("inspectionsSection")}</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <KpiCard compact title={resolveLanguageKey("totalInspections")} value={totalInspections.toLocaleString()} subtitle={resolveLanguageKey("totalInspectionsDesc")} icon={IconFileCheck as never} href={kpi.kpiTotalInspections(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("followUpRequired")} value={followUpRequiredCount.toLocaleString()} subtitle={resolveLanguageKey("followUpRequiredDesc")} icon={IconAlertCircle as never} variant="warning" href={kpi.kpiFollowUpInspections(ctx)} linkLabel={link} />
        </div>
        {Object.keys(inspectionsByStatus).length > 0 && (
          <div className="mt-3">
            <p className="text-muted-foreground text-[11px] font-medium mb-1.5">
              {resolveLanguageKey("inspectionsByStatus")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(inspectionsByStatus).map(([status, count]) => (
                <Badge key={status} variant="outline" className="text-[11px] font-medium">
                  {status}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2">{resolveLanguageKey("modificationRequestsSection")}</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <KpiCard compact title={resolveLanguageKey("totalModificationRequests")} value={totalModificationRequests.toLocaleString()} subtitle={resolveLanguageKey("totalModificationRequestsDesc")} icon={IconFileText as never} href={kpi.kpiTotalModificationRequests(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("openModificationRequests")} value={openModificationRequests.toLocaleString()} subtitle={resolveLanguageKey("openModificationRequestsDesc")} icon={IconFileText as never} variant="warning" href={kpi.kpiOpenModificationRequests(ctx)} linkLabel={link} />
        </div>
        {Object.keys(modificationRequestsByStatus).length > 0 && (
          <div className="mt-3">
            <p className="text-muted-foreground text-[11px] font-medium mb-1.5">
              {resolveLanguageKey("modificationRequestsByStatus")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(modificationRequestsByStatus).map(([status, count]) => (
                <Badge key={status} variant="outline" className="text-[11px] font-medium">
                  {status}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default compose(
  withLanguage("src/modules/propertyManagement/clients/panel/private/overview/workflows/index.tsx")
)(WorkflowsTab);
