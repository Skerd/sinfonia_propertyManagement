import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editApprovalRequestFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalRequest/editApprovalRequest.form.validator.ts";
import type {ApprovalRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalRequest/approvalRequest.dto.ts";
import type {EditApprovalRequestFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalRequest/approvalRequest.schema-def.ts";

export default createGenericEditPage<ApprovalRequest, EditApprovalRequestFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/approvalRequests/editApprovalRequest.tsx",
    model: "approvalrequests",
    apiUrl: "/api/realEstate/approvalRequest",
    schema: editApprovalRequestFormSchema,
    mapEntityData: (data) => ({
        ...data,
        workflow: (data as any).workflow?._id ?? (data as any).workflow,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
