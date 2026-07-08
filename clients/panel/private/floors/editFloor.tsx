import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editFloorFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/editFloor.form.validator.ts";
import type {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import type {EditFloorFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.schema-def.ts";

export default createGenericEditPage<Floor, EditFloorFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/floors/editFloor.tsx",
    model: "floors",
    apiUrl: "/api/realEstate/floor",
    schema: editFloorFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: data.project?._id,
        edifice: data.edifice?._id,
        mainImage: data.mainImage?._id,
        imageGallery: data.imageGallery?.map((img) => img._id) ?? undefined,
        videoGallery: data.videoGallery?.map((vid) => vid._id) ?? undefined,
        mediaFiles: data.mediaFiles?.map((f) => f._id) ?? undefined,
        marketingBooklet: data.marketingBooklet?._id,
    }),
    buildFormExtras: (entityId) => (entityId ? {floorId: entityId} : {}),
    buildExtraTitles: (params, entityName) => [params.get("projectName"), params.get("edificeName"), entityName].filter((x): x is string => !!x),
});
