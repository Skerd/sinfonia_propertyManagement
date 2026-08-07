import {IconFolderPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createProjectFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/createProject.form.validator.ts";
import {CreateProjectFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.schema-def.ts";

export default createGenericCreatePage<CreateProjectFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/projects/createProject.tsx",
    model: "projects",
    apiUrl: "/api/realEstate/project",
    schema: createProjectFormSchema,
    submitIcon: <IconFolderPlus />,
    defaultValues: {
        socialLinks: [],
    } as unknown as CreateProjectFormType,
});
