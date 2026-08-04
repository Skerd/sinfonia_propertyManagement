import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import axios from "axios";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type { Floor } from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import Loader from "@coreModule/components/custom/loader.tsx";
import SimpleError from "@coreModule/components/custom/errorViewWrapper.tsx";
import PolygonSelector, { type PolygonPoint } from "@coreModule/components/custom/polygonSelector.tsx";
import type { ResolveLanguageKey } from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Alert, AlertDescription, AlertTitle} from "@coreModule/components/ui/alert.tsx";
import {TriangleAlert} from "lucide-react";

const EMPTY_POLYGON: PolygonPoint[] = [];

export type FormUnitPolygonProps = {
    resolveLanguageKey: ResolveLanguageKey;
    loading?: boolean;
    formExtras?: Record<string, unknown>;
    floorField?: string;
    polygonField?: string;
    closedField?: string;
    projectField?: string;
    edificeField?: string;
    hintKey?: string;
    errorLoadingKey?: string;
    noImageKey?: string;
};

/**
 * Loads floor main image and edits unit polygon in form state (0–1 coords on floor plan).
 * formExtras.unitId: when set (edit), excludes current unit from phantom overlays.
 */
export default function FormUnitPolygon({
    resolveLanguageKey,
    loading = false,
    formExtras,
    floorField = "floor",
    polygonField = "polygonCoordinates",
    closedField = "polygonClosed",
    projectField = "project",
    edificeField = "edifice",
    hintKey = "selectUnitLocation",
    errorLoadingKey = "errorLoadingFloor",
    noImageKey = "floorNoMainImage",
}: FormUnitPolygonProps) {
    const form = useFormContext();
    const floorId = useWatch({ control: form.control, name: floorField as any }) as string | undefined;
    const watchedPolygon = useWatch({ control: form.control, name: polygonField as any }) as PolygonPoint[] | undefined;
    const unitId = (formExtras as { unitId?: string } | undefined)?.unitId;

    const polygonSig =
        watchedPolygon?.length && watchedPolygon.every((p) => typeof p?.x === "number" && typeof p?.y === "number")
            ? watchedPolygon.map((p) => `${p.x}:${p.y}`).join(";")
            : "";
    const initialPointsStable = useMemo(() => {
        if (!watchedPolygon?.length) return EMPTY_POLYGON;
        return watchedPolygon;
    }, [polygonSig, watchedPolygon]);

    const [floorData, setFloorData] = useState<Floor | null>(null);
    const [loadingFloor, setLoadingFloor] = useState(false);
    const [floorError, setFloorError] = useState(false);
    const lastLoadedFloorIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!floorId) {
            setFloorData(null);
            setLoadingFloor(false);
            setFloorError(false);
            lastLoadedFloorIdRef.current = undefined;
            return;
        }

        const ac = new AbortController();
        setFloorError(false);

        const switchingFloor =
            lastLoadedFloorIdRef.current !== undefined && lastLoadedFloorIdRef.current !== floorId;
        if (switchingFloor) {
            setFloorData(null);
        }

        const alreadyShowing = lastLoadedFloorIdRef.current === floorId;
        if (!alreadyShowing) {
            setLoadingFloor(true);
        }

        apiClient
            .post<Floor>(`/api/realEstate/floor/single`, { _id: floorId }, { signal: ac.signal })
            .then((res) => {
                const data = res.data;
                setFloorData(data);
                lastLoadedFloorIdRef.current = floorId;
                const pid = data?.project && typeof data.project === "object" ? (data.project as { _id?: string })._id : undefined;
                const eid = data?.edifice && typeof data.edifice === "object" ? (data.edifice as { _id?: string })._id : undefined;
                if (pid) {
                    form.setValue(projectField as any, String(pid), { shouldValidate: false, shouldDirty: false });
                }
                if (eid) {
                    form.setValue(edificeField as any, String(eid), { shouldValidate: false, shouldDirty: false });
                }
                setFloorError(false);
            })
            .catch((err: unknown) => {
                if (axios.isCancel(err)) return;
                setFloorError(true);
                setFloorData(null);
                lastLoadedFloorIdRef.current = undefined;
            })
            .finally(() => {
                if (!ac.signal.aborted) setLoadingFloor(false);
            });

        return () => ac.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- RHF setters stable
    }, [floorId, projectField, edificeField]);

    const prevFloorIdRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        const prev = prevFloorIdRef.current;
        if (prev !== undefined && prev !== floorId) {
            form.setValue(polygonField as any, [] as any, { shouldValidate: false });
            form.setValue(closedField as any, false, { shouldValidate: false });
        }
        prevFloorIdRef.current = floorId;
    }, [floorId, form, polygonField, closedField]);

    if (!floorId ){
        return (
            <Alert>
                <TriangleAlert className="h-4 w-4"/>
                <AlertTitle>{resolveLanguageKey("noFloorSelectedTitle")}</AlertTitle>
                <AlertDescription>{resolveLanguageKey("noFloorSelectedDescription")}</AlertDescription>
            </Alert>
        )
    }

    if (loadingFloor) {
        return <Loader />;
    }
    if (floorError || !floorData) {
        return (
            <SimpleError
                title={resolveLanguageKey("errorTitle")}
                description={resolveLanguageKey(errorLoadingKey)}
            />
        );
    }

    const mainImage = floorData.mainImage as { _id?: string } | string | undefined;
    const imageId = typeof mainImage === "object" && mainImage ? mainImage._id : mainImage;
    if (!imageId) {
        return <p className="text-sm text-muted-foreground">{resolveLanguageKey(noImageKey)}</p>;
    }

    const phantomRaw =
        (floorData as { unitsCoordinates?: { _id: string; name: string; polygonCoordinates: PolygonPoint[] }[] })
            .unitsCoordinates || [];
    const phantomPoints = (unitId ? phantomRaw.filter((u) => u._id !== unitId) : phantomRaw) as {
        _id: string;
        name: string;
        polygonCoordinates: PolygonPoint[];
    }[];

    return (
        <div className="flex flex-col gap-y-2">
            <p className="text-sm text-muted-foreground">{resolveLanguageKey(hintKey)}</p>
            <PolygonSelector
                resolveLanguageKey={resolveLanguageKey}
                imageUrl={`/api/auxiliary/media/${imageId}`}
                phantomPoints={phantomPoints}
                initialPoints={initialPointsStable}
                onPointsChange={(pts: PolygonPoint[]) => {
                    form.setValue(polygonField as any, pts as any, { shouldValidate: true, shouldDirty: true });
                }}
                onClosedChange={(closed: boolean) => {
                    form.setValue(closedField as any, closed, { shouldValidate: true, shouldDirty: true });
                }}
                disabled={loading}
                key={String(floorData._id) + String(imageId)}
            />
        </div>
    );
}
