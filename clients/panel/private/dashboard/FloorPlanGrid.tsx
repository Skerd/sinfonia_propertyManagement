import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import type {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import type {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import {ArrowLeftRight, ArrowRightLeft} from "lucide-react";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import Loader from "@coreModule/components/custom/loader.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {Edifice} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";

const STATUS_CLASS: Record<string, string> = {
    sold_unit: "bg-status-sold/20 border-status-sold text-status-sold",
    reserved_unit: "bg-status-reserved/20 border-status-reserved text-status-reserved",
    available_unit: "bg-status-available/20 border-status-available text-status-available",
    unavailable_unit: "bg-status-blocked/20 border-status-blocked text-status-blocked",
};

function parseFloorLevel(levelNumber: string | number | undefined): number {
    if (levelNumber == null || levelNumber === "") return 0;
    if (typeof levelNumber === "number") {
        return Number.isFinite(levelNumber) ? levelNumber : 0;
    }
    const lower = levelNumber.toLowerCase();
    if (lower.includes("basement") || lower === "b" || lower === "-1") return -1;
    if (lower.includes("ground") || lower === "g" || lower === "0") return 0;
    const num = parseInt(levelNumber, 10);
    return Number.isNaN(num) ? 0 : num;
}

export interface FloorPlanGridProps {
    units: Unit[];
    floors: Floor[];
    onUnitClick?: (unit: Unit) => void;
    projectId?: string;
    projectName?: string;
    edificeId?: string;
    edificeName?: string;
    floorPlanTitle: string
}

export function FloorPlanGrid({
    units,
    floors,
    onUnitClick,
    projectId,
    projectName,
    edificeId,
    edificeName,
    floorPlanTitle
}: FloorPlanGridProps) {
    const navigate = useNavigate();

    const [showOverlay, setShowOverlay] = useState<"blocks" | "image">("blocks");
    const unitsByFloor = useMemo(() => {
        const map = new Map<string, Unit[]>();
        for (const u of units) {
            const floorId = u.floor?._id ?? "unknown";
            if (!map.has(floorId)) map.set(floorId, []);
            map.get(floorId)!.push(u);
        }
        return map;
    }, [units]);

    const [loadingFloorData, setLoadingFloorData] = useState(false);
    const [errorFloorData, setErrorFloorData] = useState<boolean>(false);
    const [floorData, setFloorData] = useState<any>(null);

    const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);

    const sortedFloors = useMemo(() => {
        return [...floors].filter((floor) => {if( !!selectedFloorId ){ return floor._id === selectedFloorId } return true} ).sort((a, b) => parseFloorLevel(b.levelNumber) - parseFloorLevel(a.levelNumber));
    }, [floors, selectedFloorId]);

    const handleUnitClick = (unit: Unit) => {
        if (onUnitClick) {
            onUnitClick(unit);
        } else {
            const params = new URLSearchParams();
            if (projectId) params.set("projectId", projectId);
            if (projectName) params.set("projectName", projectName);
            if (edificeId) params.set("edificeId", edificeId);
            if (edificeName) params.set("edificeName", edificeName);
            params.set("unitId", unit._id);
            if (unit.unitNumber) params.set("unitName", unit.unitNumber);
            navigate(`/realEstate/units/edit?${params.toString()}`);
        }
    };

    const [edificeData, setEdificeData] = useState<Edifice | null>(null);
    const [loadingEdifice, setLoadingEdifice] = useState(false);

    useEffect(() => {
        setEdificeData(null);
        setFloorData(null);
        setSelectedFloorId(null);
        setErrorFloorData(false);
    }, [edificeId]);

    useEffect(() => {
        if (showOverlay !== "image" || !edificeId || !!edificeData) return;
        setLoadingEdifice(true);
        const postBody = {_id: edificeId};

        apiClient.post<Edifice>(`/api/realEstate/edifice/single`, postBody)
            .then((res) => {
                const data = res.data;
                if( !data ){
                    setShowOverlay("blocks");
                }
                else{
                    setEdificeData(data);
                }
            })
            .catch((error) => {
                console.error("Error loading edifice:", error);
                setShowOverlay("blocks");
            })
            .finally(() => setLoadingEdifice(false));
    }, [showOverlay, edificeId, edificeData]);

    useEffect(() => {
        if( showOverlay === "blocks" ){
            setSelectedFloorId(null);
        }
        else{
            setSelectedFloorId(null)
        }
    }, [showOverlay]);

    useEffect(() => {

        if( !selectedFloorId ){
            return;
        }

        setLoadingFloorData(true);
        setErrorFloorData(false);

        apiClient.post("/api/realEstate/floor/single", {_id: selectedFloorId})
            .then((res) => {
                const data = res.data;
                if( !data ){
                    setErrorFloorData(true);
                }
                else{
                    setFloorData(data);
                }
                setLoadingFloorData(false);
            })
            .catch(() => {
                setLoadingFloorData(false);
                setErrorFloorData(true);
            })
    }, [selectedFloorId])

    return (
        <div className="space-y-2">

            <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => setShowOverlay(showOverlay === "blocks" ? "image" : "blocks")}>
                    {showOverlay === "blocks" ? <ArrowLeftRight /> : <ArrowRightLeft />}
                </Button>
                <h4 className="font-medium">{floorPlanTitle}</h4>
            </div>

            {
                showOverlay === "blocks" ?
                <>
                    {
                        sortedFloors.map((floor) => {
                            const floorUnits = unitsByFloor.get(floor._id) ?? [];
                            return (
                                <div key={floor._id} className="space-y-0 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-2">
                                    <div
                                        className="col-span-1 md:col-span-1 lg:col-span-1 flex items-center justify-center border rounded-lg">
                                        <h4 className="text-xs font-medium text-muted-foreground mb-0">{floor.name ?? floor.levelNumber ?? "—"}</h4>
                                    </div>
                                    <div className="col-span-1 md:col-span-5 lg:col-span-11">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {
                                                floorUnits.map((unit) => {
                                                    const status = unit.status ?? "available_unit";
                                                    const typology = unit.unitType?.name ?? "—";
                                                    const footprint = (Number(unit.area) || 0) + (Number(unit.sharedArea) || 0);
                                                    const area = unit.netArea ?? unit.area ?? (footprint > 0 ? footprint : undefined) ?? "—";
                                                    const areaStr = typeof area === "number" ? `${area} m²` : String(area);
                                                    return (
                                                        <button
                                                            key={unit._id}
                                                            type="button"
                                                            onClick={() => handleUnitClick(unit)}
                                                            className={cn(
                                                                "rounded-lg border p-2 text-left text-xs transition-all hover:scale-[1.02]",
                                                                STATUS_CLASS[status] ?? "bg-muted/20 border-muted text-foreground"
                                                            )}
                                                        >
                                                            <div
                                                                className="font-medium truncate">{unit.unitNumber ?? unit.name ?? unit._id}</div>
                                                            <div className="text-muted-foreground truncate">
                                                                {typology} {areaStr}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    }
                </>
                :
                <div className="flex">
                    {
                        loadingEdifice ?
                        <Loader />
                        : edificeData?.mainImage ?
                        <div className="space-x-2 grid grid-cols-1 xl:grid-cols-2 gap-2 w-full">

                            <PolygonSelector
                                imageUrl={`/api/auxiliary/media/${edificeData.project?.mainImage?._id || edificeData.mainImage._id || edificeData.mainImage}`}
                                dashboard={true}
                                phantomPoints={edificeData?.floorsCoordinates || []}
                                stayHovered={selectedFloorId}
                                onFloorClick={(floor: any) => {
                                    // console.log(floorId)
                                    setSelectedFloorId(floor._id);
                                }}
                                phantomHoverContent={(item: any) => (
                                    <div className="px-2 py-1 w-fit">
                                        <p className="font-bold">
                                            {item.name}
                                        </p>
                                    </div>
                                )}
                                initialPoints={[]}
                                onPointsChange={() => {}}
                                disabled={true}
                            />

                            <div>
                                {
                                    loadingFloorData ?
                                        <Loader />
                                        :
                                        <>
                                            {
                                                errorFloorData || !floorData?.mainImage ?
                                                <>
                                                    {
                                                        sortedFloors.map((floor) => {
                                                            const floorUnits = unitsByFloor.get(floor._id) ?? [];
                                                            if (floorUnits.length === 0) return null;
                                                            return (
                                                                <div key={floor._id} className="space-y-2 w-full">
                                                                    <div className="w-full flex items-center justify-center border rounded-lg">
                                                                        <h4 className="text-xs font-medium text-muted-foreground mb-0">{floor.name ?? floor.levelNumber ?? "—"}</h4>
                                                                    </div>
                                                                    <div className="w-full">
                                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                                            {
                                                                                floorUnits.map((unit) => {
                                                                                    const status = unit.status ?? "available_unit";
                                                                                    const typology = unit.unitType?.name ?? "—";
                                                                                    const footprint = (Number(unit.area) || 0) + (Number(unit.sharedArea) || 0);
                                                                                    const area = unit.netArea ?? unit.area ?? (footprint > 0 ? footprint : undefined) ?? "—";
                                                                                    const areaStr = typeof area === "number" ? `${area} m²` : String(area);
                                                                                    return (
                                                                                        <button
                                                                                            key={unit._id}
                                                                                            type="button"
                                                                                            onClick={() => handleUnitClick(unit)}
                                                                                            className={cn(
                                                                                                "rounded-lg border p-2 text-left text-xs transition-all hover:scale-[1.02]",
                                                                                                STATUS_CLASS[status] ?? "bg-muted/20 border-muted text-foreground"
                                                                                            )}
                                                                                        >
                                                                                            <div
                                                                                                className="font-medium truncate">{unit.unitNumber ?? unit.name ?? unit._id}</div>
                                                                                            <div className="text-muted-foreground truncate">
                                                                                                {typology} {areaStr}
                                                                                            </div>
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    }
                                                </>
                                                :
                                                <PolygonSelector
                                                    imageUrl={`/api/auxiliary/media/${floorData.mainImage._id || floorData.mainImage}`}
                                                    dashboard={true}
                                                    phantomPoints={floorData?.unitsCoordinates || []}
                                                    stayHovered={selectedFloorId}
                                                    onFloorClick={(unit: any) => {
                                                        handleUnitClick(units.find((un) => un._id === unit._id) || unit )
                                                        // console.log(floorId)
                                                        // setSelectedFloorId(floor._id);
                                                    }}
                                                    phantomHoverContent={(item: any) => (
                                                        <div className="px-2 py-1 w-fit">
                                                            <p className="font-bold">
                                                                {item.name}
                                                            </p>
                                                        </div>
                                                    )}
                                                    initialPoints={[]}
                                                    onPointsChange={() => {}}
                                                    disabled={true}
                                                />
                                            }
                                        </>
                                }
                            </div>

                        </div>
                        :
                        <></>
                    }

                </div>
            }
        </div>
    );
}
