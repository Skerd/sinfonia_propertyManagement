import {compose} from 'redux';
import {IconBuilding, IconMapPin} from '@tabler/icons-react';
import type {Edifice, EdificeMoneyByCurrency} from 'armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts';
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import TruncatedValue from "@coreModule/components/viewEngine/widgets/display/truncatedValue.tsx";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityStatusBreakdown} from "@propertyManagementModule/components/custom/cards/EntityStatusBreakdown.tsx";
import {unitsByStatusToEntityStats} from "@propertyManagementModule/components/custom/cards/entityStatus.types.ts";

export interface EdificeStats {
    sold: number;
    reserved: number;
    available: number;
    blocked: number;
    leased: number;
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
        <div className="min-w-0 p-0.5">
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
                            <IconBuilding size={20}/>
                        </div>
                        <div className="min-w-0 flex-1">
                            <TruncatedValue
                                as="h3"
                                text={edifice.name}
                                className="block w-full font-display text-base font-semibold leading-tight"
                            >
                                {edifice.name}
                            </TruncatedValue>
                            {locationLabel !== '' ? (
                                <div className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                                    <IconMapPin size={12} className="shrink-0"/>
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
