import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editInspectionChecklistTemplateFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/inspectionChecklistTemplate/editInspectionChecklistTemplate.form.validator.ts";
import type {InspectionChecklistTemplate} from "armonia/src/modules/propertyManagement/api/realEstate/private/inspectionChecklistTemplate/inspectionChecklistTemplate.dto.ts";
import type {EditInspectionChecklistTemplateFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/inspectionChecklistTemplate/inspectionChecklistTemplate.schema-def.ts";

export default createGenericEditPage<InspectionChecklistTemplate, EditInspectionChecklistTemplateFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/inspectionChecklistTemplates/editInspectionChecklistTemplate.tsx",
    model: "inspectionchecklisttemplates",
    apiUrl: "/api/realEstate/inspectionChecklistTemplate",
    schema: editInspectionChecklistTemplateFormSchema,
    mapEntityData: (data) => ({
        ...data,
    } as any),
    submitIcon: <Save />,
});
