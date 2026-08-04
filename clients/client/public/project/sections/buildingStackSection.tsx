import {useState} from "react";
import {MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import {PUBLIC_BODY, PUBLIC_HEADING} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type BuildingStackSectionProps = {
    project: MarketingProjectSingle;
    onUnitSelect: (unitId: string) => void;
};

const statusColors = {
    available: "bg-success",
    reserved: "bg-warning/20",
    sold: "bg-destructive/20",
};

function BuildingStackSection({project, onUnitSelect}: BuildingStackSectionProps) {
    const [expandedEdifice, setExpandedEdifice] = useState<string | null>(project.edifices?.[0]?._id ?? null);

    return (
        <section className="py-12">
            <h2 className={`mb-8 ${PUBLIC_HEADING}`}>Building stack</h2>
            <div className="flex flex-col gap-y-4">
                {project.edifices?.map((edifice) => (
                    <div key={edifice._id} className="overflow-hidden rounded-sm border border-pronix-border">
                        <button
                            type="button"
                            onClick={() => setExpandedEdifice(expandedEdifice === edifice._id ? null : edifice._id)}
                            className="flex w-full items-center justify-between bg-muted px-6 py-4 text-left"
                        >
                            <span className={`${PUBLIC_BODY} font-aeonik-medium text-pronix-ink`}>{edifice.name}</span>
                            <span className="font-aeonik-light text-pronix-ink-muted">{edifice.floors?.length ?? 0} floors</span>
                        </button>
                        {expandedEdifice === edifice._id && (
                            <div className="divide-y divide-pronix-border">
                                {edifice.floors?.map((floor) => (
                                    <div key={floor._id} className="px-6 py-4">
                                        <p className="mb-3 font-aeonik-medium text-base text-pronix-ink">{floor.name}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {floor.units?.map((unit) => (
                                                <button
                                                    key={unit._id}
                                                    type="button"
                                                    onClick={() => onUnitSelect(unit._id)}
                                                    className="group flex items-center gap-2 rounded-xs border border-pronix-border px-3 py-2 transition hover:border-pronix-blue"
                                                >
                                                    <span className={cn("size-2 rounded-full", statusColors[unit.status])} />
                                                    <span className="font-aeonik-light text-sm text-pronix-ink group-hover:text-pronix-blue">{unit.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default BuildingStackSection;
