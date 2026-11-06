import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import SimpleError from "@coreModule/components/custom/errors/errorViewWrapper.tsx";
import PolygonSelector, { type PolygonPoint } from "@coreModule/components/customUnchecked/polygonSelector.tsx";
import type { ResolveLanguageKey } from "@coreModule/helpers/hocs/withLanguage.tsx";
import {IconAlertTriangle} from "@tabler/icons-react";
import {Alert, AlertDescription, AlertTitle} from "@coreModule/components/ui/alert.tsx";
import {Edifice} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import type {Project} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";

const EDIFICE_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/edifice/single"};
const PROJECT_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/project/single"};

const EMPTY_POLYGON: PolygonPoint[] = [];

export type FormFloorPolygonProps = {
    resolveLanguageKey: ResolveLanguageKey;
    loading?: boolean;
    formExtras?: Record<string, unknown>;
    polygonField?: string;
    closedField?: string;
    projectField?: string;
    hintKey?: string;
    errorLoadingKey?: string;
    noImageKey?: string;
};

/**
 * Loads project main image (via edifice → project) and edits floor polygon coordinates in form state.
 * formExtras.floorId: when set (edit), excludes current floor from phantom polygons.
 */
export default function FormFloorPolygon({
    resolveLanguageKey,
    loading = false,
    formExtras,
    polygonField = "polygonCoordinates",
    closedField = "polygonClosed",
    projectField = "project",
    hintKey = "selectFloorLocation",
    errorLoadingKey = "errorLoadingEdifice",
    noImageKey = "projectNoMainImage",
}: FormFloorPolygonProps) {
    const form = useFormContext();
    const edificeId = useWatch({ control: form.control, name: "edifice" }) as string | undefined;
    const watchedPolygon = useWatch({ control: form.control, name: polygonField }) as PolygonPoint[] | undefined;
    const floorId = (formExtras as { floorId?: string } | undefined)?.floorId;

    const polygonSig =
        watchedPolygon?.length && watchedPolygon.every((p) => typeof p?.x === "number" && typeof p?.y === "number")
            ? watchedPolygon.map((p) => `${p.x}:${p.y}`).join(";")
            : "";
    const initialPointsStable = useMemo(() => {
        if (!watchedPolygon?.length) return EMPTY_POLYGON;
        return watchedPolygon;
    }, [polygonSig, watchedPolygon]);

    const [edificeData, setEdificeData] = useState<Edifice | null>(null);
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [loadingEdifice, setLoadingEdifice] = useState(false);
    const [loadingProject, setLoadingProject] = useState(false);
    const [edificeError, setEdificeError] = useState(false);
    const [projectError, setProjectError] = useState(false);
    const lastLoadedEdificeIdRef = useRef<string | undefined>(undefined);
    const lastLoadedProjectIdRef = useRef<string | undefined>(undefined);

    // The building loads once per edificeId, then its project (for the main image) when that differs.
    // Responses for an id that has changed since are dropped.
    const [edificeCount, setEdificeCount] = useState(0);
    const edificeIdRef = useRef(edificeId);
    edificeIdRef.current = edificeId;
    useHttpRequest<Edifice>(EDIFICE_REQUEST, {_id: edificeId}, edificeCount, true, {
        success: (data) => {
            if (edificeIdRef.current !== edificeId) return;
            setEdificeData(data);
            lastLoadedEdificeIdRef.current = edificeId;
            const pid = data?.project && typeof data.project === "object"
                ? (data.project as { _id?: string })._id
                : undefined;
            if (pid) {
                form.setValue(projectField, String(pid), { shouldValidate: false, shouldDirty: false });
                if (lastLoadedProjectIdRef.current !== pid) {
                    setLoadingProject(true);
                    setProjectTarget(String(pid));
                    setProjectCount((count) => count + 1);
                }
            }
            setEdificeError(false);
            setLoadingEdifice(false);
        },
        error: () => {
            if (edificeIdRef.current !== edificeId) return;
            setEdificeError(true);
            setEdificeData(null);
            setProjectData(null);
            lastLoadedEdificeIdRef.current = undefined;
            lastLoadedProjectIdRef.current = undefined;
            setLoadingEdifice(false);
        },
    });
    const [projectTarget, setProjectTarget] = useState("");
    const [projectCount, setProjectCount] = useState(0);
    useHttpRequest<Project>(PROJECT_REQUEST, {_id: projectTarget}, projectCount, true, {
        success: (data) => {
            setProjectData(data);
            lastLoadedProjectIdRef.current = projectTarget;
            setProjectError(false);
            setLoadingProject(false);
        },
        error: () => {
            setProjectError(true);
            setProjectData(null);
            lastLoadedProjectIdRef.current = undefined;
            setLoadingProject(false);
        },
    });

    useEffect(() => {
        if (!edificeId) {
            setEdificeData(null);
            setProjectData(null);
            setLoadingEdifice(false);
            setEdificeError(false);
            setProjectError(false);
            lastLoadedEdificeIdRef.current = undefined;
            lastLoadedProjectIdRef.current = undefined;
            return;
        }

        setEdificeError(false);

        const switchingBuilding = lastLoadedEdificeIdRef.current !== undefined && lastLoadedEdificeIdRef.current !== edificeId;
        if (switchingBuilding) {
            setEdificeData(null);
            setProjectData(null);
            lastLoadedProjectIdRef.current = undefined;
        }

        if (lastLoadedEdificeIdRef.current !== edificeId) {
            setLoadingEdifice(true);
        }

        setEdificeCount((count) => count + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- form methods stable
    }, [edificeId, projectField]);

    const prevEdificeIdRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        const prev = prevEdificeIdRef.current;
        if (prev !== undefined && prev !== edificeId) {
            form.setValue(polygonField, [], { shouldValidate: false });
            form.setValue(closedField, false, { shouldValidate: false });
        }
        prevEdificeIdRef.current = edificeId;
    }, [edificeId, form, polygonField, closedField]);

    if (!edificeId) {
        return (
            <Alert>
                <IconAlertTriangle className="h-4 w-4"/>
                <AlertTitle>{resolveLanguageKey("noEdificeSelectedTitle")}</AlertTitle>
                <AlertDescription>{resolveLanguageKey("noEdificeSelectedDescription")}</AlertDescription>
            </Alert>
        );
    }

    if (loadingEdifice || loadingProject) {
        return <Loader />;
    }
    if (edificeError || !edificeData) {
        return (
            <SimpleError
                title={resolveLanguageKey("errorTitle")}
                description={resolveLanguageKey(errorLoadingKey)}
            />
        );
    }
    if (projectError || !projectData) {
        return (
            <SimpleError
                title={resolveLanguageKey("errorTitle")}
                description={resolveLanguageKey("errorLoadingProject")}
            />
        );
    }

    const mainImage = projectData.mainImage as { _id?: string } | string | undefined;
    const imageId = typeof mainImage === "object" && mainImage ? mainImage._id : mainImage;
    if (!imageId) {
        return <p className="text-sm text-muted-foreground">{resolveLanguageKey(noImageKey)}</p>;
    }

    const phantomRaw = (edificeData as { floorsCoordinates?: { _id: string; name: string; polygonCoordinates: PolygonPoint[] }[] }).floorsCoordinates || [];
    const phantomPoints = (floorId ? phantomRaw.filter((fc) => fc._id !== floorId) : phantomRaw) as {
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
                    form.setValue(polygonField, pts, { shouldValidate: true, shouldDirty: true });
                }}
                onClosedChange={(closed: boolean) => {
                    form.setValue(closedField, closed, { shouldValidate: true, shouldDirty: true });
                }}
                disabled={loading}
                key={String(edificeData._id) + String(imageId)}
            />
        </div>
    );
}
