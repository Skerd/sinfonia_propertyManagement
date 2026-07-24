import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createBudgetFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/budget/createBudget.form.validator.ts";
import type {CreateBudgetFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/budget/budget.schema-def.ts";

export default createGenericCreatePage<CreateBudgetFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/budgets/createBudget.tsx",
    model: "budgets",
    apiUrl: "/api/realEstate/budget",
    schema: createBudgetFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        title: "",
    } as any),
    successPath: "/realEstate/budgets",
    submitIcon: <IconPlus />,
});
