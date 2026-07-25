import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editPropertyManagementConfigFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/propertyManagementConfig/editPropertyManagementConfig.form.validator.ts";
import type {PropertyManagementConfig} from "armonia/src/modules/propertyManagement/api/realEstate/private/propertyManagementConfig/propertyManagementConfig.dto.ts";
import type {EditPropertyManagementConfigFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/propertyManagementConfig/propertyManagementConfig.schema-def.ts";

export default createGenericEditPage<PropertyManagementConfig, EditPropertyManagementConfigFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/propertyManagementConfig/editPropertyManagementConfig.tsx",
    model: "propertymanagementconfigs",
    apiUrl: "/api/realEstate/propertyManagementConfig",
    schema: editPropertyManagementConfigFormSchema,
    mapEntityData: (data) => ({
        ...data,
        requiresSaleApproval: !!data.requiresSaleApproval,
        requiresHandoverPackageForHandover: !!data.requiresHandoverPackageForHandover,
    }),
    submitIcon: <Save />,
});
