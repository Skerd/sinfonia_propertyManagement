import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import {prefetchHttpRequest} from "@coreModule/helpers/apiClient/responseCache.ts";
import {PROJECT_REQUEST, UNIT_REQUEST} from "./propertyRequests.ts";
import PropertyCatalogFilters from "./propertyCatalogFilters.tsx";
import PropertiesSiteRoutes from "./propertiesSiteRoutes.tsx";
import {IconBuildingEstate} from "@tabler/icons-react";
import BusinessTypeSummary from "./businessTypeSummary.tsx";

/** Properties on the portal: each real-estate company's projects in the home catalog; inquiries become its leads. */
const contribution: PortalContribution = {
    id: "properties",
    order: 40,
    section: "properties",
    path: "properties",
    CompanySite: PropertiesSiteRoutes,
    catalogs: [{kind: "project", Filters: PropertyCatalogFilters}],
    // A development or unit link about to be followed: the page's code and the development or unit.
    prefetch: ({path, siteCompany}) => {
        const [, projects, projectId, units, unitId] = path.split("/");
        if (projects !== "projects" || !projectId) return;
        if (units === "units" && unitId) {
            void import("./propertyUnit.tsx");
            prefetchHttpRequest(UNIT_REQUEST, {projectId, unitId}, {siteCompany});
            return;
        }
        void import("./propertyProject.tsx");
        prefetchHttpRequest(PROJECT_REQUEST, {projectId}, {siteCompany});
    },
    // A person may create this kind of business on the portal (D178); the API declares the same key.
    businessType: {key: "propertyManagement", Icon: IconBuildingEstate, Summary: BusinessTypeSummary},
};

export default contribution;
