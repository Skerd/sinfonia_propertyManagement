import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createDesignStageFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/designStage/createDesignStage.form.validator.ts";
import type {CreateDesignStageFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/designStage/designStage.schema-def.ts";

export default createGenericCreatePage<CreateDesignStageFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/designStages/createDesignStage.tsx",
    model: "designstages",
    apiUrl: "/api/realEstate/designStage",
    schema: createDesignStageFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        title: "",
        stageType: "concept" as const,
    } as any),
    successPath: "/realEstate/designStages",
    submitIcon: <IconPlus />,
});
