import {useEffect, useState} from "react";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {MarketingProject} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {useDyeusProjectId} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusProjectId.ts";

export type DyeusSocialLink = {
    name: string;
    link: string;
    logo?: string;
};

type CatalogResponse = {
    projects?: MarketingProject[];
};

export function normalizeDyeusSocialLinks(
    items: MarketingProject["socialLinks"] | undefined,
): DyeusSocialLink[] {
    return (items ?? []).filter(
        (item): item is DyeusSocialLink =>
            typeof item?.name === "string" &&
            item.name.trim().length > 0 &&
            typeof item?.link === "string" &&
            item.link.trim().length > 0,
    );
}

/** Loads configured social/follow links for the active Dyeus project. */
export function useDyeusSocialLinks(): {socialLinks: DyeusSocialLink[]; loading: boolean} {
    const {projectId, loading: resolvingProject} = useDyeusProjectId();
    const [socialLinks, setSocialLinks] = useState<DyeusSocialLink[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectId) {
            setSocialLinks([]);
            setLoading(resolvingProject);
            return;
        }

        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const res = await apiClient.post<CatalogResponse>(
                    "/api/realEstate/marketingProjectsCatalog",
                    {},
                );
                if (cancelled) return;
                const project = (res.data.projects ?? []).find((item) => item._id === projectId);
                setSocialLinks(normalizeDyeusSocialLinks(project?.socialLinks));
            } catch {
                if (!cancelled) setSocialLinks([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [projectId, resolvingProject]);

    return {socialLinks, loading: resolvingProject || loading};
}
