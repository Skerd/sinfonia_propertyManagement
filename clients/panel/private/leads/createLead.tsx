import {IconUserPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createLeadFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/createLead.form.validator.ts";
import type {CreateLeadFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.schema-def.ts";

export default createGenericCreatePage<CreateLeadFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/leads/createLead.tsx",
    model:        "leads",
    apiUrl:       "/api/realEstate/lead",
    schema:       createLeadFormSchema,
    defaultValues: {firstName: ""},
    successPath:  "/realEstate/leads",
    submitIcon:   <IconUserPlus />,
});
