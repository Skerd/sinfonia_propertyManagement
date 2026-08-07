import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editStoryTypeFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/storyType/editStoryType.form.validator.ts";
import type {StoryType} from "armonia/src/modules/propertyManagement/api/realEstate/private/storyType/storyType.dto.ts";
import type {EditStoryTypeFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/storyType/storyType.schema-def.ts";

export default createGenericEditPage<StoryType, EditStoryTypeFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/storyTypes/editStoryType.tsx",
    collectionName: "storytypes",
    accessModel: "storyTypes",
    apiUrl: "/api/realEstate/storyType",
    schema: editStoryTypeFormSchema,
});
