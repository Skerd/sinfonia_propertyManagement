import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editWorkPackageFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/workPackage/editWorkPackage.form.validator.ts";
import type {WorkPackage} from "armonia/src/modules/propertyManagement/api/realEstate/private/workPackage/workPackage.dto.ts";
import type {EditWorkPackageFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/workPackage/workPackage.schema-def.ts";

export default createGenericEditPage<WorkPackage, EditWorkPackageFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/workPackages/editWorkPackage.tsx",
    model: "workpackages",
    apiUrl: "/api/realEstate/workPackage",
    schema: editWorkPackageFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
        constructorRef: (data as any).constructorRef?._id ?? (data as any).constructorRef,
        plannedStart: (data as any).plannedStart ? new Date((data as any).plannedStart).toISOString().split("T")[0] : undefined,
        plannedEnd: (data as any).plannedEnd ? new Date((data as any).plannedEnd).toISOString().split("T")[0] : undefined,
    } as any),
    submitIcon: <Save />,
});
