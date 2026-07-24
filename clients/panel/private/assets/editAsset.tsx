import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editAssetFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/asset/editAsset.form.validator.ts";
import type {Asset} from "armonia/src/modules/propertyManagement/api/realEstate/private/asset/asset.dto.ts";
import type {EditAssetFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/asset/asset.schema-def.ts";

export default createGenericEditPage<Asset, EditAssetFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/assets/editAsset.tsx",
    model: "assets",
    apiUrl: "/api/realEstate/asset",
    schema: editAssetFormSchema,
    mapEntityData: (data) => ({
        ...data,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
        warranty: (data as any).warranty?._id ?? (data as any).warranty,
    } as any),
    submitIcon: <Save />,
});
