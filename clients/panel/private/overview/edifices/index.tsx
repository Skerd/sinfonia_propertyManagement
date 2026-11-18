import { useMemo, useState } from "react";
import {kpiCount} from "@propertyManagementModule/helpers/dashboard/kpiValue.ts";
import {
  DASHBOARD_TAB_STACK,
  DASHBOARD_TAB_INTRO,
  DASHBOARD_ENTITY_GRID,
} from "@coreModule/components/entityPage/list/entityCard.constants.ts";
import { useNavigate } from "react-router-dom";
import { compose } from "redux";
import type { DashboardFormResponseType } from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import type { Edifice } from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import { ActionException } from "armonia/src/modules/core/types";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import { DashboardEdificeCard } from "@propertyManagementModule/components/custom/dashboard/edificeCard.tsx";
import { DashboardKpiGrid, DashboardKpiSection, DashboardSectionGrid } from "@propertyManagementModule/components/custom/dashboard/DashboardKpiSection.tsx";
import {IconBan, IconBuildingSkyscraper, IconCalendarTime, IconKey, IconPackage, IconStack2, IconTrendingUp} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {ErrorView} from "@coreModule/components/custom/errors/errorView.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import {TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import type {KpiDrillDownContext} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import * as kpi from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";

const EDIFICES_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/edifice"};
// The table API caps a page at 200 records; a larger limit is rejected with a 400.
const EDIFICES_REQUEST_BODY = {offset: 0, limit: 200};

type EdificesTabProps = WithLanguageType & {
  dashboardData: DashboardFormResponseType | null | undefined;
  loading: boolean;
  error: ActionException | null;
  onRefresh: () => void;
  drillDownContext: KpiDrillDownContext;
  viewEntriesLabel: string;
};

