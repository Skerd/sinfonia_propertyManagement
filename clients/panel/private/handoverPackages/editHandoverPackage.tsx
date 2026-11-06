import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editHandoverPackageFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/editHandoverPackage.form.validator.ts";
import type {HandoverPackage} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/handoverPackage.dto.ts";
import type {EditHandoverPackageFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/handoverPackage.schema-def.ts";
import {mediaEditPayload} from "@propertyManagementModule/helpers/forms/editPageMapping.ts";

export default createGenericEditPage<HandoverPackage, EditHandoverPackageFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/handoverPackages/editHandoverPackage.tsx",
    model: "handoverpackages",
    apiUrl: "/api/realEstate/handoverPackage",
    schema: editHandoverPackageFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: data.project?._id ?? "",
        edifice: data.edifice?._id,
        floor: data.floor?._id,
        unit: data.unit?._id ?? "",
        media: data.media?.map((m) => m._id ?? m) ?? [],
        items: (data.items ?? []).map((item) => ({
            name: item.name,
            description: item.description,
            instructions: item.instructions,
            importance: item.importance,
        })),
    }),
    buildFormExtras: (_entityId, _params, entity) => ({
        enableLocalFileMultipart: true,
        editMediaExistingList: entity?.media ?? [],
    }),
    mapSubmitPayload: (data, {writeFields}) => mediaEditPayload(data, writeFields, "media"),
    submitIcon: <IconDeviceFloppy />,
});
