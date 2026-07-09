import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS} from "@coreModule/components/custom/formObjectIdChips.tsx";
import {editEdificeFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/editEdifice.form.validator.ts";
import type {Edifice} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import type {EditEdificeFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.schema-def.ts";

const edificeChipLabelState = {
    loadedId: null as string | null,
    constructors: {current: {} as Record<string, string>},
    propertyTypes: {current: {} as Record<string, string>},
};

export default createGenericEditPage<Edifice, EditEdificeFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/edifices/editEdifice.tsx",
    model: "edifices",
    apiUrl: "/api/realEstate/edifice",
    schema: editEdificeFormSchema,
    mapEntityData: (data) => ({
        ...data,
        _id: data._id,
        project: data.project?._id,
        name: data.name,
        address: {
            ...data.address,
            country: data.address.country?._id,
            state: data.address.state?._id,
            city: data.address.city?._id,
        },
        investmentCurrency: data.investmentCurrency?._id,
        saleCurrency: data.saleCurrency?._id,
        mainImage: data.mainImage?._id,
        imageGallery: data.imageGallery?.map((img) => img._id) ?? undefined,
        videoGallery: data.videoGallery?.map((vid) => vid._id) ?? undefined,
        mediaFiles: data.mediaFiles?.map((f) => f._id) ?? undefined,
        marketingBooklet: data.marketingBooklet?._id,
        constructors: data.constructors?.map((constructor) => constructor._id) ?? undefined,
        propertyTypes: data.propertyTypes?.map((propertyType) => propertyType._id) ?? undefined,
    }),
    buildFormExtras: (entityId, _params, entity) => {
        if (entity) {
            if (edificeChipLabelState.loadedId !== entity._id) {
                edificeChipLabelState.loadedId = entity._id;
                edificeChipLabelState.constructors.current = {};
                edificeChipLabelState.propertyTypes.current = {};
            }
            for (const c of entity.constructors ?? []) {
                if (c?._id) {
                    edificeChipLabelState.constructors.current[c._id] = c.name ?? c._id;
                }
            }
            for (const pt of entity.propertyTypes ?? []) {
                if (pt?._id) {
                    edificeChipLabelState.propertyTypes.current[pt._id] = pt.name ?? pt._id;
                }
            }
        }
        return {
            [FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS]: {
                constructors: edificeChipLabelState.constructors,
                propertyTypes: edificeChipLabelState.propertyTypes,
            },
            ...(entityId ? {edificeId: entityId} : {}),
        };
    },
    buildExtraTitles: (params, entityName) => [params.get("projectName"), entityName].filter((x): x is string => !!x),
});
