import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createApprovalWorkflowFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalWorkflow/createApprovalWorkflow.form.validator.ts";
import type {CreateApprovalWorkflowFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalWorkflow/approvalWorkflow.schema-def.ts";

export default createGenericCreatePage<CreateApprovalWorkflowFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/approvalWorkflows/createApprovalWorkflow.tsx",
    model: "approvalworkflows",
    apiUrl: "/api/realEstate/approvalWorkflow",
    schema: createApprovalWorkflowFormSchema,
    defaultValues: () => ({
        documentType: "contractor_invoice",
        title: "",
        active: true,
    } as any),
    successPath: "/realEstate/approvalWorkflows",
    submitIcon: <IconPlus />,
});
