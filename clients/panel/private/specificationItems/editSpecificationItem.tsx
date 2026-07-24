import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editSpecificationItemFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/specificationItem/editSpecificationItem.form.validator.ts";
import type {SpecificationItem} from "armonia/src/modules/propertyManagement/api/realEstate/private/specificationItem/specificationItem.dto.ts";
import type {EditSpecificationItemFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/specificationItem/specificationItem.schema-def.ts";

export default createGenericEditPage<SpecificationItem, EditSpecificationItemFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/specificationItems/editSpecificationItem.tsx",
    model: "specificationitems",
    apiUrl: "/api/realEstate/specificationItem",
    schema: editSpecificationItemFormSchema,
    mapEntityData: (data) => ({
        ...data,
        specification: (data as any).specification?._id ?? (data as any).specification,
        project: (data as any).project?._id ?? (data as any).project,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
