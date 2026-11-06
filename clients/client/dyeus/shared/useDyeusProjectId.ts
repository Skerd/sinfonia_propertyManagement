import {useSearchParams} from "react-router-dom";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {MarketingProject} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type CatalogResponse = {
    projects?: MarketingProject[];
};

const CATALOG_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/marketingProjectsCatalog"};

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
    const fixedId = fromQuery || resolveFromEnv();
    // The catalog is only read when neither the URL nor the env names the project; a failed read leaves it empty.
    const {data, loading} = useHttpRequest<CatalogResponse>(CATALOG_REQUEST, {}, fixedId ? 0 : 1);

    if (fixedId) return {projectId: fixedId, loading: false};
    return {projectId: pickDyeusProject(data?.projects ?? [])?._id ?? "", loading};
}
