import type {TenancySettingsContribution} from "@coreModule/clients/panel/moduleContributions/tenancySettingsContribution.types.ts";
import {buildRealEstateTenancySettingsSubCollapsible} from "@propertyManagementModule/clients/panel/realEstateTenancyNav.ts";

const propertyManagementTenancySettingsContribution: TenancySettingsContribution = {
    id: "propertyManagement",
    order: 20,
    getTenancySettingsItems: buildRealEstateTenancySettingsSubCollapsible,
};

export default propertyManagementTenancySettingsContribution;
