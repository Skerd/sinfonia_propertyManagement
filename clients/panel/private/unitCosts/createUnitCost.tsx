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
        constructorRef: undefined,
        boqItem: undefined,
        costCommitment: undefined,
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
        const lines = Array.isArray(data.expenditureItems) ? data.expenditureItems : [];
        const rowIndices: number[] = [];
        const formData = new FormData();

        for (const [i, row] of lines.entries()) {
            const media = Array.isArray(row.media) ? row.media : [];
            for (const item of media) {
                if (item instanceof File) {
                    formData.append("expenditureItemMedia", item);
                    rowIndices.push(i);
                }
            }
        }

        const invoiceFiles = Array.isArray(data.invoiceMedia)
            ? data.invoiceMedia.filter((x): x is File => x instanceof File)
            : [];
        invoiceFiles.forEach((file) => formData.append("invoiceMedia", file));

        const unitId = (data.unit ?? "").trim();
        const projectId = (data.project ?? "").trim();
        const edificeId = (data.edifice ?? "").trim();
        const floorId = (data.floor ?? "").trim();

        formData.append("data", JSON.stringify({
            ...(isMongoIdString(unitId) ? {unit: unitId} : {}),
            ...(isMongoIdString(projectId) ? {project: projectId} : {}),
            ...(isMongoIdString(edificeId) ? {edifice: edificeId} : {}),
            ...(isMongoIdString(floorId) ? {floor: floorId} : {}),
            purchasePerson: data.purchasePerson,
            purchaseDate: data.purchaseDate,
            currency: data.currency,
            ...(data.budgetedAmount != null ? {budgetedAmount: data.budgetedAmount} : {}),
            ...(data.verificationStatus ? {verificationStatus: data.verificationStatus} : {}),
            ...(data.paymentStatus ? {paymentStatus: data.paymentStatus} : {}),
            ...(data.paymentDate ? {paymentDate: data.paymentDate} : {}),
            ...(data.notes != null ? {notes: data.notes} : {}),
            ...(data.tag ? {tag: data.tag} : {}),
            ...(data.invoiceNumber ? {invoiceNumber: data.invoiceNumber} : {}),
            ...(data.vendorName ? {vendorName: data.vendorName} : {}),
            ...(data.relatedModificationRequest ? {relatedModificationRequest: data.relatedModificationRequest} : {}),
            ...(data.constructorRef ? {constructorRef: data.constructorRef} : {}),
            ...(data.boqItem ? {boqItem: data.boqItem} : {}),
            ...(data.costCommitment ? {costCommitment: data.costCommitment} : {}),
            expenditureItems: lines.map((row) => ({
                title: row.title,
                category: row.category,
                amount: row.amount,
                unit: row.unit,
                pricePerUnit: row.pricePerUnit,
                media: Array.isArray(row.media) ? row.media.filter(isMongoIdString) : [],
            })),
            expenditureItemMediaRowIndex: rowIndices,
        }));

        return formData;
    },
    submitIcon: <IconTextPlus />,
});
