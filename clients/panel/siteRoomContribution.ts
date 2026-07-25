import type {SiteRoomContribution} from "@coreModule/clients/panel/moduleContributions/siteRoomContribution.types.ts";

const propertyManagementSiteRoomContribution: SiteRoomContribution = {
    id: "propertyManagement",
    order: 20,
    systemSettingsRooms: {
        unitTypes: "unitTypes_configurations",
        unitTypeCategories: "unitTypeCategories_configurations",
        constructors: "constructors_configurations",
    },
};

export default propertyManagementSiteRoomContribution;
