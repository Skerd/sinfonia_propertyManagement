import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import PropertyCatalogFilters from "./propertyCatalogFilters.tsx";
import PropertiesSiteRoutes from "./propertiesSiteRoutes.tsx";

/** Properties on the portal: each real-estate company's projects in the home catalog; inquiries become its leads. */
const contribution: PortalContribution = {
    id: "properties",
    order: 40,
    section: "properties",
    path: "properties",
    CompanySite: PropertiesSiteRoutes,
    catalogs: [{kind: "project", Filters: PropertyCatalogFilters}],
};

export default contribution;
