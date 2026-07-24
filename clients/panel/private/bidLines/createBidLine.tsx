import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createBidLineFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/bidLine/createBidLine.form.validator.ts";
import type {CreateBidLineFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/bidLine/bidLine.schema-def.ts";

export default createGenericCreatePage<CreateBidLineFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/bidLines/createBidLine.tsx",
    model: "bidlines",
    apiUrl: "/api/realEstate/bidLine",
    schema: createBidLineFormSchema,
    defaultValues: (params) => ({
        bid: params.get("bidId") ?? "",
        specificationItem: "",
    } as any),
    successPath: "/realEstate/bidLines",
    submitIcon: <IconPlus />,
});
