import {IconAdjustmentsPlus} from "@tabler/icons-react";
import {z} from "zod";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createModificationRequestFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/createModificationRequest.form.validator.ts";

type CreateModificationRequestFormSurface = z.infer<ReturnType<typeof createModificationRequestFormSchema>>;

export default createGenericCreatePage<CreateModificationRequestFormSurface>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/modificationRequests/createModificationRequest.tsx",
    collectionName: "modificationrequests",
    accessModel: "modificationRequests",
    apiUrl: "/api/realEstate/unit/modificationRequest",
    schema: createModificationRequestFormSchema,
    defaultValues: (params) =>
        ({
            unit: params.get("unitId") || "",
            requestedBy: "",
            title: "",
            description: "",
            constructionType: "",
            specifications: "",
        }) as CreateModificationRequestFormSurface,
    buildFormExtras: (params) => ({
        hideModificationUnitCascade: !!params.get("unitId"),
    }),
    buildExtraTitles: (params) =>
        [params.get("unitName")].filter((x): x is string => !!x),
    mapSubmitPayload: (data) => ({
        unit: data.unit,
        requestedBy: data.requestedBy,
        title: data.title,
        description: data.description,
        constructionType: data.constructionType,
        specifications: data.specifications,
    }),
    submitIcon: <IconAdjustmentsPlus className="h-4 w-4" />,
});
