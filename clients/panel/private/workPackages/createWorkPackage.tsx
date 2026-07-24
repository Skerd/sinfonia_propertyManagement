import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createWorkPackageFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/workPackage/createWorkPackage.form.validator.ts";
import type {CreateWorkPackageFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/workPackage/workPackage.schema-def.ts";

export default createGenericCreatePage<CreateWorkPackageFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/workPackages/createWorkPackage.tsx",
    model: "workpackages",
    apiUrl: "/api/realEstate/workPackage",
    schema: createWorkPackageFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        title: "",
    } as any),
    successPath: "/realEstate/workPackages",
    submitIcon: <IconPlus />,
});
