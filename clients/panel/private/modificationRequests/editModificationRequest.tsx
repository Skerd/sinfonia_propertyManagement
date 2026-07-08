import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editModificationRequestFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/editModificationRequest.form.validator.ts";
import type {ModificationRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import type {EditModificationRequestFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.schema-def.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";

export default createGenericEditPage<ModificationRequest, EditModificationRequestFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/modificationRequests/editModificationRequest.tsx",
    collectionName: "modificationrequests",
    accessModel: "modificationRequests",
    apiUrl: "/api/realEstate/unit/modificationRequest",
    schema: editModificationRequestFormSchema,

    fetchEntity: (entityId) =>
        apiClient
            .post<ModificationRequest>("/api/realEstate/unit/modificationRequest/single", {_id: entityId})
            .then((r) => r.data),

    buildInitialValues: (data, writeFields) => {
        const wf = writeFields as Record<string, any>;
        return {
            _id: data._id,
            status: data.status,
            project: data.unit?.floor?.edifice?.project?._id,
            edifice: data.unit?.floor?.edifice?._id,
            floor: data.unit?.floor?._id,
            unit: data.unit?._id,
            title: wf.title ? data.title : undefined,
            description: wf.description ? data.description : undefined,
            specifications: wf.specifications ? data.specifications : undefined,
            cancellationReason: wf.cancellationReason ? data.cancellationReason : undefined,
            requestedBy: wf.requestedBy ? data.requestedBy?._id : undefined,
            constructionType: wf.constructionType ? data.constructionType : undefined,
            architectApproval:
                wf.architectApproval?.keys && data.architectApproval
                    ? {
                          decision:
                              data.architectApproval.decision === "approved" ||
                              data.architectApproval.decision === "rejected"
                                  ? (data.architectApproval.decision as "approved" | "rejected")
                                  : undefined,
                          notes: data.architectApproval.notes,
                      }
                    : undefined,
            engineerApproval:
                wf.engineerApproval?.keys && data.engineerApproval
                    ? {
                          decision:
                              data.engineerApproval.decision === "approved" ||
                              data.engineerApproval.decision === "rejected"
                                  ? (data.engineerApproval.decision as "approved" | "rejected")
                                  : undefined,
                          notes: data.engineerApproval.notes,
                      }
                    : undefined,
            ceoApproval:
                wf.ceoApproval?.keys && data.ceoApproval
                    ? {
                          decision:
                              data.ceoApproval.decision === "approved" ||
                              data.ceoApproval.decision === "rejected"
                                  ? (data.ceoApproval.decision as "approved" | "rejected")
                                  : undefined,
                          notes: data.ceoApproval.notes,
                      }
                    : undefined,
            financeDetails:
                wf.financeDetails?.keys && data.financeDetails
                    ? {
                          totalCost:
                              data.financeDetails.totalCost != null
                                  ? typeof data.financeDetails.totalCost === "number"
                                      ? data.financeDetails.totalCost
                                      : Number(data.financeDetails.totalCost) || 0
                                  : undefined,
                          currency:
                              (data.financeDetails.currency as any)?._id ??
                              data.financeDetails.currency ??
                              undefined,
                          notes: data.financeDetails.notes,
                          estimatedCompletionDate: data.financeDetails.estimatedCompletionDate
                              ? typeof data.financeDetails.estimatedCompletionDate === "string"
                                  ? data.financeDetails.estimatedCompletionDate.split("T")[0]
                                  : new Date(data.financeDetails.estimatedCompletionDate as string)
                                        .toISOString()
                                        .split("T")[0]
                              : undefined,
                          costBreakdown: (data.financeDetails.costBreakdown || []).map((i) => ({
                              item: i.item || "",
                              cost: typeof i.cost === "number" ? i.cost : Number(i.cost) || 0,
                              quantity: i.quantity,
                              unit: i.unit,
                          })),
                      }
                    : undefined,
        } as EditModificationRequestFormType;
    },

    buildExtraTitles: (params, entityName) => [params.get("unitName") || "", entityName || ""],

    beforeSubmit: (data) => {
        if ((data as any).status === "completed") return "deliveredMessage";
        return null;
    },
});
