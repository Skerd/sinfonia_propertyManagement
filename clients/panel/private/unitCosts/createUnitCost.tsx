import {IconTextPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {generateZodCreateUnitCostFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/createUnitCost.form.validator.ts";
import type {CreateUnitCostFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.schema-def.ts";

function isMongoIdString(value: unknown): value is string {
    return typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);
}

type CreateUnitCostFormData = CreateUnitCostFormType & {
    project?: string;
    edifice?: string;
    floor?: string;
    invoiceMedia?: File[];
};

export default createGenericCreatePage<CreateUnitCostFormData>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/unitCosts/createUnitCost.tsx",
    collectionName: "unitcosts",
    accessModel: "unitCosts",
    apiUrl: "/api/realEstate/unit/cost",
    schema: generateZodCreateUnitCostFormSchema,
    defaultValues: (params) => ({
        unit: params.get("unitId") || "",
        project: "",
        edifice: "",
        floor: "",
        purchasePerson: "",
        purchaseDate: "",
        currency: "",
        verificationStatus: "pending_verification",
        paymentStatus: "unpaid",
        paymentDate: undefined,
        notes: undefined,
        tag: undefined,
        invoiceNumber: undefined,
        vendorName: undefined,
        relatedModificationRequest: undefined,
        expenditureItems: [],
        invoiceMedia: undefined,
    }),
    buildFormExtras: (params) => ({
        hideProjectToUnitCascade: !!params.get("unitId"),
        enableLocalFileMultipart: true,
    }),
    buildExtraTitles: (params) => {
        const unitName = params.get("unitName");
        return unitName ? [unitName] : [];
    },
    mapSubmitPayload: (data) => {
        const formData = new FormData();

        const unitId = ((data.unit as string) || "").trim();
        const projectId = (data.project ?? "").trim();
        const edificeId = (data.edifice ?? "").trim();
        const floorId = (data.floor ?? "").trim();

        if (isMongoIdString(unitId)) formData.append("unit", unitId);
        if (isMongoIdString(projectId)) formData.append("project", projectId);
        if (isMongoIdString(edificeId)) formData.append("edifice", edificeId);
        if (isMongoIdString(floorId)) formData.append("floor", floorId);

        formData.append("purchasePerson", data.purchasePerson);
        formData.append("purchaseDate", data.purchaseDate);
        formData.append("currency", data.currency);
        if (data.verificationStatus) formData.append("verificationStatus", data.verificationStatus);
        if (data.paymentStatus) formData.append("paymentStatus", data.paymentStatus);
        if (data.paymentDate) formData.append("paymentDate", data.paymentDate);
        if (data.notes != null) formData.append("notes", data.notes);
        if (data.tag != null && data.tag !== "") formData.append("tag", data.tag);
        if (data.invoiceNumber != null && data.invoiceNumber !== "") formData.append("invoiceNumber", data.invoiceNumber);
        if (data.vendorName != null && data.vendorName !== "") formData.append("vendorName", data.vendorName);
        if (data.relatedModificationRequest) formData.append("relatedModificationRequest", data.relatedModificationRequest);

        const lines = Array.isArray(data.expenditureItems) ? data.expenditureItems : [];
        const rowIndices: number[] = [];
        lines.forEach((row: any, i: number) => {
            const m = row?.media;
            if (!Array.isArray(m)) return;
            for (const item of m) {
                if (item instanceof File) {
                    formData.append("expenditureItemMedia", item);
                    rowIndices.push(i);
                }
            }
        });
        formData.append("expenditureItemMediaRowIndex", JSON.stringify(rowIndices));
        formData.append(
            "expenditureItems",
            JSON.stringify(
                lines.map((row: any) => ({
                    title: row.title,
                    category: row.category,
                    amount: row.amount,
                    unit: row.unit,
                    pricePerUnit: row.pricePerUnit,
                    media: Array.isArray(row.media) ? row.media.filter(isMongoIdString) : [],
                })),
            ),
        );

        const inv = Array.isArray(data.invoiceMedia)
            ? data.invoiceMedia.filter((x: any): x is File => x instanceof File)
            : [];
        inv.forEach((file) => formData.append("invoiceMedia", file));

        return formData;
    },
    submitIcon: <IconTextPlus />,
});
