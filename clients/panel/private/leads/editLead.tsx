import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editLeadFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/editLead.form.validator.ts";
import type {Lead} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.dto.ts";
import type {EditLeadFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.schema-def.ts";
import {refId} from "@propertyManagementModule/helpers/forms/editPageMapping.ts";

export default createGenericEditPage<Lead, EditLeadFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/leads/editLead.tsx",
    model:        "leads",
    apiUrl:       "/api/realEstate/lead",
    schema:       editLeadFormSchema,
    mapEntityData: (data) => ({
        ...data,
        projectInterest: refId(data.projectInterest),
        unitInterest:    refId(data.unitInterest),
        budgetCurrency:  refId(data.budgetCurrency),
        assignedTo:      refId(data.assignedTo),
        followUpDate:    data.followUpDate || undefined,
    }),
    submitIcon: <IconDeviceFloppy />,
});
