import {BookOpen} from "lucide-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createStoryFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/createStory.form.validator.ts";
import type {CreateStoryFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/story.schema-def.ts";

export default createGenericCreatePage<CreateStoryFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/stories/createStory.tsx",
    model: "stories",
    apiUrl: "/api/realEstate/story",
    schema: createStoryFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        edifice: params.get("edificeId") ?? undefined,
        unit: params.get("unitId") ?? undefined,
        storyType: "",
        title: "",
        content: "",
        excerpt: "",
        published: true,
        sortOrder: 0,
        publishedAt: new Date().toISOString().split("T")[0],
    }),
    buildFormExtras: (params) => ({
        prefilledProjectId: !!params.get("projectId"),
    }),
    buildExtraTitles: (params) => {
        const projectName = params.get("projectName");
        return projectName ? [projectName] : [];
    },
    successPath: "/realEstate/stories",
    submitIcon: <BookOpen />,
});
