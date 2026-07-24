import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editDesignStageFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/designStage/editDesignStage.form.validator.ts";
import type {DesignStage} from "armonia/src/modules/propertyManagement/api/realEstate/private/designStage/designStage.dto.ts";
import type {EditDesignStageFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/designStage/designStage.schema-def.ts";

export default createGenericEditPage<DesignStage, EditDesignStageFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/designStages/editDesignStage.tsx",
    model: "designstages",
    apiUrl: "/api/realEstate/designStage",
    schema: editDesignStageFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
    } as any),
    submitIcon: <Save />,
});
