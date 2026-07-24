import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editProjectDocumentFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/editProjectDocument.form.validator.ts";
import type {ProjectDocument} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.dto.ts";
import type {EditProjectDocumentFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.schema-def.ts";

export default createGenericEditPage<ProjectDocument, EditProjectDocumentFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/projectDocuments/editProjectDocument.tsx",
    model:          "projectdocuments",
    apiUrl:         "/api/realEstate/projectDocument",
    schema:         editProjectDocumentFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project:      (data.project as any)?._id ?? data.project,
        edifice:      (data.edifice as any)?._id ?? data.edifice,
        floor:        (data.floor as any)?._id ?? data.floor,
        unit:         (data.unit as any)?._id ?? data.unit,
        supersedes:   (data.supersedes as any)?._id ?? data.supersedes,
        revisionDate: data.revisionDate ? new Date(data.revisionDate).toISOString().split("T")[0] : undefined,
        media:        data.media?.map((m: any) => m._id ?? m) ?? [],
    }),
    buildFormExtras: (_entityId, _params, entity) => ({
        enableLocalFileMultipart: true,
        editMediaExistingList: entity?.media ?? [],
    }),
    mapSubmitPayload: (data, {writeFields}) => {
        const formData = new FormData();
        const fields: Record<string, any> = {_id: data._id};
        for (const [key, val] of Object.entries(data)) {
            if (key === "media") continue;
            if ((writeFields as any)[key] !== undefined) fields[key] = val;
        }
        if ((writeFields as any).media !== undefined) {
            fields.media = (data.media as any[])
                ?.filter((p): p is string => typeof p === "string" && p.trim() !== "") ?? [];
        }
        formData.append("data", JSON.stringify(fields));
        if ((writeFields as any).media && Array.isArray(data.media)) {
            (data.media as any[]).filter((f): f is File => f instanceof File).forEach(f => formData.append("files", f));
        }
        return formData;
    },
    submitIcon: <Save />,
});
