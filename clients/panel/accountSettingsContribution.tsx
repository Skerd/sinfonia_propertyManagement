import type {
    AccountSettingsContribution,
} from "@coreModule/helpers/types/accountSettingsContribution.types.ts";
import MarketingPreferencesSection from "@propertyManagementModule/clients/panel/private/accountSettings/marketingPreferences.tsx";

const propertyManagementAccountSettingsContribution: AccountSettingsContribution = {
    id: "propertyManagement",
    order: 20,
    getNotificationSections({specificUserId}) {
        // The backing endpoint is `/me`: it derives its subject from the session,
        // so it cannot answer for the user an admin is inspecting. Showing the
        // admin's own preferences under someone else's name would be worse than
        // showing nothing.
        if (specificUserId) return null;

        return [
            {
                id: "propertyManagement:marketingPreferences",
                render: () => <MarketingPreferencesSection />,
            },
        ];
    },
};

export default propertyManagementAccountSettingsContribution;
