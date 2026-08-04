import {compose} from 'redux';
import {IconBuilding, IconMapPin} from '@tabler/icons-react';
import type {Edifice, EdificeMoneyByCurrency} from 'armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts';
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityStatusBreakdown} from "@propertyManagementModule/components/custom/cards/EntityStatusBreakdown.tsx";
import {unitsByStatusToEntityStats} from "@propertyManagementModule/components/custom/cards/entityStatus.types.ts";

export interface EdificeStats {
    sold: number;
    reserved: number;
    available: number;
    blocked: number;
    totalUnits: number;
    totalValue: number;
    collectedAmount: number;
}

function sumMoneyByCurrency(entries: EdificeMoneyByCurrency[] | undefined): number {
    return (entries ?? []).reduce((acc, r) => acc + (r?.value ?? 0), 0);
}

export function getEdificeStatsFromStatistics(edifice: Edifice): EdificeStats {
    const stats = edifice.statistics;
    const totalUnits = stats?.totalUnits ?? 0;
    const breakdown = unitsByStatusToEntityStats(stats?.unitsByStatus, totalUnits);
    return {
        ...breakdown,
        totalValue: sumMoneyByCurrency(stats?.totalValue),
        collectedAmount: sumMoneyByCurrency(stats?.collectedAmount),
    };
}

export interface DashboardEdificeCardProps extends WithLanguageType {
    edifice: Edifice;
    onClick: () => void;
    isSelected?: boolean;
}

function DashboardEdificeCardInner({resolveLanguageKey, edifice, onClick, isSelected}: DashboardEdificeCardProps) {
    const stats = getEdificeStatsFromStatistics(edifice);
    const totalFloors = edifice.statistics?.totalFloors ?? 0;
    const locationLabel = edifice.address?.city?.name ?? edifice.project?.name ?? '';

    return (
        <div className="p-0.5">
            <EntityCardShell selectable isSelected={isSelected} onClick={onClick} className="group">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'p-2.5 rounded-xl transition-colors duration-300',
                                isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-primary/20 text-primary group-hover:bg-primary/30'
                            )}
                        >
                            <IconBuilding size={20}/>
                        </div>
                        <div>
                            <h3 className="font-display font-semibold text-base leading-tight">{edifice.name}</h3>
                            {locationLabel !== '' && (
                                <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                                    <IconMapPin size={12}/>
                                    <span>{locationLabel}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <EntityStatusBreakdown
                    stats={stats}
                    resolveLanguageKey={resolveLanguageKey}
                    totalValue={stats.totalValue}
                    collectedAmount={stats.collectedAmount}
                    footer={
                        <div className="mt-3 flex items-center text-3xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <IconBuilding size={12}/>
                                <span>
                                    {totalFloors} {totalFloors === 1 ? resolveLanguageKey('floor') : resolveLanguageKey('floors')}
                                </span>
                            </div>
                        </div>
                    }
                />
            </EntityCardShell>
        </div>
    );
}

export const DashboardEdificeCard = compose(
    withLanguage("src/modules/propertyManagement/components/custom/dashboard/edificeCard.tsx")
)(DashboardEdificeCardInner);

/** @deprecated Use DashboardEdificeCard */
export const EdificeCard = DashboardEdificeCard;
