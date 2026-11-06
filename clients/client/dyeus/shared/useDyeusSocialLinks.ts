import {useMemo} from "react";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
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

const CATALOG_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/marketingProjectsCatalog"};

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
    const {data, loading} = useHttpRequest<CatalogResponse>(CATALOG_REQUEST, {}, projectId ? 1 : 0);

    const socialLinks = useMemo(() => {
        if (!projectId) return [];
        const project = (data?.projects ?? []).find((item) => item._id === projectId);
        return normalizeDyeusSocialLinks(project?.socialLinks);
    }, [data, projectId]);

    return {socialLinks, loading: resolvingProject || (projectId ? loading : false)};
}
