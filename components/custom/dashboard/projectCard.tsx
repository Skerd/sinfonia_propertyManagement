import { compose } from 'redux';
import {
    IconBuilding,
    IconCalendar,
    IconMapPin,
} from '@tabler/icons-react';
import type { Project } from 'armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts';
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import TruncatedValue from "@coreModule/components/viewEngine/widgets/display/truncatedValue.tsx";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityStatusBreakdown} from "@propertyManagementModule/components/custom/cards/EntityStatusBreakdown.tsx";
import {unitsByStatusToEntityStats} from "@propertyManagementModule/components/custom/cards/entityStatus.types.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";

export interface ProjectStats {
  sold: number;
  reserved: number;
  available: number;
  blocked: number;
  leased: number;
  totalUnits: number;
  totalValue: number;
  collectedAmount: number;
}

/** Derive project stats from API Project (statistics). Uses unitsByStatus when present. */
export function getProjectStatsFromStatistics(project: Project): ProjectStats {
  const stats = project.statistics;
  const totalUnits = stats?.totalUnits ?? 0;
  const totalValue =
    stats?.totalInvestmentValue?.reduce((acc, inv) => acc + (inv?.value ?? 0), 0) ?? 0;
  const breakdown = unitsByStatusToEntityStats(stats?.unitsByStatus, totalUnits);
  return {
    sold: breakdown.sold,
    reserved: breakdown.reserved,
    available: breakdown.available,
    blocked: breakdown.blocked,
    leased: breakdown.leased,
    totalUnits,
    totalValue,
    collectedAmount: 0,
  };
}

export interface DashboardProjectCardProps extends WithLanguageType {
  project: Project;
  stats?: Partial<ProjectStats>;
  onClick: () => void;
  isSelected?: boolean;
  locationLabel?: string;
  createdAt?: string;
}

function DashboardProjectCardInner({
  resolveLanguageKey,
  project,
  stats: statsOverride,
  onClick,
  isSelected,
  locationLabel,
  createdAt,
}: DashboardProjectCardProps) {
  const baseStats = getProjectStatsFromStatistics(project);
  const stats: ProjectStats = {
    ...baseStats,
    ...statsOverride,
  };
  const edificesCount = project.statistics?.totalEdifices ?? 0;

  return (
    <EntityCardShell isSelected={isSelected} onClick={onClick} className="group p-5 gap-4">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="mb-4 flex min-w-0 items-start justify-between relative z-10">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={cn(
              'shrink-0 p-2.5 rounded-xl transition-colors duration-300',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/20 text-primary group-hover:bg-primary/30'
            )}
          >
            <IconBuilding size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <TruncatedValue
              as="h3"
              text={project.name}
              className="block w-full font-display text-base font-semibold leading-tight"
            >
              {project.name}
            </TruncatedValue>
            {locationLabel != null && locationLabel !== '' ? (
              <div className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <IconMapPin size={12} className="shrink-0" />
                <TruncatedValue
                  as="span"
                  text={locationLabel}
                  className="block min-w-0 flex-1 text-xs text-muted-foreground"
                >
                  {locationLabel}
                </TruncatedValue>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <EntityStatusBreakdown
        stats={stats}
        resolveLanguageKey={resolveLanguageKey}
        totalValue={stats.totalValue}
        collectedAmount={stats.collectedAmount}
        footer={
          <div className="mt-3 flex items-center justify-between text-3xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <IconBuilding size={12} />
              <span>
                {edificesCount} {edificesCount === 1 ? resolveLanguageKey('edifice') : resolveLanguageKey('edifices')}
              </span>
            </div>
            {createdAt != null && (
              <div className="flex items-center gap-1.5">
                <IconCalendar size={12} />
                <span>{formatDate(createdAt, {format: DATE_FORMATS.date})}</span>
              </div>
            )}
          </div>
        }
      />
    </EntityCardShell>
  );
}

export const DashboardProjectCard = compose(
  withLanguage("src/modules/propertyManagement/components/custom/dashboard/projectCard.tsx")
)(DashboardProjectCardInner);
