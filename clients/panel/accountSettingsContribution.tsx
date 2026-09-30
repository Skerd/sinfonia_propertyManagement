import type {
    AccountSettingsContribution,
} from "@coreModule/helpers/types/accountSettingsContribution.types.ts";
import MarketingPreferencesSection from "@propertyManagementModule/clients/panel/private/accountSettings/marketingPreferences.tsx";

const propertyManagementAccountSettingsContribution: AccountSettingsContribution = {
    id: "propertyManagement",
    order: 20,
    getNotificationSections({specificUserId}) {
        return [
            {
                id: "propertyManagement:marketingPreferences",
                render: () => <MarketingPreferencesSection specificUserId={specificUserId} />,
            },
        ];
    },
};

export default propertyManagementAccountSettingsContribution;
