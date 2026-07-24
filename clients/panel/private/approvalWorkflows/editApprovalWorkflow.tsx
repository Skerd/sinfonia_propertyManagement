import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editApprovalWorkflowFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalWorkflow/editApprovalWorkflow.form.validator.ts";
import type {ApprovalWorkflow} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalWorkflow/approvalWorkflow.dto.ts";
import type {EditApprovalWorkflowFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalWorkflow/approvalWorkflow.schema-def.ts";

export default createGenericEditPage<ApprovalWorkflow, EditApprovalWorkflowFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/approvalWorkflows/editApprovalWorkflow.tsx",
    model: "approvalworkflows",
    apiUrl: "/api/realEstate/approvalWorkflow",
    schema: editApprovalWorkflowFormSchema,
    mapEntityData: (data) => ({
        ...data,
        thresholdCurrency: (data as any).thresholdCurrency?._id ?? (data as any).thresholdCurrency,
    } as any),
    submitIcon: <Save />,
});