function EdificesTab({ resolveLanguageKey, dashboardData, loading, error, onRefresh, drillDownContext, viewEntriesLabel }: EdificesTabProps) {
  const navigate = useNavigate();
  const [edificesFetchCount, setEdificesFetchCount] = useState(1);
  const edificesRequest = useHttpRequest<TableResponse<Edifice>>(EDIFICES_REQUEST, EDIFICES_REQUEST_BODY, edificesFetchCount);
  const edifices = useMemo(() => edificesRequest.data?.data ?? [], [edificesRequest.data]);
  const edificesLoading = edificesRequest.loading;
  const edificesError = edificesRequest.error;
  const [selectedEdificeId, setSelectedEdificeId] = useState<string | null>(null);
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
  const totalEdifices = summary?.totalEdifices ?? 0;
  const totalFloors = summary?.totalFloors ?? 0;
  const totalUnits = summary?.totalUnits ?? 0;
  const available = summary?.unitsByStatus?.available ?? 0;
  const reserved = summary?.unitsByStatus?.reserved ?? 0;
  const sold = summary?.unitsByStatus?.sold ?? 0;
  const leased = summary?.unitsByStatus?.leased ?? 0;
  const unavailable = summary?.unitsByStatus?.unavailable ?? 0;
  const avgFloorsPerEdifice = totalEdifices > 0 ? (totalFloors / totalEdifices).toFixed(1) : "0";
  const avgUnitsPerEdifice = totalEdifices > 0 ? (totalUnits / totalEdifices).toFixed(1) : "0";

  const ctx = drillDownContext;
  const link = viewEntriesLabel;

  return (
    <div className={DASHBOARD_TAB_STACK}>
      <div className={DASHBOARD_TAB_INTRO}>
        <h2 className="text-sm font-semibold">{resolveLanguageKey("title")}</h2>
        <p className="text-xs text-muted-foreground">{resolveLanguageKey("description")}</p>
      </div>

      <DashboardSectionGrid>
        <DashboardKpiSection
          title={resolveLanguageKey("structureSection")}
          description={resolveLanguageKey("structureSectionDesc")}
        >
          <DashboardKpiGrid>
            <KpiCard compact title={resolveLanguageKey("totalEdifices")} {...kpiCount(totalEdifices)} subtitle={resolveLanguageKey("totalEdificesDesc")} icon={IconBuildingSkyscraper} href={kpi.kpiTotalEdifices(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("totalFloors")} {...kpiCount(totalFloors)} subtitle={resolveLanguageKey("totalFloorsDesc")} icon={IconStack2} href={kpi.kpiTotalFloors(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("totalUnits")} {...kpiCount(totalUnits)} subtitle={resolveLanguageKey("totalUnitsDesc")} icon={IconStack2} href={kpi.kpiUnitsTotal(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("avgFloorsPerEdifice")} value={avgFloorsPerEdifice} subtitle={resolveLanguageKey("avgFloorsPerEdificeDesc")} icon={IconBuildingSkyscraper} href={kpi.kpiTotalFloors(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("avgUnitsPerEdifice")} value={avgUnitsPerEdifice} subtitle={resolveLanguageKey("avgUnitsPerEdificeDesc")} icon={IconStack2} href={kpi.kpiUnitsTotal(ctx)} linkLabel={link} />
          </DashboardKpiGrid>
        </DashboardKpiSection>
        <DashboardKpiSection
          title={resolveLanguageKey("unitsByStatus")}
          description={resolveLanguageKey("unitsByStatusDesc")}
        >
          <DashboardKpiGrid>
            <KpiCard compact title={resolveLanguageKey("available")} {...kpiCount(available)} icon={IconPackage} href={kpi.kpiUnitsAvailable(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("reserved")} {...kpiCount(reserved)} icon={IconCalendarTime} variant="warning" href={kpi.kpiUnitsReserved(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("sold")} {...kpiCount(sold)} icon={IconTrendingUp} variant="success" href={kpi.kpiUnitsSold(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("leased")} {...kpiCount(leased)} icon={IconKey} href={kpi.kpiUnitsRented(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("unavailable")} {...kpiCount(unavailable)} icon={IconBan} variant="danger" href={kpi.kpiUnitsUnavailable(ctx)} linkLabel={link} />
          </DashboardKpiGrid>
        </DashboardKpiSection>
      </DashboardSectionGrid>

      <DashboardKpiSection
        title={resolveLanguageKey("edificeCards")}
        description={resolveLanguageKey("edificeCardsDesc")}
      >
        {edificesLoading ? (
          <Loader />
        ) : edificesError ? (
          <ErrorView
            title={resolveLanguageKey("failTitle")}
            description={resolveLanguageKey("failDescription")}
            onClick={() => setEdificesFetchCount((count) => count + 1)}
          />
        ) : (
          <div className={DASHBOARD_ENTITY_GRID}>
            {edifices.map((edifice) => (
              <DashboardEdificeCard
                key={edifice._id}
                edifice={edifice}
                isSelected={selectedEdificeId === edifice._id}
                onClick={() => {
                  setSelectedEdificeId(edifice._id);
                  const params = new URLSearchParams();
                  params.set("edificeId", edifice._id);
                  params.set("qf_edifice", edifice._id);
                  if (edifice.name) {
                      params.set("edificeName", edifice.name);
                      params.set("qf_edifice_label", edifice.name);
                  }
                  if (edifice.project?._id) {
                      params.set("projectId", edifice.project._id);
                      params.set("qf_project", edifice.project._id);
                      if (edifice.project.name) {
                          params.set("projectName", edifice.project.name);
                          params.set("qf_project_label", edifice.project.name);
                      }
                  }
                  navigate(`/realEstate/units?${params.toString()}`);
                }}
              />
            ))}
          </div>
        )}
      </DashboardKpiSection>
    </div>
  );
}

export default compose(
  withLanguage("src/modules/propertyManagement/clients/panel/private/overview/edifices/index.tsx")
)(EdificesTab);
