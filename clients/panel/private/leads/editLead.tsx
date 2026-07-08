import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editLeadFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/editLead.form.validator.ts";
import type {Lead} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.dto.ts";
import type {EditLeadFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.schema-def.ts";

export default createGenericEditPage<Lead, EditLeadFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/leads/editLead.tsx",
    model:        "leads",
    apiUrl:       "/api/realEstate/lead",
    schema:       editLeadFormSchema,
    mapEntityData: (data) => ({
        ...data,
        projectInterest: (data.projectInterest as any)?._id ?? data.projectInterest,
        unitInterest:    (data.unitInterest as any)?._id ?? data.unitInterest,
        budgetCurrency:  (data.budgetCurrency as any)?._id ?? data.budgetCurrency,
        assignedTo:      (data.assignedTo as any)?._id ?? data.assignedTo,
        followUpDate:    data.followUpDate
            ? new Date(data.followUpDate).toISOString().split("T")[0]
            : undefined,
    }),
    submitIcon: <Save />,
});
