import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createAssetFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/asset/createAsset.form.validator.ts";
import type {CreateAssetFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/asset/asset.schema-def.ts";

export default createGenericCreatePage<CreateAssetFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/assets/createAsset.tsx",
    model: "assets",
    apiUrl: "/api/realEstate/asset",
    schema: createAssetFormSchema,
    defaultValues: (params) => ({
        edifice: params.get("edificeId") ?? "",
        title: "",
    } as any),
    successPath: "/realEstate/assets",
    submitIcon: <IconPlus />,
});
