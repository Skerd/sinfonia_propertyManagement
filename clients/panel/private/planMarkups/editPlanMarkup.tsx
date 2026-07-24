import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editPlanMarkupFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/planMarkup/editPlanMarkup.form.validator.ts";
import type {PlanMarkup} from "armonia/src/modules/propertyManagement/api/realEstate/private/planMarkup/planMarkup.dto.ts";
import type {EditPlanMarkupFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/planMarkup/planMarkup.schema-def.ts";

export default createGenericEditPage<PlanMarkup, EditPlanMarkupFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/planMarkups/editPlanMarkup.tsx",
    model: "planmarkups",
    apiUrl: "/api/realEstate/planMarkup",
    schema: editPlanMarkupFormSchema,
    mapEntityData: (data) => ({
        ...data,
        planDocument: (data as any).planDocument?._id ?? (data as any).planDocument,
        project: (data as any).project?._id ?? (data as any).project,
    } as any),
    submitIcon: <Save />,
});
