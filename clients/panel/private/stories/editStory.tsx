import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editStoryFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/editStory.form.validator.ts";
import type {Story} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/story.dto.ts";
import type {EditStoryFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/story.schema-def.ts";
import {refId, refIds} from "@propertyManagementModule/helpers/forms/editPageMapping.ts";

export default createGenericEditPage<Story, EditStoryFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/stories/editStory.tsx",
    model: "stories",
    apiUrl: "/api/realEstate/story",
    schema: editStoryFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: data.project?._id ?? data.project,
        storyType: data.storyType?._id ?? data.storyType,
        edifice: data.edifice?._id ?? data.edifice,
        unit: data.unit?._id ?? data.unit,
        publishedAt: data.publishedAt || undefined,
        mainImage: refId(data.mainImage),
        imageGallery: refIds(data.imageGallery),
        videoGallery: refIds(data.videoGallery),
    }),
    submitIcon: <IconDeviceFloppy />,
});
