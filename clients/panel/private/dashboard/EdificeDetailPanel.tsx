import {useEffect, useState} from "react";
import {compose} from "redux";
import type {TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import type {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import type {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import {FloorPlanGrid} from "./FloorPlanGrid.tsx";
import {UnitDetailCard} from "./UnitDetailCard.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";

export interface EdificeDetailPanelProps extends WithLanguageType {
    edificeId: string;
    edificeName?: string;
    projectId?: string;
    projectName?: string;
}

function EdificeDetailPanelInner({
    resolveLanguageKey,
    edificeId,
    edificeName,
    projectId,
    projectName,
}: EdificeDetailPanelProps) {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [clicked, setClicked] = useState(0);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setSelectedUnit(null);
        Promise.all([
            apiClient.post<TableResponse<Floor>>("/api/realEstate/floor", {edificeId, limit: 100, offset: 0}),
            apiClient.post<TableResponse<Unit>>("/api/realEstate/unit", {edificeId, limit: 2000, offset: 0}),
        ])
            .then(([floorRes, unitRes]) => {
                if (!cancelled) {
                    setFloors(floorRes.data?.data ?? []);
                    setUnits(unitRes.data?.data ?? []);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setFloors([]);
                    setUnits([]);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [edificeId]);

    return (
        <div className="flex flex-col rounded-xl border border-border bg-card/50 p-4" style={{border: "0px solid blue"}}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <h3 className="font-display font-semibold">{edificeName}</h3>
            </div>

            <div className="space-y-6 lg:space-y-0">
                {
                    loading ?
                        <Loader/>
                        :
                        <div className="lg:grid grid-cols-1 lg:grid-cols-3 lg:gap-6 lg:items-start" style={{border: "0px solid yellow"}}>
                            {/* Left: Floorplan → Unit detail → Units list */}
                            <div className="flex flex-col gap-6 min-w-0 col-span-2" style={{border: "0px solid red"}}>
                                <section className="col-span-2 border rounded-lg p-4">
                                    <FloorPlanGrid
                                        units={units}
                                        floors={floors}
                                        projectId={projectId}
                                        projectName={projectName}
                                        edificeId={edificeId}
                                        edificeName={edificeName}
                                        onUnitClick={(unit) => {setSelectedUnit(unit); setClicked(Date.now())}}
                                        floorPlanTitle={resolveLanguageKey("floorPlan")}
                                    />
                                </section>
                            </div>
                            {
                                selectedUnit &&
                                <section className="shrink-0">
                                    <UnitDetailCard
                                        unit={selectedUnit}
                                        projectId={projectId}
                                        projectName={projectName}
                                        edificeId={edificeId}
                                        edificeName={edificeName}
                                        onUnitDeleted={() => setSelectedUnit(null)}
                                        menuOpened={"view"}
                                        clicked={clicked}
                                    />
                                </section>
                            }
                        </div>
                }
            </div>

        </div>
    );
}

export const EdificeDetailPanel = compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/dashboard/EdificeDetailPanel.tsx")
)(EdificeDetailPanelInner);
