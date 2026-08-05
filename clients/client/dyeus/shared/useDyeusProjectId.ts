import {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {MarketingProject} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type CatalogResponse = {
    projects?: MarketingProject[];
};

function resolveFromEnv(): string {
    const fromEnv = import.meta.env.VITE_DYEUS_PROJECT_ID;
    return typeof fromEnv === "string" ? fromEnv.trim() : "";
}

function pickDyeusProject(projects: MarketingProject[]): MarketingProject | undefined {
    const byName = projects.find((project) => /dyeus/i.test(project.name) || /dyeus/i.test(project.slug ?? ""));
    return byName ?? projects[0];
}

/** Prefer ?projectId=, then VITE_DYEUS_PROJECT_ID, then catalog match on "Dyeus". */
export function useDyeusProjectId(): {projectId: string; loading: boolean} {
    const [searchParams] = useSearchParams();
    const fromQuery = searchParams.get("projectId")?.trim() ?? "";
    const [resolvedId, setResolvedId] = useState(fromQuery || resolveFromEnv());
    const [loading, setLoading] = useState(!fromQuery && !resolveFromEnv());

    useEffect(() => {
        if (fromQuery) {
            setResolvedId(fromQuery);
            setLoading(false);
            return;
        }

        const envId = resolveFromEnv();
        if (envId) {
            setResolvedId(envId);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const res = await apiClient.post<CatalogResponse>("/api/realEstate/marketingProjectsCatalog", {});
                if (cancelled) return;
                const project = pickDyeusProject(res.data.projects ?? []);
                setResolvedId(project?._id ?? "");
            } catch {
                if (!cancelled) setResolvedId("");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [fromQuery]);

    return {projectId: resolvedId, loading};
}
