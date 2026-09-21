import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS} from "@coreModule/components/custom/inputs/objectIdChipsInput.tsx";
import {editPropertyManagementConfigFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/propertyManagementConfig/editPropertyManagementConfig.form.validator.ts";
import type {PropertyManagementConfig, PropertyManagementConfigNotifyUser} from "armonia/src/modules/propertyManagement/api/realEstate/private/propertyManagementConfig/propertyManagementConfig.dto.ts";
import type {EditPropertyManagementConfigFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/propertyManagementConfig/propertyManagementConfig.schema-def.ts";
import {getName} from "@coreModule/helpers/general/names.ts";

const NOTIFY_FIELDS = ["notifyOnSales", "notifyOnReservations"] as const;

const chipLabelState = {
    loadedId: null as string | null,
    notifyOnSales: {current: {} as Record<string, string>},
    notifyOnReservations: {current: {} as Record<string, string>},
};

function userDisplayName(u: PropertyManagementConfigNotifyUser): string {
    return getName(u) || u._id;
}

export default createGenericEditPage<PropertyManagementConfig, EditPropertyManagementConfigFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/propertyManagementConfig/editPropertyManagementConfig.tsx",
    model: "propertymanagementconfigs",
    apiUrl: "/api/realEstate/propertyManagementConfig",
    schema: editPropertyManagementConfigFormSchema,
    mapEntityData: (data) => ({
        ...data,
        requiresSaleApproval: !!data.requiresSaleApproval,
        requiresHandoverPackageForHandover: !!data.requiresHandoverPackageForHandover,
        notifyOnSales: data.notifyOnSales?.map((u) => u._id) ?? [],
        notifyOnReservations: data.notifyOnReservations?.map((u) => u._id) ?? [],
    }),
    buildFormExtras: (_entityId, _params, entity) => {
        if (entity && chipLabelState.loadedId !== entity._id) {
            chipLabelState.loadedId = entity._id;
            for (const field of NOTIFY_FIELDS) chipLabelState[field].current = {};
        }
        const extras: Record<string, unknown> = {};
        for (const field of NOTIFY_FIELDS) {
            const users = entity?.[field]?.filter((u) => !!u?._id) ?? [];
            for (const u of users) chipLabelState[field].current[u._id] = userDisplayName(u);
            extras[field] = users.map((u) => ({value: u._id, label: userDisplayName(u)}));
        }
        return {
            ...extras,
            [FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS]: {
                notifyOnSales: chipLabelState.notifyOnSales,
                notifyOnReservations: chipLabelState.notifyOnReservations,
            },
        };
    },
    submitIcon: <Save />,
});
