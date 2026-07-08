import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editProjectFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/editProject.form.validator.ts";
import type {Project} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";
import type {EditProjectFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.schema-def.ts";

export default createGenericEditPage<Project, EditProjectFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/projects/editProject.tsx",
    model: "projects",
    apiUrl: "/api/realEstate/project",
    schema: editProjectFormSchema,
    mapEntityData: (data) => ({
        _id: data._id,
        name: data.name,
        description: data.description,
        mainImage: data.mainImage?._id,
        imageGallery: data.imageGallery?.map((img) => img._id) ?? [],
        videoGallery: data.videoGallery?.map((vid) => vid._id) ?? [],
        mediaFiles: data.mediaFiles?.map((f) => f._id) ?? [],
        marketingBooklet: data.marketingBooklet?._id,
        saleCommissionRatePercent: data.saleCommissionRatePercent,
        reservationCommissionRatePercent: data.reservationCommissionRatePercent,
    })
});
