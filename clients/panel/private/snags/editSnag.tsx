import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editSnagFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/editSnag.form.validator.ts";
import type {Snag} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.dto.ts";
import type {EditSnagFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.schema-def.ts";

export default createGenericEditPage<Snag, EditSnagFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/snags/editSnag.tsx",
    model:          "snags",
    apiUrl:         "/api/realEstate/snag",
    schema:         editSnagFormSchema,
    mapEntityData: (data) => ({
        ...data,
        unit:       (data.unit as any)?._id       ?? data.unit,
        reportedBy: (data.reportedBy as any)?._id ?? data.reportedBy,
        assignedTo: (data.assignedTo as any)?._id ?? data.assignedTo,
        dueDate:    data.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : undefined,
        workPackage:    (data.workPackage as any)?._id ?? data.workPackage,
        variationOrder: (data.variationOrder as any)?._id ?? data.variationOrder,
        photos:     data.photos?.map((m: any) => m._id ?? m) ?? [],
    }),
    buildFormExtras: (_entityId, _params, entity) => ({
        enableLocalFileMultipart: true,
        editMediaExistingList: entity?.photos ?? [],
    }),
    mapSubmitPayload: (data, {writeFields}) => {
        const formData = new FormData();
        const fields: Record<string, any> = {_id: data._id};
        for (const [key, val] of Object.entries(data)) {
            if (key === "photos") continue;
            if ((writeFields as any)[key] !== undefined) fields[key] = val;
        }
        if ((writeFields as any).photos !== undefined) {
            fields.photos = (data.photos as any[])
                ?.filter((p): p is string => typeof p === "string" && p.trim() !== "") ?? [];
        }
        formData.append("data", JSON.stringify(fields));
        if ((writeFields as any).photos && Array.isArray(data.photos)) {
            (data.photos as any[]).filter((f): f is File => f instanceof File).forEach(f => formData.append("files", f));
        }
        return formData;
    },
    submitIcon: <Save />,
});
