import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editTenderInvitationFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/tenderInvitation/editTenderInvitation.form.validator.ts";
import type {TenderInvitation} from "armonia/src/modules/propertyManagement/api/realEstate/private/tenderInvitation/tenderInvitation.dto.ts";
import type {EditTenderInvitationFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/tenderInvitation/tenderInvitation.schema-def.ts";

export default createGenericEditPage<TenderInvitation, EditTenderInvitationFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/tenderInvitations/editTenderInvitation.tsx",
    model: "tenderinvitations",
    apiUrl: "/api/realEstate/tenderInvitation",
    schema: editTenderInvitationFormSchema,
    mapEntityData: (data) => ({
        ...data,
        tender: (data as any).tender?._id ?? (data as any).tender,
        constructorRef: (data as any).constructorRef?._id ?? (data as any).constructorRef,
    } as any),
    submitIcon: <Save />,
});
