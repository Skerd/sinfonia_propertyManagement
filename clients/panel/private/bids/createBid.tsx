import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createBidFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/bid/createBid.form.validator.ts";
import type {CreateBidFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/bid/bid.schema-def.ts";

export default createGenericCreatePage<CreateBidFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/bids/createBid.tsx",
    model: "bids",
    apiUrl: "/api/realEstate/bid",
    schema: createBidFormSchema,
    defaultValues: (params) => ({
        tender: params.get("tenderId") ?? "",
        constructorRef: "",
    } as any),
    successPath: "/realEstate/bids",
    submitIcon: <IconPlus />,
});
