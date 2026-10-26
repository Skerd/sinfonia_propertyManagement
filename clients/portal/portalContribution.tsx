import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import PublicSiteRoutes from "@propertyManagementModule/clients/client/public/shared/publicSiteRoutes.tsx";

/** Properties on the portal: each real-estate company's public site; inquiries become its leads. */
const contribution: PortalContribution = {
    id: "properties",
    order: 40,
    section: "properties",
    path: "properties",
    CompanySite: PublicSiteRoutes,
};

export default contribution;
