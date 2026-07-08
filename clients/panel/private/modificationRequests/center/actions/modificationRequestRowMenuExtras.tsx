import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {ModificationRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import ApproveModificationRequest from "@propertyManagementModule/clients/panel/private/modificationRequests/center/actions/approve.tsx";
import FinanceModificationRequest from "@propertyManagementModule/clients/panel/private/modificationRequests/center/actions/finance.tsx";
import DeliverModificationRequest from "@propertyManagementModule/clients/panel/private/modificationRequests/center/actions/deliver.tsx";
import CancelModificationRequest from "@propertyManagementModule/clients/panel/private/modificationRequests/center/actions/cancel.tsx";
import SubmitRevision from "@propertyManagementModule/clients/panel/private/modificationRequests/center/actions/submitRevision.tsx";
import ClientCostApprove from "@propertyManagementModule/clients/panel/private/modificationRequests/center/actions/clientCostApprove.tsx";
import {DropdownMenuSeparator} from "@coreModule/components/ui/dropdown-menu.tsx";

type ModificationRequestRowMenuExtrasProps = {
    request: ModificationRequest;
    onModified?: (updated?: ModificationRequest) => void;
    onAction?: (action: string) => void;
};

function getWriteFields(write: unknown) {
    return (write && typeof write === "object" ? write : {}) as Record<string, any>;
}

/** When false, the default Edit entry in `ActionMenu` should be hidden (workflow-specific edit gates). */
export function modificationRequestShouldHideEdit(request: ModificationRequest, write: unknown): boolean {
    const writeFields = getWriteFields(write);
    const status = request.status ?? "";
    const isCancelled = status === "cancelled";
    const architectPending = request.architectApproval?.decision === "pending";
    const architectRejected = request.architectApproval?.decision === "rejected";
    const engineerPending = request.engineerApproval?.decision === "pending";
    const engineerRejected = request.engineerApproval?.decision === "rejected";
    const ceoPending = request.ceoApproval?.decision === "pending";
    const ceoRejected = request.ceoApproval?.decision === "rejected";
    const ceoApproved = request.ceoApproval?.decision === "approved";
    const hasFinanceDetails = !!request.financeDetails;
    const currentStep: "architect" | "engineer" | "ceo" | "finance" | null = architectPending
        ? "architect"
        : architectRejected
          ? "architect"
          : engineerPending
            ? "engineer"
            : engineerRejected
              ? "engineer"
              : ceoPending
                ? "ceo"
                : ceoRejected
                  ? "ceo"
                  : ceoApproved &&
                      (hasFinanceDetails || status === "pending_finance" || status === "finance_completed")
                    ? "finance"
                    : null;

    const canEditStep =
        (isCancelled && writeFields.cancellationReason) ||
        (!isCancelled &&
            currentStep === "architect" &&
            (writeFields.title ||
                writeFields.description ||
                writeFields.specifications ||
                writeFields.architectApproval?.keys ||
                writeFields.cancellationReason)) ||
        (!isCancelled && currentStep === "engineer" && writeFields.engineerApproval?.keys) ||
        (!isCancelled && currentStep === "ceo" && writeFields.ceoApproval?.keys) ||
        (!isCancelled && currentStep === "finance" && writeFields.financeDetails?.keys);
    const showEdit = canEditStep && request.status !== "completed";
    return !showEdit;
}

/**
 * Custom `ActionMenu` children (workflow actions). View, Edit, Delete, Restore come from `ActionMenu`.
 */
export default function ModificationRequestRowMenuExtras({
    request,
    onAction,
}: ModificationRequestRowMenuExtrasProps) {
    const {write} = useAccess("modificationRequests");
    const writeFields = getWriteFields(write);
    const status = request.status ?? "";
    const isCancelled = status === "cancelled";
    const architectPending = request.architectApproval?.decision === "pending";
    const architectRejected = request.architectApproval?.decision === "rejected";
    const engineerPending = request.engineerApproval?.decision === "pending";
    const engineerRejected = request.engineerApproval?.decision === "rejected";
    const ceoPending = request.ceoApproval?.decision === "pending";
    const ceoRejected = request.ceoApproval?.decision === "rejected";
    const ceoApproved = request.ceoApproval?.decision === "approved";
    const hasFinanceDetails = !!request.financeDetails;
    const currentStep: "architect" | "engineer" | "ceo" | "finance" | null = architectPending
        ? "architect"
        : architectRejected
          ? "architect"
          : engineerPending
            ? "engineer"
            : engineerRejected
              ? "engineer"
              : ceoPending
                ? "ceo"
                : ceoRejected
                  ? "ceo"
                  : ceoApproved &&
                      (hasFinanceDetails || status === "pending_finance" || status === "finance_completed")
                    ? "finance"
                    : null;

    const canEditStep =
        (isCancelled && writeFields.cancellationReason) ||
        (!isCancelled &&
            currentStep === "architect" &&
            (writeFields.title ||
                writeFields.description ||
                writeFields.specifications ||
                writeFields.architectApproval?.keys ||
                writeFields.cancellationReason)) ||
        (!isCancelled && currentStep === "engineer" && writeFields.engineerApproval?.keys) ||
        (!isCancelled && currentStep === "ceo" && writeFields.ceoApproval?.keys) ||
        (!isCancelled && currentStep === "finance" && writeFields.financeDetails?.keys);
    const showEdit = canEditStep && request.status !== "completed";

    const showApprove =
        ((status === "pending_architect" || status === "pending_architect_revision") &&
            writeFields.architectApproval?.keys) ||
        ((status === "pending_engineer" || status === "pending_engineer_revision") &&
            writeFields.engineerApproval?.keys) ||
        (status === "pending_ceo" && writeFields.ceoApproval?.keys);

    const showFinance = writeFields.financeDetails?.keys && request.status === "pending_finance";
    const showClientCostApprove = write && request.status === "pending_client_approval";
    const showDeliver =
        write &&
        (request.status === "finance_completed" || request.status === "pending_delivery") &&
        request.deliveryApproval?.decision !== "approved";
    const showSubmitRevision =
        write && (request.status === "pending_architect_revision" || request.status === "pending_engineer_revision");
    const showCancel = write && !request.cancelledAt && request.status !== "completed";

    const hasItemsBeforeCancel = showEdit || showApprove || showSubmitRevision || showFinance || showClientCostApprove || showDeliver;

    return (
        <>
            {showApprove && (
                <>
                    {/*{showEdit && <DropdownMenuSeparator />}*/}
                    <ApproveModificationRequest onAction={onAction!} />
                </>
            )}
            {showSubmitRevision && (
                <>
                    {(showApprove) && <DropdownMenuSeparator />}
                    <SubmitRevision onAction={onAction!} />
                </>
            )}
            {showFinance && (
                <>
                    {(showApprove || showSubmitRevision) && <DropdownMenuSeparator />}
                    <FinanceModificationRequest onAction={onAction!} />
                </>
            )}
            {showClientCostApprove && (
                <>
                    {(showApprove || showSubmitRevision || showFinance) && <DropdownMenuSeparator />}
                    <ClientCostApprove onAction={onAction!} />
                </>
            )}
            {showDeliver && (
                <>
                    {(showApprove || showSubmitRevision || showFinance || showClientCostApprove) && <DropdownMenuSeparator />}
                    <DeliverModificationRequest onAction={onAction!} />
                </>
            )}
            {showCancel && (
                <>
                    {hasItemsBeforeCancel && <DropdownMenuSeparator />}
                    <CancelModificationRequest onAction={onAction!} />
                </>
            )}
        </>
    );
}
