import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editSpecificationFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/specification/editSpecification.form.validator.ts";
import type {Specification} from "armonia/src/modules/propertyManagement/api/realEstate/private/specification/specification.dto.ts";
import type {EditSpecificationFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/specification/specification.schema-def.ts";

export default createGenericEditPage<Specification, EditSpecificationFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/specifications/editSpecification.tsx",
    model: "specifications",
    apiUrl: "/api/realEstate/specification",
    schema: editSpecificationFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
        workPackage: (data as any).workPackage?._id ?? (data as any).workPackage,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
