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
import type { Project } from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";
import {ActionException} from "armonia/src/modules/core/types";
import type {TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import { DashboardProjectCard } from "@propertyManagementModule/components/custom/dashboard/projectCard.tsx";
import { DashboardKpiGrid, DashboardKpiSection, DashboardSectionGrid } from "@propertyManagementModule/components/custom/dashboard/DashboardKpiSection.tsx";
import { IconBuilding, IconStack, IconTrendingUp } from "@tabler/icons-react";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errors/errorView.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {KpiDrillDownContext} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import * as kpi from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";

const PROJECTS_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/project"};
// The table API caps a page at 200 records; a larger limit is rejected with a 400.
const PROJECTS_REQUEST_BODY = {offset: 0, limit: 200};

type ProjectsTabProps = WithLanguageType & {
  dashboardData: DashboardFormResponseType | null | undefined;
  loading: boolean;
  error: ActionException | null;
  onRefresh: () => void;
  drillDownContext: KpiDrillDownContext;
  viewEntriesLabel: string;
};

function ProjectsTab({ resolveLanguageKey, dashboardData, loading, error, onRefresh, drillDownContext, viewEntriesLabel }: ProjectsTabProps) {
  const navigate = useNavigate();
  const [projectsFetchCount, setProjectsFetchCount] = useState(1);
  const projectsRequest = useHttpRequest<TableResponse<Project>>(PROJECTS_REQUEST, PROJECTS_REQUEST_BODY, projectsFetchCount);
  const projects = useMemo(() => projectsRequest.data?.data ?? [], [projectsRequest.data]);
  const projectsLoading = projectsRequest.loading;
  const projectsError = projectsRequest.error;
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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
  const totalProjects = summary?.totalProjects ?? 0;
  const totalEdifices = summary?.totalEdifices ?? 0;
  const totalFloors = summary?.totalFloors ?? 0;
  const totalUnits = summary?.totalUnits ?? 0;
  const unitsSold = summary?.unitsByStatus?.sold ?? 0;
  const avgUnitsPerProject = totalProjects > 0 ? (totalUnits / totalProjects).toFixed(1) : "0";
  const avgFloorsPerEdifice = totalEdifices > 0 ? (totalFloors / totalEdifices).toFixed(1) : "0";

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
            <KpiCard compact title={resolveLanguageKey("totalProjects")} {...kpiCount(totalProjects)} subtitle={resolveLanguageKey("totalProjectsDesc")} icon={IconBuilding} href={kpi.kpiTotalProjects(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("totalEdifices")} {...kpiCount(totalEdifices)} subtitle={resolveLanguageKey("totalEdificesDesc")} icon={IconBuilding} href={kpi.kpiTotalEdifices(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("totalFloors")} {...kpiCount(totalFloors)} subtitle={resolveLanguageKey("totalFloorsDesc")} icon={IconStack} href={kpi.kpiTotalFloors(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("totalUnits")} {...kpiCount(totalUnits)} subtitle={resolveLanguageKey("totalUnitsDesc")} icon={IconStack} href={kpi.kpiUnitsTotal(ctx)} linkLabel={link} />
          </DashboardKpiGrid>
        </DashboardKpiSection>
        <DashboardKpiSection
          title={resolveLanguageKey("performanceSection")}
          description={resolveLanguageKey("performanceSectionDesc")}
        >
          <DashboardKpiGrid>
            <KpiCard compact title={resolveLanguageKey("unitsSold")} {...kpiCount(unitsSold)} subtitle={resolveLanguageKey("unitsSoldDesc")} icon={IconTrendingUp} variant="success" href={kpi.kpiUnitsSold(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("avgUnitsPerProject")} value={avgUnitsPerProject} subtitle={resolveLanguageKey("avgUnitsPerProjectDesc")} icon={IconStack} href={kpi.kpiUnitsTotal(ctx)} linkLabel={link} />
            <KpiCard compact title={resolveLanguageKey("avgFloorsPerEdifice")} value={avgFloorsPerEdifice} subtitle={resolveLanguageKey("avgFloorsPerEdificeDesc")} icon={IconBuilding} href={kpi.kpiTotalFloors(ctx)} linkLabel={link} />
          </DashboardKpiGrid>
        </DashboardKpiSection>
      </DashboardSectionGrid>

      <DashboardKpiSection
        title={resolveLanguageKey("projectCards")}
        description={resolveLanguageKey("projectCardsDesc")}
      >
        {
          projectsLoading ?
          <Loader />
          : projectsError ?
          <ErrorView
            title={resolveLanguageKey("failTitle")}
            description={resolveLanguageKey("failDescription")}
            onClick={() => setProjectsFetchCount((count) => count + 1)}
          />
          :
          <div className={DASHBOARD_ENTITY_GRID}>
            {
              projects.map((project) => {
                return (
                    <DashboardProjectCard
                        key={project._id}
                        project={project}
                        locationLabel={project.description}
                        isSelected={selectedProjectId === project._id}
                        onClick={() => {
                          setSelectedProjectId(project._id);
                          const params = new URLSearchParams();
                          params.set("projectId", project._id);
                          params.set("qf_project", project._id);
                          if (project.name) {
                              params.set("projectName", project.name);
                              params.set("qf_project_label", project.name);
                          }
                          navigate(`/realEstate/edifices?${params.toString()}`);
                        }}
                    />
                )
              })
            }
          </div>
        }
      </DashboardKpiSection>
    </div>
  );
}

export default compose(
  withLanguage("src/modules/propertyManagement/clients/panel/private/overview/projects/index.tsx")
)(ProjectsTab);
