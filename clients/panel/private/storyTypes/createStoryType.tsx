import {IconStack2} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createStoryTypeFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/storyType/createStoryType.form.validator.ts";
import type {CreateStoryTypeFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/storyType/storyType.schema-def.ts";

export default createGenericCreatePage<CreateStoryTypeFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/storyTypes/createStoryType.tsx",
    collectionName: "storytypes",
    accessModel: "storyTypes",
    apiUrl: "/api/realEstate/storyType",
    schema: createStoryTypeFormSchema,
    defaultValues: {
        name: "",
        description: "",
        sortOrder: 0,
    },
    mapSubmitPayload: (data) => ({
        ...data,
        description: data.description || "",
        sortOrder: data.sortOrder ?? 0,
    }),
    submitIcon: <IconStack2 />,
});
