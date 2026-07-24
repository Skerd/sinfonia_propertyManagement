import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editTenderFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/tender/editTender.form.validator.ts";
import type {Tender} from "armonia/src/modules/propertyManagement/api/realEstate/private/tender/tender.dto.ts";
import type {EditTenderFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/tender/tender.schema-def.ts";

export default createGenericEditPage<Tender, EditTenderFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/tenders/editTender.tsx",
    model: "tenders",
    apiUrl: "/api/realEstate/tender",
    schema: editTenderFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
        specification: (data as any).specification?._id ?? (data as any).specification,
    } as any),
    submitIcon: <Save />,
});
