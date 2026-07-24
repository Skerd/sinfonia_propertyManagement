import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editBoqItemFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/boqItem/editBoqItem.form.validator.ts";
import type {BoqItem} from "armonia/src/modules/propertyManagement/api/realEstate/private/boqItem/boqItem.dto.ts";
import type {EditBoqItemFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/boqItem/boqItem.schema-def.ts";

export default createGenericEditPage<BoqItem, EditBoqItemFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/boqItems/editBoqItem.tsx",
    model: "boqitems",
    apiUrl: "/api/realEstate/boqItem",
    schema: editBoqItemFormSchema,
    mapEntityData: (data) => ({
        ...data,
        budget: (data as any).budget?._id ?? (data as any).budget,
        project: (data as any).project?._id ?? (data as any).project,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
        constructorRef: (data as any).constructorRef?._id ?? (data as any).constructorRef,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
