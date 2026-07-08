import {IconTextPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {generateZodCreateInspectionFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/createInspection.form.validator.ts";
import type {CreateInspectionFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.schema-def.ts";

type CreateInspectionFormData = CreateInspectionFormType & {
    project?: string;
    edifice?: string;
    floor?: string;
    cancellationReason?: string;
    media?: File[];
    clientSignatureMediaId?: File;
};

export default createGenericCreatePage<CreateInspectionFormData>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/inspections/createInspection.tsx",
    model: "inspections",
    apiUrl: "/api/realEstate/unit/inspection",
    schema: generateZodCreateInspectionFormSchema,
    defaultValues: (params) => ({
        unit: params.get("unitId") || ""
    }),
    buildFormExtras: (params) => ({
        hideProjectToUnitCascade: !!params.get("unitId"),
        // hideInspectionEditOnlyBlocks: true,
        defaultUnitId: params.get("unitId") || "",
        enableLocalFileMultipart: true,
    }),
    buildExtraTitles: (params) => [params.get("projectName"), params.get("edificeName"), params.get("floorName"), params.get("unitName")].filter((x): x is string => !!x,),
    submitIcon: <IconTextPlus />,
});
