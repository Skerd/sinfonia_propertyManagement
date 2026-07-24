import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createInspectionChecklistTemplateFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/inspectionChecklistTemplate/createInspectionChecklistTemplate.form.validator.ts";
import type {CreateInspectionChecklistTemplateFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/inspectionChecklistTemplate/inspectionChecklistTemplate.schema-def.ts";

export default createGenericCreatePage<CreateInspectionChecklistTemplateFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/inspectionChecklistTemplates/createInspectionChecklistTemplate.tsx",
    model: "inspectionchecklisttemplates",
    apiUrl: "/api/realEstate/inspectionChecklistTemplate",
    schema: createInspectionChecklistTemplateFormSchema,
    defaultValues: () => ({
        title: "",
    } as any),
    successPath: "/realEstate/inspectionChecklistTemplates",
    submitIcon: <IconPlus />,
});
