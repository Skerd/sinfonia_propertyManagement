import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createApprovalRequestFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalRequest/createApprovalRequest.form.validator.ts";
import type {CreateApprovalRequestFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalRequest/approvalRequest.schema-def.ts";

export default createGenericCreatePage<CreateApprovalRequestFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/approvalRequests/createApprovalRequest.tsx",
    model: "approvalrequests",
    apiUrl: "/api/realEstate/approvalRequest",
    schema: createApprovalRequestFormSchema,
    defaultValues: () => ({
        documentType: "contractor_invoice",
        targetType: "",
    } as any),
    successPath: "/realEstate/approvalRequests",
    submitIcon: <IconPlus />,
});
