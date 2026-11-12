import {useEffect, useMemo, useState} from "react";
import {compose} from "redux";
import type {TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import type {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import type {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import {FloorPlanGrid} from "./FloorPlanGrid.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@coreModule/components/ui/card.tsx";
import UnitCard from "@propertyManagementModule/clients/panel/private/units/center/cardView/unitCard.tsx";

const FLOORS_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/floor"};
const UNITS_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/unit"};

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
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    // Floors and units load once per building.
    const [fetchCount, setFetchCount] = useState(0);
    useEffect(() => {
        setSelectedUnit(null);
        setFetchCount((count) => count + 1);
    }, [edificeId]);
    const floorsRequest = useHttpRequest<TableResponse<Floor>>(FLOORS_REQUEST, {edificeId, limit: 100, offset: 0}, fetchCount);
    const unitsRequest = useHttpRequest<TableResponse<Unit>>(UNITS_REQUEST, {edificeId, limit: 200, offset: 0}, fetchCount);
    const loading = fetchCount === 0 || floorsRequest.loading || unitsRequest.loading;
    const failed = floorsRequest.error != null || unitsRequest.error != null;
    const floors = useMemo(() => (failed ? [] : floorsRequest.data?.data ?? []), [failed, floorsRequest.data]);
    const units = useMemo(() => (failed ? [] : unitsRequest.data?.data ?? []), [failed, unitsRequest.data]);

    return (
        <Card>
            <CardHeader className="border-b pb-4">
                <CardTitle className="font-display font-semibold">{edificeName}</CardTitle>
            </CardHeader>

            <CardContent>
                {
                    loading ?
                        <Loader/>
                        :
                        <div className="lg:grid grid-cols-1 lg:grid-cols-3 lg:gap-6 lg:items-start">
                            {/* Left: Floorplan → Unit detail → Units list */}
                            <div className="flex flex-col gap-6 min-w-0 col-span-2">
                                <Card size="sm" className="col-span-2">
                                    <CardContent>
                                        <FloorPlanGrid
                                            units={units}
                                            floors={floors}
                                            projectId={projectId}
                                            projectName={projectName}
                                            edificeId={edificeId}
                                            edificeName={edificeName}
                                            onUnitClick={(unit) => {setSelectedUnit(unit);}}
                                            floorPlanTitle={resolveLanguageKey("floorPlan")}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                            {
                                selectedUnit &&
                                <section className="shrink-0">
                                    <UnitCard
                                        unit={selectedUnit}
                                        // fetchId={selectedUnit?._id}
                                    />
                                </section>
                            }
                        </div>
                }
            </CardContent>
        </Card>
    );
}

export const EdificeDetailPanel = compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/dashboard/EdificeDetailPanel.tsx")
)(EdificeDetailPanelInner);
