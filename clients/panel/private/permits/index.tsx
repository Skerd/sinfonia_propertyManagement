import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconShieldCheck} from "@tabler/icons-react";
import type {Permit} from "armonia/src/modules/propertyManagement/api/realEstate/private/permit/permit.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PermitCard from "@propertyManagementModule/clients/panel/private/permits/center/cardView/permitCard.tsx";
import SubmitPermit, {SUBMIT_PERMIT_ACTION} from "@propertyManagementModule/clients/panel/private/permits/center/actions/submit.tsx";
import MarkUnderReviewPermit, {MARK_UNDER_REVIEW_PERMIT_ACTION} from "@propertyManagementModule/clients/panel/private/permits/center/actions/markUnderReview.tsx";
import ApprovePermit, {APPROVE_PERMIT_ACTION} from "@propertyManagementModule/clients/panel/private/permits/center/actions/approve.tsx";
import RejectPermit, {REJECT_PERMIT_ACTION} from "@propertyManagementModule/clients/panel/private/permits/center/actions/reject.tsx";
import RenewPermit, {RENEW_PERMIT_ACTION} from "@propertyManagementModule/clients/panel/private/permits/center/actions/renew.tsx";
import SubmitPermitDialog from "@propertyManagementModule/components/custom/permits/submitPermitDialog.tsx";
import MarkUnderReviewPermitDialog from "@propertyManagementModule/components/custom/permits/markUnderReviewPermitDialog.tsx";
import ApprovePermitDialog from "@propertyManagementModule/components/custom/permits/approvePermitDialog.tsx";
import RejectPermitDialog from "@propertyManagementModule/components/custom/permits/rejectPermitDialog.tsx";
import RenewPermitDialog from "@propertyManagementModule/components/custom/permits/renewPermitDialog.tsx";

interface AllPermitsProps extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(permit: Permit) {
    const params = new URLSearchParams();
    params.set("permitId", permit._id);
    if (permit.name) params.set("permitName", permit.name);
    if (permit.project?._id) params.set("projectId", permit.project._id);
    if (permit.project?.name) params.set("projectName", permit.project.name);
    return `/realEstate/permits/edit?${params.toString()}`;
}

function AllPermits({resolveLanguageKey, projectId, projectName}: AllPermitsProps) {
    const extraFilters = projectId ? {projectId} : undefined;

    return (
        <EntityListPage<Permit>
            apiUrl="/api/realEstate/permit"
            collectionName="permits"
            accessModel="permits"
            tableConfigKey="permits"
            createPath={projectId
                ? `/realEstate/permits/create?projectId=${projectId}${projectName ? `&projectName=${encodeURIComponent(projectName)}` : ""}`
                : "/realEstate/permits/create"
            }
            createIcon={<IconShieldCheck className="h-4 w-4" />}
            createLanguageKey="createPermit"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/permits/center/sheetView/permitSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={extraFilters}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(permit, bindRowAction) => (
                <>
                    <SubmitPermit permit={permit} onAction={bindRowAction} />
                    <MarkUnderReviewPermit permit={permit} onAction={bindRowAction} />
                    <ApprovePermit permit={permit} onAction={bindRowAction} />
                    <RejectPermit permit={permit} onAction={bindRowAction} />
                    <RenewPermit permit={permit} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const onSuccess = (updated?: Permit) => {
                    if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    resetAction();
                };
                if (action === SUBMIT_PERMIT_ACTION)
                    return <SubmitPermitDialog open onClose={resetAction} permit={entity} onSuccess={onSuccess} />;
                if (action === MARK_UNDER_REVIEW_PERMIT_ACTION)
                    return <MarkUnderReviewPermitDialog open onClose={resetAction} permit={entity} onSuccess={onSuccess} />;
                if (action === APPROVE_PERMIT_ACTION)
                    return <ApprovePermitDialog open onClose={resetAction} permit={entity} onSuccess={onSuccess} />;
                if (action === REJECT_PERMIT_ACTION)
                    return <RejectPermitDialog open onClose={resetAction} permit={entity} onSuccess={onSuccess} />;
                if (action === RENEW_PERMIT_ACTION)
                    return <RenewPermitDialog open onClose={resetAction} permit={entity} onSuccess={onSuccess} />;
                return null;
            }}
            renderCard={(permit, onDelete, onRestore, listRef) => (
                <PermitCard
                    permit={permit}
                    onDelete={(row: Permit | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(permit)}
                    onActionSuccess={(updated?: Permit) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/permits/index.tsx"),
    withDebug(true, true, "permits"),
)(AllPermits);
