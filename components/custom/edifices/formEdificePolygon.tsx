import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import axios from "axios";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import Loader from "@coreModule/components/custom/loader.tsx";
import SimpleError from "@coreModule/components/custom/errorViewWrapper.tsx";
import PolygonSelector, { type PolygonPoint } from "@coreModule/components/custom/polygonSelector.tsx";
import type { ResolveLanguageKey } from "@coreModule/helpers/hocs/withLanguage.tsx";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@coreModule/components/ui/alert.tsx";
import type { Project } from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";

const EMPTY_POLYGON: PolygonPoint[] = [];

export type FormEdificePolygonProps = {
    resolveLanguageKey: ResolveLanguageKey;
    loading?: boolean;
    formExtras?: Record<string, unknown>;
    polygonField?: string;
    projectField?: string;
    hintKey?: string;
    errorTitleKey?: string;
    errorLoadingKey?: string;
    noImageKey?: string;
};

/**
 * Loads project main image and edits edifice polygon coordinates (on project image) in form state.
 * formExtras.edificeId: when set (edit), excludes current edifice from phantom polygons.
 */
export default function FormEdificePolygon({
    resolveLanguageKey,
    loading = false,
    formExtras,
    polygonField = "polygonCoordinates",
    projectField = "project",
    hintKey = "selectEdificeLocationOnProject",
    errorTitleKey = "errorTitle",
    errorLoadingKey = "errorLoadingProject",
    noImageKey = "projectNoMainImage",
}: FormEdificePolygonProps) {
    const form = useFormContext();
    const projectId = useWatch({ control: form.control, name: projectField as any }) as string | undefined;
    const watchedPolygon = useWatch({ control: form.control, name: polygonField as any }) as PolygonPoint[] | undefined;
    const edificeId = (formExtras as { edificeId?: string } | undefined)?.edificeId;

    const polygonSig =
        watchedPolygon?.length && watchedPolygon.every((p) => typeof p?.x === "number" && typeof p?.y === "number")
            ? watchedPolygon.map((p) => `${p.x}:${p.y}`).join(";")
            : "";
    const initialPointsStable = useMemo(() => {
        if (!watchedPolygon?.length) return EMPTY_POLYGON;
        return watchedPolygon;
    }, [polygonSig, watchedPolygon]);

    const [projectData, setProjectData] = useState<Project | null>(null);
    const [loadingProject, setLoadingProject] = useState(false);
    const [projectError, setProjectError] = useState(false);
    const lastLoadedProjectIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!projectId) {
            setProjectData(null);
            setLoadingProject(false);
            setProjectError(false);
            lastLoadedProjectIdRef.current = undefined;
            return;
        }

        const ac = new AbortController();
        setProjectError(false);

        const switchingProject =
            lastLoadedProjectIdRef.current !== undefined && lastLoadedProjectIdRef.current !== projectId;
        if (switchingProject) {
            setProjectData(null);
        }

        const alreadyShowing = lastLoadedProjectIdRef.current === projectId;
        if (!alreadyShowing) {
            setLoadingProject(true);
        }

        apiClient
            .post<Project>(`/api/realEstate/project/single`, { _id: projectId }, { signal: ac.signal })
            .then((res) => {
                setProjectData(res.data);
                lastLoadedProjectIdRef.current = projectId;
                setProjectError(false);
            })
            .catch((err: unknown) => {
                if (axios.isCancel(err)) return;
                setProjectError(true);
                setProjectData(null);
                lastLoadedProjectIdRef.current = undefined;
            })
            .finally(() => {
                if (!ac.signal.aborted) setLoadingProject(false);
            });

        return () => ac.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- stable form methods
    }, [projectId, projectField]);

    const prevProjectIdRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        const prev = prevProjectIdRef.current;
        if (prev !== undefined && prev !== projectId) {
            form.setValue(polygonField as any, [] as any, { shouldValidate: false });
        }
        prevProjectIdRef.current = projectId;
    }, [projectId, form, polygonField]);

    if (!projectId) {
        return (
            <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>{resolveLanguageKey("noProjectSelectedTitle")}</AlertTitle>
                <AlertDescription>{resolveLanguageKey("noProjectSelectedDescription")}</AlertDescription>
            </Alert>
        );
    }

    if (loadingProject) {
        return <Loader />;
    }
    if (projectError || !projectData) {
        return (
            <SimpleError
                title={resolveLanguageKey(errorTitleKey)}
                description={resolveLanguageKey(errorLoadingKey)}
            />
        );
    }

    const mainImage = projectData.mainImage as { _id?: string } | string | undefined;
    const imageId = typeof mainImage === "object" && mainImage ? mainImage._id : mainImage;
    if (!imageId) {
        return <p className="text-sm text-muted-foreground">{resolveLanguageKey(noImageKey)}</p>;
    }

    const phantomRaw =
        (projectData as { edificesCoordinates?: { _id: string; name: string; polygonCoordinates: PolygonPoint[] }[] })
            .edificesCoordinates || [];
    const phantomPoints = (edificeId ? phantomRaw.filter((row) => row._id !== edificeId) : phantomRaw) as {
        _id: string;
        name: string;
        polygonCoordinates: PolygonPoint[];
    }[];

    return (
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{resolveLanguageKey(hintKey)}</p>
            <PolygonSelector
                resolveLanguageKey={resolveLanguageKey}
                imageUrl={`/api/auxiliary/media/${imageId}`}
                phantomPoints={phantomPoints}
                initialPoints={initialPointsStable}
                onPointsChange={(pts: PolygonPoint[]) => {
                    form.setValue(polygonField as any, pts as any, { shouldValidate: true, shouldDirty: true });
                }}
                disabled={loading}
                key={String(projectData._id) + String(imageId)}
            />
        </div>
    );
}
