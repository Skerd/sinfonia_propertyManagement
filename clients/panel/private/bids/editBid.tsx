import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editBidFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/bid/editBid.form.validator.ts";
import type {Bid} from "armonia/src/modules/propertyManagement/api/realEstate/private/bid/bid.dto.ts";
import type {EditBidFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/bid/bid.schema-def.ts";

export default createGenericEditPage<Bid, EditBidFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/bids/editBid.tsx",
    model: "bids",
    apiUrl: "/api/realEstate/bid",
    schema: editBidFormSchema,
    mapEntityData: (data) => ({
        ...data,
        tender: (data as any).tender?._id ?? (data as any).tender,
        tenderInvitation: (data as any).tenderInvitation?._id ?? (data as any).tenderInvitation,
        constructorRef: (data as any).constructorRef?._id ?? (data as any).constructorRef,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
