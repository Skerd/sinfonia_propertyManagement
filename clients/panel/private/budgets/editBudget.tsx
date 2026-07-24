import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editBudgetFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/budget/editBudget.form.validator.ts";
import type {Budget} from "armonia/src/modules/propertyManagement/api/realEstate/private/budget/budget.dto.ts";
import type {EditBudgetFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/budget/budget.schema-def.ts";

export default createGenericEditPage<Budget, EditBudgetFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/budgets/editBudget.tsx",
    model: "budgets",
    apiUrl: "/api/realEstate/budget",
    schema: editBudgetFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
