import { useEffect, useState } from "react";
import {formatNumber} from "@coreModule/helpers/general";
import {GRID_KPI} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import { useNavigate } from "react-router-dom";
import { compose } from "redux";
import type { DashboardFormResponseType } from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import type { Project } from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";
import {ActionException} from "armonia/src/modules/core/types";
import type {TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import { DashboardProjectCard } from "@propertyManagementModule/components/custom/dashboard/projectCard.tsx";
import { IconBuilding, IconStack, IconTrendingUp } from "@tabler/icons-react";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {KpiDrillDownContext} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import * as kpi from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<ActionException | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProjectsLoading(true);
    setProjectsError(null);
    apiClient.post<TableResponse<Project>>("/api/realEstate/project", { offset: 0, limit: 1000 })
      .then((res) => {
        if (!cancelled && res.data?.data) setProjects(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setProjectsError(err?.response?.data ?? { message: "Failed to load projects" });
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    <div className="flex flex-col gap-y-3">
      <div>
        <h2 className="text-sm font-semibold mb-1">{resolveLanguageKey("title")}</h2>
        <p className="text-muted-foreground text-xs">{resolveLanguageKey("description")}</p>
      </div>

      <div className={GRID_KPI}>
        <KpiCard compact title={resolveLanguageKey("totalProjects")} value={formatNumber(totalProjects)} subtitle={resolveLanguageKey("totalProjectsDesc")} icon={IconBuilding as never} href={kpi.kpiTotalProjects(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("totalEdifices")} value={formatNumber(totalEdifices)} subtitle={resolveLanguageKey("totalEdificesDesc")} icon={IconBuilding as never} href={kpi.kpiTotalEdifices(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("totalFloors")} value={formatNumber(totalFloors)} subtitle={resolveLanguageKey("totalFloorsDesc")} icon={IconStack as never} href={kpi.kpiTotalFloors(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("totalUnits")} value={formatNumber(totalUnits)} subtitle={resolveLanguageKey("totalUnitsDesc")} icon={IconStack as never} href={kpi.kpiUnitsTotal(ctx)} linkLabel={link} />
      </div>

      <div className={GRID_KPI}>
        <KpiCard compact title={resolveLanguageKey("unitsSold")} value={formatNumber(unitsSold)} subtitle={resolveLanguageKey("unitsSoldDesc")} icon={IconTrendingUp as never} variant="success" href={kpi.kpiUnitsSold(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("avgUnitsPerProject")} value={avgUnitsPerProject} subtitle={resolveLanguageKey("avgUnitsPerProjectDesc")} icon={IconStack as never} href={kpi.kpiUnitsTotal(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("avgFloorsPerEdifice")} value={avgFloorsPerEdifice} subtitle={resolveLanguageKey("avgFloorsPerEdificeDesc")} icon={IconBuilding as never} href={kpi.kpiTotalFloors(ctx)} linkLabel={link} />
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2">{resolveLanguageKey("projectCards")}</h3>
        {
          projectsLoading ?
          <Loader />
          : projectsError ?
          <p className="text-muted-foreground text-xs">{resolveLanguageKey("failDescription")}</p>
          :
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                          if (project.name) params.set("projectName", project.name);
                          navigate(`/realEstate/edifices?${params.toString()}`);
                        }}
                    />
                )
              })
            }
          </div>
        }
      </div>
    </div>
  );
}

export default compose(
  withLanguage("src/modules/propertyManagement/clients/panel/private/overview/projects/index.tsx")
)(ProjectsTab);
