import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createTenderInvitationFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/tenderInvitation/createTenderInvitation.form.validator.ts";
import type {CreateTenderInvitationFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/tenderInvitation/tenderInvitation.schema-def.ts";

export default createGenericCreatePage<CreateTenderInvitationFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/tenderInvitations/createTenderInvitation.tsx",
    model: "tenderinvitations",
    apiUrl: "/api/realEstate/tenderInvitation",
    schema: createTenderInvitationFormSchema,
    defaultValues: (params) => ({
        tender: params.get("tenderId") ?? "",
        constructorRef: "",
    } as any),
    successPath: "/realEstate/tenderInvitations",
    submitIcon: <IconPlus />,
});
