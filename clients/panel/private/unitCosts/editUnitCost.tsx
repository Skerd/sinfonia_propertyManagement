import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editUnitCostFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/editUnitCost.form.validator.ts";
import type {UnitCost} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.dto.ts";
import type {EditUnitCostFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.schema-def.ts";

type EditUnitCostFormData = Omit<EditUnitCostFormType, "invoiceMedia" | "expenditureItems"> & {
    invoiceMedia?: (string | File)[];
    expenditureItems?: Array<{
        title: string;
        category: string;
        amount: number;
        unit: string;
        pricePerUnit: string | number;
        media?: (string | File)[];
    }>;
};

function splitMediaField(value: unknown): {ids: string[]; files: File[]} {
    if (!Array.isArray(value)) return {ids: [], files: []};
    const ids: string[] = [];
    const files: File[] = [];
    for (const item of value) {
        if (typeof item === "string" && item.trim() !== "") ids.push(item);
        else if (item instanceof File) files.push(item);
    }
    return {ids, files};
}

export default createGenericEditPage<UnitCost, EditUnitCostFormData>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/unitCosts/editUnitCost.tsx",
    collectionName: "unitcosts",
    accessModel: "unitCosts",
    apiUrl: "/api/realEstate/unit/cost",
    schema: editUnitCostFormSchema,

    buildInitialValues: (data, writeFields) => {
        const wf = writeFields;
        const expenditureItems = (data.expenditureItems || []).map((row) => ({
            title: row.title,
            category: row.category,
            amount: row.amount,
            unit: row.unit,
            pricePerUnit: row.pricePerUnit,
            media: row.media?.map((m: any) => m._id).filter(Boolean) ?? [],
        }));
        const invoiceIds = (data.invoiceMedia || []).map((m: any) => m._id).filter(Boolean);

        return {
            _id: data._id,
            purchasePerson: wf.purchasePerson ? data.purchasePerson?._id : undefined,
            purchaseDate: wf.purchaseDate && data.purchaseDate ? new Date(data.purchaseDate).toISOString().split("T")[0] : undefined,
            currency: wf.currency ? data.currency?._id : undefined,
            budgetedAmount: wf.budgetedAmount ? data.budgetedAmount : undefined,
            verificationStatus: wf.verificationStatus ? data.verificationStatus : undefined,
            paymentStatus: wf.paymentStatus ? data.paymentStatus : undefined,
            paymentDate: wf.paymentDate && data.paymentDate ? new Date(data.paymentDate).toISOString().split("T")[0] : undefined,
            notes: wf.notes ? data.notes : undefined,
            tag: wf.tag ? data.tag : undefined,
            invoiceNumber: wf.invoiceNumber ? data.invoiceNumber : undefined,
            vendorName: wf.vendorName ? data.vendorName : undefined,
            relatedModificationRequest: wf.relatedModificationRequest ? data.relatedModificationRequest?._id : undefined,
            constructorRef: wf.constructorRef ? (data.constructorRef as any)?._id : undefined,
            boqItem: wf.boqItem ? (data.boqItem as any)?._id : undefined,
            costCommitment: wf.costCommitment ? (data.costCommitment as any)?._id : undefined,
            invoiceMedia: wf.invoiceMedia ? invoiceIds : undefined,
            expenditureItems: wf.expenditureItems ? expenditureItems : undefined,
        };
    },

    buildFormExtras: (_entityId, _params, entity) => ({
        hideProjectToUnitCascade: true,
        enableLocalFileMultipart: false,
        editUnitCostAllLineMedia: (entity?.expenditureItems ?? []).flatMap((row: any) => row.media ?? []),
        editUnitCostInvoiceMediaList: entity?.invoiceMedia ?? [],
    }),

    buildExtraTitles: (params, entityName) => [params.get("unitName") || "", entityName || ""],

    mapSubmitPayload: (data, {writeFields}) => {
        const wf = writeFields;
        const payload: Record<string, unknown> = {_id: data._id};
        const expenditureLineUploadIndices: number[] = [];

        if (wf.purchasePerson && data.purchasePerson) payload.purchasePerson = data.purchasePerson;
        if (wf.purchaseDate && data.purchaseDate) payload.purchaseDate = data.purchaseDate;
        if (wf.currency && data.currency) payload.currency = data.currency;
        if (wf.budgetedAmount) payload.budgetedAmount = data.budgetedAmount ?? null;
        if (wf.verificationStatus && data.verificationStatus) payload.verificationStatus = data.verificationStatus;
        if (wf.paymentStatus && data.paymentStatus) payload.paymentStatus = data.paymentStatus;
        if (wf.paymentDate !== undefined) payload.paymentDate = data.paymentDate ?? "";
        if (wf.notes !== undefined) payload.notes = data.notes ?? "";
        if (wf.tag !== undefined) payload.tag = data.tag ?? "";
        if (wf.invoiceNumber !== undefined) payload.invoiceNumber = data.invoiceNumber ?? "";
        if (wf.vendorName !== undefined) payload.vendorName = data.vendorName ?? "";
        if (wf.relatedModificationRequest !== undefined) {
            payload.relatedModificationRequest = data.relatedModificationRequest ?? "";
        }
        if (wf.constructorRef !== undefined) payload.constructorRef = data.constructorRef ?? "";
        if (wf.boqItem !== undefined) payload.boqItem = data.boqItem ?? "";
        if (wf.costCommitment !== undefined) payload.costCommitment = data.costCommitment ?? "";

        if (wf.expenditureItems && Array.isArray(data.expenditureItems)) {
            payload.expenditureItems = data.expenditureItems.map((row, lineIndex) => {
                const sm = splitMediaField(row.media);
                sm.files.forEach(() => expenditureLineUploadIndices.push(lineIndex));
                return {
                    title: row.title,
                    category: row.category,
                    amount: row.amount,
                    unit: row.unit,
                    pricePerUnit: row.pricePerUnit,
                    media: sm.ids,
                };
            });
            payload.expenditureItemMediaRowIndex = expenditureLineUploadIndices;
        }

        const inv = splitMediaField(data.invoiceMedia);
        if (wf.invoiceMedia) payload.invoiceMedia = inv.ids;

        const formData = new FormData();
        formData.append("data", JSON.stringify(payload));

        if (wf.expenditureItems && Array.isArray(data.expenditureItems)) {
            for (const row of data.expenditureItems) {
                splitMediaField(row.media).files.forEach((file) => formData.append("expenditureItemMedia", file));
            }
        }

        inv.files.forEach((file) => formData.append("invoiceMedia", file));

        return formData;
    },

});
