import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createBoqItemFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/boqItem/createBoqItem.form.validator.ts";
import type {CreateBoqItemFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/boqItem/boqItem.schema-def.ts";

export default createGenericCreatePage<CreateBoqItemFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/boqItems/createBoqItem.tsx",
    model: "boqitems",
    apiUrl: "/api/realEstate/boqItem",
    schema: createBoqItemFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        title: "",
    } as any),
    successPath: "/realEstate/boqItems",
    submitIcon: <IconPlus />,
});
