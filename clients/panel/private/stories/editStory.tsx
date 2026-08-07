import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editStoryFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/editStory.form.validator.ts";
import type {Story} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/story.dto.ts";
import type {EditStoryFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/story.schema-def.ts";

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
        publishedAt: data.publishedAt
            ? new Date(data.publishedAt).toISOString().split("T")[0]
            : undefined,
        mainImage: (data.mainImage as any)?._id ?? data.mainImage,
        imageGallery: data.imageGallery?.map((m: any) => m._id ?? m) ?? [],
        videoGallery: data.videoGallery?.map((m: any) => m._id ?? m) ?? [],
    }),
    submitIcon: <Save />,
});
