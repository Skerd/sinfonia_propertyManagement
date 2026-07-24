import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editBidLineFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/bidLine/editBidLine.form.validator.ts";
import type {BidLine} from "armonia/src/modules/propertyManagement/api/realEstate/private/bidLine/bidLine.dto.ts";
import type {EditBidLineFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/bidLine/bidLine.schema-def.ts";

export default createGenericEditPage<BidLine, EditBidLineFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/bidLines/editBidLine.tsx",
    model: "bidlines",
    apiUrl: "/api/realEstate/bidLine",
    schema: editBidLineFormSchema,
    mapEntityData: (data) => ({
        ...data,
        bid: (data as any).bid?._id ?? (data as any).bid,
        specificationItem: (data as any).specificationItem?._id ?? (data as any).specificationItem,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
